import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { IUserProvider } from '../../provider/user/user.provider';
import { IUser, IUserEntity } from '../../../../models/user/user.model';
import { Err, Ok, Result } from '../../../../common/result';
import { HandleError } from '../../../../common/decorators/handler-error.decorator';
import { GenericErrorCode } from '../../../../common/errors/generic-error';
import { ContactEntity } from './entities/contact.entity';
import { UserBlockEntity } from './entities/user-block.entity';
import { ConversationMemberEntity } from '../chat/entities/conversation-member.entity';

@Injectable()
export class UserPgsqlService implements IUserProvider {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ContactEntity)
    private readonly contactRepository: Repository<ContactEntity>,
    @InjectRepository(UserBlockEntity)
    private readonly blockRepository: Repository<UserBlockEntity>,
  ) {}

  @HandleError
  async createUser(iUser: IUser): Promise<Result<IUserEntity>> {
    const newUser = UserEntity.fromIUser(iUser);
    const res = await this.userRepository.save(newUser);
    if (!res) {
      return Err('create user failed');
    }
    return Ok(UserEntity.toIUserEntity(res));
  }

  @HandleError
  async getUser(phone: string): Promise<Result<IUserEntity>> {
    const res = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.conversations', 'cm', 'cm.userId = u.id')
      .innerJoinAndSelect('cm.conversation', 'c')
      .where('u.phone = :phone', { phone: phone })
      .getOne();
    if (!res) {
      return Err('user not found', GenericErrorCode.NOT_FOUND);
    }

    return Ok(UserEntity.toIUserEntity(res));
  }

  @HandleError
  async updateUser(
    userId: string,
    iUSer: Partial<IUser>,
  ): Promise<Result<IUserEntity>> {
    const newData = UserEntity.fromIUser({
      name: iUSer.name,
      avatar: iUSer.avatar,
      rfToken: iUSer.rfToken,
      bio: iUSer.bio,
      contacts: [],
      conversations: [],
      blockedUsers: [],
      phone: null,
      lastOnline: null,
      username: null,
    });
    const res = await this.userRepository
      .createQueryBuilder('u')
      .update(UserEntity)
      .set({
        rfToken: newData.rfToken,
        name: newData.name,
        avatar: newData.avatar,
        bio: newData.bio,
      })
      .where('id = :userId', { userId: userId })
      .returning('*')
      .updateEntity(true)
      .execute();
    if (res.affected === 0) {
      return Err('updated user failed');
    }
    return Ok(UserEntity.toIUserEntity(res.raw[0]));
  }

  @HandleError
  async getUserById(id: string): Promise<Result<IUserEntity>> {
    const res = await this.userRepository
      .createQueryBuilder('u')
      .where('u.id = :userId', { userId: +id })
      .getOne();
    if (!res) {
      return Err('user not found', GenericErrorCode.NOT_FOUND);
    }
    return Ok(UserEntity.toIUserEntity(res));
  }

  createMany(): Promise<Result<any>> {
    return;
  }

  @HandleError
  async addContact(
    userId: string,
    targetUserId: string,
  ): Promise<Result<boolean>> {
    const addContact = this.contactRepository.create({
      user: { id: +userId },
      contact: { id: +targetUserId },
    });

    const res = await addContact.save();
    if (!res) {
      return Err('add contact failed');
    }

    return Ok(true);
  }

  @HandleError
  async getBlockList(userId: string): Promise<Result<string[]>> {
    const res = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.blockedUsers', 'uBlocked')
      .leftJoinAndSelect('uBlocked.blocked', 'ub')
      .where('u.id = :userId', { userId: +userId })
      .getOne();
    return Ok(res?.blockedUsers?.map((x) => x?.blocked?.id.toString()));
  }

  @HandleError
  async addBlock(
    userId: string,
    targetUserId: string,
  ): Promise<Result<boolean>> {
    const addBlock = this.blockRepository.create({
      blocked: { id: +targetUserId },
      blocker: { id: +userId },
    });

    const res = await addBlock.save();

    if (!res) {
      return Err('add block failed');
    }

    return Ok(true);
  }

  @HandleError
  async getContactList(userId: string): Promise<Result<string[]>> {
    const res = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.contacts', 'c')
      .leftJoinAndSelect('c.contact', 'uc')
      .where('u.id = :userId', { userId })
      .getOne();

    return Ok(res?.contacts?.map((x) => x?.contact?.id.toString()));
  }
}
