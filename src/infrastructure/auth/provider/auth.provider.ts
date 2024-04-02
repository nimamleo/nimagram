import { Result } from '../../../common/result';
import { IVerifyUser } from '../../../models/verify-user.model';
import { IUser, IUserEntity } from '../../../models/user/user.model';

export interface IAuthProvider {
  signToken(iUser: Partial<IUser>): Promise<Result<IVerifyUser>>;
  verifyToken(token: string): Promise<Result<IUserEntity>>;
  refreshToken(acToken: string): Promise<Result<IVerifyUser>>;
}

export const AUTH_JWT_PROVIDER = 'auth-jwt-provider';
