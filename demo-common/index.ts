import { z } from 'zod'
import { Socket } from 'socket.io-client'

export const max = 'max'
export const min = 'min'
export const needs =
  (compare: typeof max | typeof min, n: number) => (field: string) =>
    `${field} needs to be ${compare} ${n} characters`
export const required = (field: string) => `${field} is required`
export const msg = (field: string) => (f: (s: string) => string) => f(field)
const fn = msg('First name')
const ln = msg('Last name')
const email = msg('Email')

export const ZPublicUser = z.object({
  id: z.optional(z.string()),
  firstName: z
    .string({ required_error: fn(required) })
    .min(2, fn(needs(min, 2)))
    .max(30, fn(needs(max, 30))),
  lastName: z
    .string({ required_error: ln(required) })
    .min(2, ln(needs(min, 2)))
    .max(30, ln(needs(max, 30))),
  email: z
    .string({ required_error: email(required) })
    .email('Invalid email address')
    .max(100, email(needs(max, 100)))
})

export type PublicUser = z.infer<typeof ZPublicUser>;

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

export interface CurrencyQuote {
  currency: Currency,
  quote: number,
}

export interface ServerToClientEvents {
  connect: () => void,
  connect_error: (err: Error) => void,
  disconnect: (
    reason: Socket.DisconnectReason,
    description?:
      | Error
      | {
      description: string;
      context?: unknown;
    }
  ) => void,
  'user:created': (user: PublicUser) => void,
  'currency:quotes': (cq: CurrencyQuote[]) => void,
}

export interface ClientToServerEvents {
  'users:create': (
    user: PublicUser,
    callback: (res: SocketResponse) => void
  ) => void,
}

export interface SocketResponse {
  data?: any;
  error?: string;
}
