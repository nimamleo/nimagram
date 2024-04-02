import { IUser, IUserEntity } from '../../../../models/user/user.model';
import { Result } from '../../../../common/result';

export interface IUserReader {
  getUser(phone: string): Promise<Result<IUserEntity>>;
  getContactList(userId: string): Promise<Result<string[]>>;
  getBlockList(userId: string): Promise<Result<string[]>>;
  getUserById(id: string): Promise<Result<IUserEntity>>;
}
export interface IUserWriter {
  createUser(iUser: IUser): Promise<Result<IUserEntity>>;
  addContact(userId: string, targetUserId: string): Promise<Result<boolean>>;
  addBlock(userId: string, targetUserId: string): Promise<Result<boolean>>;
  updateUser(
    userId: string,
    iUSer: Partial<IUser>,
  ): Promise<Result<IUserEntity>>;
  createMany(): Promise<Result<any>>;
}
export interface IUserProvider extends IUserReader, IUserWriter {}

export const USER_DATABASE_PROVIDER = 'user-databse-provider';
