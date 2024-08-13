import axios, { type AxiosResponse, AxiosError } from 'axios'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { Maybe } from 'purify-ts/Maybe'
import useSession, { type Credentials } from '../session'
import { type PublicUser } from 'demo-common'
import { type Either, EitherAsync, Tuple } from 'purify-ts'
import { CustomError } from 'ts-custom-error'

axios.defaults.baseURL = 'http://localhost:8080/'

export class HttpError extends CustomError {
  public readonly status: number | undefined

  constructor(err: AxiosError | Error) {
    super(err.message)
    if (err instanceof AxiosError) {
      this.status = err.status
      this.message = err.response?.data
    }
  }
}

const PATH_REGISTER = '/auth/register'
const PATH_LOGIN = '/auth/login'
const PATH_LOGOUT = '/auth/logout'
const PATH_REFRESH_TOKEN = '/auth/tokens'
const privateUrls = [PATH_LOGOUT]

axios.defaults.headers.common['Cache-Control'] = 'no-cache'

axios.interceptors.request.use(async (config) => {
  config.withCredentials = true
  const isPrivateUrl = Maybe.fromNullable(config.url)
    .map((url) => privateUrls.includes(url))
    .orDefault(false)
  if (isPrivateUrl) {
    return (
      await tryRefreshTokenAsync()
        .map((jwt) => {
          config.headers['Authorization'] = `Bearer ${jwt}`
          return config
        })
        .ifLeft((err) => {
          throw err
        })
        .run()
    ).orDefault(config)
  } else {
    return Promise.resolve(config)
  }
})

function eitherAsyncFetchData<A>(f: () => Promise<AxiosResponse<A>>) {
  return EitherAsync(f)
    .mapLeft((err) => new HttpError(err as Error | AxiosError))
    .map((response) => response.data)
}

const tryFetchData = <A>(f: () => Promise<AxiosResponse<A>>): Promise<Either<HttpError, A>> =>
  eitherAsyncFetchData(f).run()

const tryLogout = async (onResponse: (e: Either<HttpError, void>) => void) => {
  const e = await tryFetchData(() => axios.get<void>(PATH_LOGOUT))
  onResponse && onResponse(e)
}

const tryLogin = async (
  c: Credentials,
  onResponse: (e: Either<HttpError, string>) => void
): Promise<void> => {
  const e = await tryFetchData(() => axios.post<string>(PATH_LOGIN, c))
  onResponse && onResponse(e)
}

const tryRefreshTokenAsync = (): EitherAsync<HttpError, string> => {
  const { session } = useSession()
  return Maybe.fromNullable(session.value.jwt)
    .chain((jwt) =>
      Maybe.fromNullable(jwtDecode<JwtPayload>(jwt).exp).map((exp) => Tuple(jwt, exp))
    )
    .filter((jwtWithExp) => jwtWithExp.snd() > Date.now() / 1000)
    .map((jwtWithExp) => EitherAsync<HttpError, string>(() => Promise.resolve(jwtWithExp.fst())))
    .orDefaultLazy(() => eitherAsyncFetchData(() => axios.get<string>(PATH_REFRESH_TOKEN)))
}

const tryRefreshToken = (): Promise<Either<HttpError, string>> => {
  return tryRefreshTokenAsync().run()
}

const tryRegister = async (
  user: PublicUser & { password: string },
  onResponse: (e: Either<HttpError, void>) => void
): Promise<void> => {
  const e = await tryFetchData(() => axios.post<void>(PATH_REGISTER, user))
  onResponse && onResponse(e)
}

const restApi = {
  tryRegister,
  tryRefreshToken,
  tryLogin,
  tryLogout
}

export default restApi
