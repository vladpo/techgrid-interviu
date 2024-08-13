import { z } from "zod";
import { Socket } from "socket.io-client";
export declare const max = "max";
export declare const min = "min";
export declare const needs: (
  compare: typeof max | typeof min,
  n: number,
) => (field: string) => string;
export declare const required: (field: string) => string;
export declare const msg: (
  field: string,
) => (f: (s: string) => string) => string;
export declare const ZPublicUser: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    firstName: string;
    lastName: string;
    email: string;
    id?: string | undefined;
  },
  {
    firstName: string;
    lastName: string;
    email: string;
    id?: string | undefined;
  }
>;
export type PublicUser = z.infer<typeof ZPublicUser>;
export declare enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
}
export interface CurrencyQuote {
  currency: Currency;
  quote: number;
}
export interface ServerToClientEvents {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (
    reason: Socket.DisconnectReason,
    description?:
      | Error
      | {
          description: string;
          context?: unknown;
        },
  ) => void;
  "user:created": (user: PublicUser) => void;
  "currency:quotes": (cq: CurrencyQuote[]) => void;
}
export interface ClientToServerEvents {
  "users:create": (
    user: PublicUser,
    callback: (res: SocketResponse) => void,
  ) => void;
}
export interface SocketResponse {
  data?: any;
  error?: string;
}
