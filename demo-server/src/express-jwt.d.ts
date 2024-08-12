import { PublicUser } from "./user";

export {};
declare global {
  namespace Express {
    interface User extends PublicUser {}

    interface Request {
      user?: User | undefined;
    }
  }
}
