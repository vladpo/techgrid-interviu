import mongoose, { Error, QueryWithHelpers } from 'mongoose'
import { AppError } from '../commons'
import { Maybe } from 'purify-ts/Maybe'
import { EitherAsync, identity } from 'purify-ts'

mongoose.set('strictQuery', false)

export class DbError extends AppError {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message, status)
  }
}

export async function createDbConnect(): Promise<void> {
  try {
    await mongoose.connect('mongodb://localhost:27017/demo')
    console.log('Connected to DB')
  } catch (err) {
    console.log(err)
    throw err
  }
}

export function tryQuery<ResultType, DocType>(
  f: () => QueryWithHelpers<ResultType | null, DocType>,
  errorMsg: string,
): EitherAsync<DbError, Maybe<ResultType>> {
  return EitherAsync(async () => {
    try {
      return Maybe.fromNullable(await f().exec().then(identity))
    } catch (e) {
      console.log(e)
      if (e instanceof Error.CastError) {
        throw new DbError(errorMsg, 500)
      } else {
        throw new DbError('Can\'t query database', 500)
      }
    }
  })
}
