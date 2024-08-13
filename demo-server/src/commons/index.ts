import {Maybe} from 'purify-ts/Maybe'
import {CustomError} from 'ts-custom-error'
import {Error, QueryOptions} from 'mongoose'
import {z, ZodError} from 'zod'
import {Left, Right} from 'purify-ts'
import {Either} from 'purify-ts/Either'

class AppError extends CustomError implements Error {
    readonly status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

const serverError = (message: string) => new AppError(message, 500)

const badRequestError = (message: string) => new AppError(message, 400)
const unAuthorizedRequestError = (message: string) => new AppError(message, 401)

class Email {
    private constructor(public readonly value: string) {
    }

    static maybe(value: string): Maybe<Email> {
        return Maybe.fromPredicate(
            () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase()),
            new Email(value)
        )
    }
}

const mkString = <A extends Object>(
    as: A[],
    sep: string = ', ',
    prefix: string = '',
    suffix: string = ''
) => {
    return (
        as.reduce((acc: string, a: A) => {
            if (acc === '') {
                return a.toString()
            }
            return acc + sep + a.toString()
        }, prefix) + suffix
    )
}

export const tryParse = <ZSchema extends z.ZodTypeAny>(
    schema: ZSchema,
    a: any,
    toAppError: (zodMsg: string) => AppError = badRequestError
): Either<AppError, z.infer<ZSchema>> => {
    try {
        return Right(schema.parse(a))
    } catch (err) {
        const zodError = err as ZodError
        return Left(toAppError(mkString(zodError.errors.map((ze) => ze.message))))
    }
}

export const zodKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
    if (schema === null || schema === undefined) return []
    if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
        return zodKeys(schema.unwrap())
    if (schema instanceof z.ZodArray) return zodKeys(schema.element)
    if (schema instanceof z.ZodObject) {
        const entries = Object.entries(schema.shape)
        return entries.flatMap(([key, value]) => {
            const nested =
                value instanceof z.ZodType ? zodKeys(value).map((subKey) => `${key}.${subKey}`) : []
            return nested.length ? nested : [key]
        })
    }
    return []
}

const QO: QueryOptions = {
    new: true
}

export type NonNullableFields<T> = {
    [P in keyof T]: NonNullable<T[P]>
}

const onlyDefined = <A extends Object>(a: A): NonNullableFields<A> => {
    return Object.entries(a).reduce((acc, entry) => {
        const key = entry[0] as keyof A
        const value = entry[1] as A[keyof A]
        if (value) {
            if (value instanceof Object) {
                acc[key] = onlyDefined(value) as NonNullable<A[keyof A]>
            }
            acc[key] = value
        }
        return acc
    }, {} as NonNullableFields<A>)
}

const Id = z.object({id: z.string()})
type Id = z.infer<typeof Id>

const EU_BUCHAREST = 'Europe/Bucharest'

export {
    Email,
    AppError,
    serverError,
    badRequestError,
    mkString,
    QO,
    onlyDefined,
    Id,
    EU_BUCHAREST,
    unAuthorizedRequestError
}
