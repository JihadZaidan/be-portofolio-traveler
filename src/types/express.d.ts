import { UserAttributes } from '../models/User.model.ts';

declare global {
  namespace Express {
    export interface Request {
      user?: UserAttributes;
    }
  }
}
