import { Injectable } from '@nestjs/common';
import { IUserProvider } from '../../provider/user/user.provider';
import { IUser, IUserEntity } from '../../../../models/user/user.model';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { HandleError } from '../../../../common/decorators/handler-error.decorator';
import { Err, Ok, Result } from '../../../../common/result';
import { fromIUser, toIUserEntity } from './entities/user-prisma.entity';
import { GenericErrorCode } from '../../../../common/errors/generic-error';
import { toIConversationEntity } from '../chat/entities/conversation.entity';
import { Prisma } from '@prisma/client';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/typeOrm/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserPgsqlService implements IUserProvider {
  constructor(
    private readonly prisma: PrismaService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  @HandleError
  async createUser(iUser: IUser): Promise<Result<IUserEntity>> {
    const newUser = fromIUser(iUser);
    const res = await this.prisma.user.create({ data: { ...newUser } });
    if (!res) {
      return Err('create user failed', GenericErrorCode.INTERNAL);
    }

    return Ok(toIUserEntity(res));
  }

  @HandleError
  async getUser(phone: string): Promise<Result<IUserEntity>> {
    const res = await this.prisma.user.findUnique({
      where: { phone: phone },
      include: {
        conversations: {
          select: {
            conversation: {
              select: { id: true },
            },
          },
        },
      },
    });
    if (!res) {
      return Err('user not found', GenericErrorCode.NOT_FOUND);
    }

    const user: IUserEntity = toIUserEntity({
      id: res.id,
      name: res.name,
      username: res.name,
      bio: res.bio,
      avatar: res.avatar,
      phone: res.phone,
      lastOnline: res.lastOnline,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
    });

    user.conversations = res.conversations.map((x) => {
      return {
        id: x.conversation.id.toString(),
      };
    });

    return Ok(user);
  }

  @HandleError
  async addContact(
    userId: string,
    targetUserId: string,
  ): Promise<Result<boolean>> {
    const res = await this.prisma.contacts.create({
      data: { userId: +userId, contactId: +targetUserId },
    });
    if (!res) {
      return Err('create contact failed');
    }
    return Ok(true);
  }

  @HandleError
  async getContactList(userId: string): Promise<Result<string[]>> {
    const res = await this.prisma.user.findFirst({
      where: { id: +userId },
      include: { contacts: true },
    });

    return Ok(res.contacts.map((x) => x.contactId.toString()));
  }

  @HandleError
  async addBlock(
    userId: string,
    targetUserId: string,
  ): Promise<Result<boolean>> {
    const res = await this.prisma.blockUsers.create({
      data: {
        blockerId: +userId,
        blockedId: +targetUserId,
      },
    });
    if (!res) {
      return Err('block user failed');
    }
    return Ok(true);
  }

  @HandleError
  async getBlockList(userId: string): Promise<Result<string[]>> {
    const res = await this.prisma.user.findFirst({
      where: { id: +userId },
      include: { blockerUsers: true },
    });
    return Ok(res.blockerUsers.map((x) => x.blockedId.toString()));
  }

  @HandleError
  async getUserById(id: string): Promise<Result<IUserEntity>> {
    const res = await this.prisma.user.findUnique({
      where: {
        id: +id,
      },
    });
    if (!res) {
      return Err('user not found', GenericErrorCode.NOT_FOUND);
    }

    return Ok(toIUserEntity(res));
  }

  @HandleError
  async updateUser(
    userId: string,
    iUSer: Partial<IUser>,
  ): Promise<Result<IUserEntity>> {
    const res = await this.prisma.user.update({
      where: { id: +userId },
      data: {
        name: iUSer?.name,
        bio: iUSer?.bio,
        avatar: iUSer?.avatar,
        rfToken: iUSer?.rfToken,
      },
    });
    if (!res) {
      return Err('updated user failed', GenericErrorCode.INTERNAL);
    }

    return Ok(toIUserEntity(res));
  }

  createMany(): Promise<Result<any>> {
    return;
  }
}
