import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import { PublicUser, ZPublicUser } from "demo-common";
import { AppUser, ZAppUser } from "../user";
import { createUser, findByEmail } from "../user";
import jwt from "jsonwebtoken";
import { EitherAsync, Tuple } from "purify-ts";
import {
  AppError,
  badRequestError,
  Email,
  serverError,
  tryParse,
  unAuthorizedRequestError,
} from "../commons";
import { Maybe } from "purify-ts/Maybe";
import { Either } from "purify-ts/Either";
import logger from "../logging";
import ms from "ms";
import { expressjwt, Request as JWTRequest } from "express-jwt";
import { CookieOptions } from "express-serve-static-core";

const JWT_REFRESH_EXP = "1d";
const JWT_EXP = "1m";
const strategyId = "local";
const BCRYPT_ROUNDS = 10;
const JWT_SECRET = "top-secret-key";
const JWT_ALGORITHM = "HS512";
const PATH_TOKENS = "/tokens";
const COOKIE_REFRESH_TOKEN = "jwrt";

passport.use(
  strategyId,
  new Strategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done) => {
      await EitherAsync.liftEither(
        Email.maybe(email).toEither(
          badRequestError(`Invalid email address: ${email}`),
        ),
      )
        .chain((email) => findByEmail(email))
        .chain((mu) =>
          EitherAsync.liftEither(
            mu.toEither(badRequestError(`Can"t find user with email ${email}`)),
          ),
        )
        .chain((u) => compareResponse(password, u))
        .chain((u) =>
          EitherAsync.liftEither(
            tryParse(
              ZPublicUser,
              u,
              () => new AppError("Ups Server error", 500),
            ),
          ),
        )
        .ifLeft((err) => done(err, false))
        .ifRight((u) => done(undefined, u))
        .run();
    },
  ),
);

const compareResponse = (
  password: string,
  user: AppUser,
): EitherAsync<string, AppUser> => {
  return EitherAsync(() => bcrypt.compare(password, user.password))
    .mapLeft((err) => (err as Error).message)
    .chain((isSamePassword) =>
      EitherAsync.liftEither(
        Maybe.fromFalsy(isSamePassword)
          .toEither("Incorrect password")
          .map(() => user),
      ),
    );
};

const login = function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    strategyId,
    (err: AppError | undefined, user: PublicUser | false | null) => {
      if (user) {
        const token = generateJwtToken(user, JWT_EXP);
        const cookie = refreshTokenCookie(
          generateJwtToken(user, JWT_REFRESH_EXP),
        );
        return res
          .cookie(cookie.name, cookie.value, cookie.options)
          .status(200)
          .json(token);
      } else {
        err
          ? res.status(err.status).json(err.message)
          : res.status(401).json("Email and password are required");
      }
    },
  )(req, res, next);
};

function generateJwtToken(user: PublicUser, expiresIn: string) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: expiresIn,
    algorithm: JWT_ALGORITHM,
  });
}

const register = async (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Body ${JSON.stringify(req.body)}`);
  await EitherAsync.liftEither(tryParse(ZAppUser, req.body))
    .chain((u) =>
      EitherAsync(() => bcrypt.genSalt(BCRYPT_ROUNDS))
        .mapLeft(() => serverError('Can"t generate salt'))
        .chain((salt) =>
          EitherAsync(() => bcrypt.hash(u.password, salt))
            .mapLeft(() => serverError('Can"t encrypt password'))
            .map((password) => ({ ...u, password })),
        ),
    )
    .chain(createUser)
    .ifLeft((err) => res.status(err.status).json(err.message))
    .ifRight(() => res.status(200).send())
    .run();
};

const logout = (req: Request, res: Response, next: NextFunction) => {
  const cookie = refreshTokenCookie("", Date.now() - 10000);
  res.cookie(cookie.name, "", cookie.options).status(200).send();
};

const refreshTokens = (req: JWTRequest, res: Response, next: NextFunction) => {
  Maybe.fromPredicate<string>((t) => !!t)(req.cookies[COOKIE_REFRESH_TOKEN])
    .toEither(unAuthorizedRequestError("Session expired"))
    .chain((refreshToken) =>
      Either.encase(() => jwt.verify(refreshToken, JWT_SECRET)).mapLeft(() =>
        serverError('Can"t verify refresh token'),
      ),
    )
    .chain((jwtPayload) => tryParse(ZPublicUser, jwtPayload))
    .map((u) =>
      Tuple(
        refreshTokenCookie(generateJwtToken(u, JWT_REFRESH_EXP)),
        generateJwtToken(u, JWT_EXP),
      ),
    )
    .ifRight((t) =>
      res
        .cookie(t.fst().name, t.fst().value, t.fst().options)
        .status(200)
        .json(t.snd()),
    )
    .ifLeft((err) => {
      res.status(err.status).json(err.message);
    });
};

function refreshTokenCookie(
  refreshToken: string,
  expiresMillis: number = Date.now() + ms(JWT_REFRESH_EXP),
) {
  const cookieOptions: CookieOptions = {
    path: `/auth${PATH_TOKENS}`,
    sameSite: "lax",
    expires: new Date(expiresMillis),
    httpOnly: true,
  };
  return {
    name: COOKIE_REFRESH_TOKEN,
    value: refreshToken,
    options: cookieOptions,
  };
}

export const authRouter = express.Router();
export const verifyJwt = expressjwt({
  secret: JWT_SECRET,
  algorithms: [JWT_ALGORITHM],
  requestProperty: "user",
});

authRouter.post("/login", login);
authRouter.get("/logout", verifyJwt, logout);
authRouter.post("/register", register);
authRouter.get(PATH_TOKENS, refreshTokens);
