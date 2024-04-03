import { Inject, Injectable } from '@nestjs/common';
import {
  IUserProvider,
  USER_DATABASE_PROVIDER,
} from '../../infrastructure/database/provider/user/user.provider';
import { HandleError } from '../../common/decorators/handler-error.decorator';
import { IUser, IUserEntity } from '../../models/user/user.model';
import { Err, Ok, Result } from '../../common/result';
import { GenericErrorCode } from '../../common/errors/generic-error';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_DATABASE_PROVIDER)
    private readonly userRepository: IUserProvider,
  ) {}

  @HandleError
  async createUser(iUser: IUser): Promise<Result<IUserEntity>> {
    const res = await this.userRepository.createUser(iUser);
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async addContact(
    userId: string,
    targetPhone: string,
  ): Promise<Result<boolean>> {
    const getUser = await this.userRepository.getUser(targetPhone);
    if (getUser.isError()) {
      return Err(getUser.err, GenericErrorCode.INTERNAL);
    }
    const contactExist = await this.userRepository.getContactList(userId);
    if (contactExist.isError()) {
      return Err(contactExist.err, GenericErrorCode.INTERNAL);
    }
    if (contactExist.value.includes(getUser.value.id)) {
      return Ok(true);
    }
    const res = await this.userRepository.addContact(userId, getUser.value.id);
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async blockUser(
    userId: string,
    targetPhone: string,
  ): Promise<Result<boolean>> {
    const targetUser = await this.userRepository.getUser(targetPhone);
    if (targetUser.isError()) {
      return Err(targetUser.err, GenericErrorCode.INTERNAL);
    }
    const blockList = await this.userRepository.getBlockList(userId);
    console.log();
    if (blockList.isError()) {
      return Err(blockList.err, GenericErrorCode.INTERNAL);
    }
    if (blockList.value.includes(targetUser.value.id)) {
      return Ok(true);
    }

    const blockUser = await this.userRepository.addBlock(
      userId,
      targetUser.value.id,
    );
    if (blockUser.isError()) {
      return Err(blockUser.err, GenericErrorCode.INTERNAL);
    }

    return Ok(true);
  }

  @HandleError
  async IsUserBlocked(
    userId: string,
    targetUserId: string,
  ): Promise<Result<boolean>> {
    const blockList = await this.userRepository.getBlockList(userId);
    if (blockList.isError()) {
      return Err(blockList.err, GenericErrorCode.INTERNAL);
    }

    if (!blockList.value.includes(targetUserId.toString())) {
      return Ok(false);
    }

    return Ok(true);
  }

  @HandleError
  async getUserById(id: string): Promise<Result<IUserEntity>> {
    const res = await this.userRepository.getUserById(id);
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async getUser(phone: string): Promise<Result<IUserEntity>> {
    const user = await this.userRepository.getUser(phone);
    if (user.isError()) {
      return Err(user.err);
    }

    return Ok(user.value);
  }

  @HandleError
  async updateUser(
    userId: string,
    iUSer: Partial<IUser>,
  ): Promise<Result<IUserEntity>> {
    const res = await this.userRepository.updateUser(userId, iUSer);
    if (res.isError()) {
      return Err(res.err);
    }

    return Ok(res.value);
  }
}
