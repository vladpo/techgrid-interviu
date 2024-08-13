import express, { Request, Response, Router } from 'express'
import { Document, Error, Model, model, ObjectId, QueryWithHelpers, Schema } from 'mongoose'
import { badRequestError, Email, onlyDefined, QO, tryParse, zodKeys } from '../commons'
import { DbError, tryQuery } from '../db'
import { always, EitherAsync } from 'purify-ts'
import { Maybe } from 'purify-ts/Maybe'
import logger from '../logging'
import { verifyJwt } from '../authentication'
import { max, min, msg, needs, PublicUser, required, ZPublicUser } from 'demo-common'
import { z } from 'zod'

const pwd = msg('Password')

export const ZAppUser = ZPublicUser.merge(
  z.object({
    password: z
      .string({ required_error: pwd(required) })
      .min(6, pwd(needs(min, 6)))
      .max(30, pwd(needs(max, 30)))
  })
)

export type AppUser = z.infer<typeof ZAppUser>

interface UserBaseDocument extends AppUser, Document<ObjectId> {
  id: string
}

interface UserModel extends Model<UserDocument> {}

export type UserDocument = UserBaseDocument

const UserSchema = new Schema<UserDocument, UserModel>({
  firstName: {
    type: String,
    required: true,
    index: true
  },
  lastName: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true
  }
})

let schemaOptions = {
  virtuals: true,
  versionKey: false,
  transform: function (doc: Document, ret: Record<string, any>) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
}

UserSchema.set('toJSON', schemaOptions)

const Users = model<UserDocument>('User', UserSchema)

export async function fetchUsers(req: Request, res: Response) {
  const result = await Users.find()
  res.json(result)
}

function tryUserQuery(
  f: () => QueryWithHelpers<UserDocument | null, UserDocument>,
  message: string
): EitherAsync<DbError, Maybe<AppUser>> {
  return tryQuery<AppUser, UserDocument>(f, message)
}

const msgMissingId = (id: string) => `Can't find user with ID ${id}`

function findUserById(id: string): EitherAsync<DbError, Maybe<AppUser>> {
  return tryUserQuery(() => Users.findById<UserDocument>(id), msgMissingId(id))
}

export function fetchUser(req: Request, res: Response) {
  return EitherAsync.liftEither(
    Maybe.fromNullable(req.params.id).toEither(badRequestError('User ID is required'))
  )
    .chain(findUserById)
    .ifLeft((err) => res.status(err.status).json(err.message))
    .ifRight((u) =>
      u
        .map((u) => res.status(200).json(u))
        .orDefault(res.status(400).json(msgMissingId(req.params.id)))
    )
    .run()
}

export function findByEmail(email: Email): EitherAsync<DbError, Maybe<AppUser>> {
  return tryUserQuery(
    () => Users.findOne<UserDocument>({ email: email.value }, zodKeys(ZAppUser), QO),
    `Can't find user with email ${email.value}`
  )
}

export function createUser(user: AppUser): EitherAsync<DbError, AppUser> {
  return EitherAsync(async () => {
    try {
      return await Users.create(user)
    } catch (err) {
      logger.error(err)
      if (err instanceof Error) {
        throw new DbError(err.message, 500)
      } else {
        throw new DbError('I dont know??', 500)
      }
    }
  })
}

export const userRouter: Router = express.Router()

userRouter.get('/users', verifyJwt, fetchUsers)
userRouter.get('/users/:id', verifyJwt, fetchUser)
