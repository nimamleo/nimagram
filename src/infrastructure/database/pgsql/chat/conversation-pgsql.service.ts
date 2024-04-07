import { Injectable } from '@nestjs/common';
import { IConversationProvider } from '../../provider/chat/conversation.provider';
import {
  IConversation,
  IConversationEntity,
} from '../../../../models/chat/conversation.model';
import { Err, Ok, Result } from '../../../../common/result';
import { IChat, IChatEntity } from '../../../../models/chat/chat.model';
import { ILimitationOptions } from '../../../../common/pagination/limitation.interface';
import { HandleError } from '../../../../common/decorators/handler-error.decorator';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ConversationMemberEntity } from './entities/conversation-member.entity';
import { GenericErrorCode } from '../../../../common/errors/generic-error';
import { UserEntity } from '../user/entities/user.entity';
import { ChatEntity } from './entities/chat.entity';
import { response } from 'express';

@Injectable()
export class ConversationPgsqlService implements IConversationProvider {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(ConversationMemberEntity)
    private readonly conversationMemberRepository: Repository<ConversationMemberEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @HandleError
  async getConversationByUsers(
    userId: string,
    targetUserId: string,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.conversationMemberRepository
      .createQueryBuilder('cm')
      .leftJoin('cm.conversation', 'c', 'cm.conversation = c.id')
      .select([
        'cm.conversationId',
        'c.name',
        'c.image',
        'c.description',
        'c.notSeen',
        'c.lastChat',
        'c.type',
        'c.createdAt',
        'c.updatedAt',
      ])
      .where('cm.userId IN (:...ids) and c.type = :type', {
        ids: [+userId, +targetUserId],
        type: 'direct',
      })
      .groupBy(
        'cm.conversationId , c.name , c.image , c.description , c.notSeen , c.lastChat , c.type , c.createdAt , c.updatedAt',
      )
      .having('count(distinct cm."userId") = :num', { num: 2 })
      .getRawOne();

    if (!res) {
      return Err('conversation not found', GenericErrorCode.NOT_FOUND);
    }

    const conversation = new ConversationEntity();
    conversation.id = res.conversationId;
    conversation.name = res.c_name;
    conversation.image = res.c_image;
    conversation.description = res.c_description;
    conversation.type = res.c_type;
    conversation.notSeen = res.c_notSeen;
    conversation.lastChat = res.c_lastChat;
    conversation.members = [];
    conversation.chats = [];
    conversation.createdAt = res.c_createdAt;
    conversation.updatedAt = res.c_updatedAt;

    return Ok(ConversationEntity.toIConversationEntity(conversation));
  }

  @HandleError
  async getConversationById(
    conversationId: string,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.conversationRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.members', 'cm')
      .leftJoinAndSelect('cm.user', 'u')
      .where('c.id = :id', { id: +conversationId })
      .getOne();

    if (!res) {
      return Err('conversation not found', GenericErrorCode.NOT_FOUND);
    }

    return Ok(ConversationEntity.toIConversationEntity(res));
  }

  @HandleError
  async getConversationChats(
    conversationId: string,
    senderId: string,
    limitation: ILimitationOptions,
  ): Promise<Result<IChatEntity[]>> {
    const res = await this.chatRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.sender', 'cs', 'c.senderId = cs.id')
      .where('c.conversationId = :id', { id: +conversationId })
      .andWhere('c.deletedById != :userId or c.deletedById is null', {
        userId: +senderId,
      })
      .skip(limitation.skip)
      .limit(limitation.limit)
      .orderBy('c.createdAt', 'DESC')
      .getMany();

    return Ok(res.map((x) => ChatEntity.toIChatEntity(x)));
  }

  updateConversation(
    conversationId: string,
    iConversation: Partial<IConversation>,
  ): Promise<Result<IConversationEntity>> {
    return;
  }

  @HandleError
  async deleteConversation(conversationId: string): Promise<Result<boolean>> {
    await this.dataSource.transaction(async (entityManager) => {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from(ConversationMemberEntity)
        .where('conversationId = :id', { id: conversationId })
        .execute();

      await entityManager
        .createQueryBuilder()
        .delete()
        .from(ConversationEntity)
        .where('id = :id', { id: conversationId })
        .execute();
    });
    return Ok(true);
  }

  @HandleError
  async getConversationList(
    userId: string,
  ): Promise<Result<IConversationEntity[]>> {
    // const res1 = await this.userRepository.findOne({
    //   where: { id: +userId },
    //   relations: ['conversations.conversation.members.user'],
    // });
    const res = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.conversations', 'c', 'u.id = c.userId')
      .leftJoinAndSelect('c.conversation', 'cm')
      .leftJoinAndSelect('cm.members', 'cm2')
      .leftJoinAndSelect('cm2.user', 'cm3')
      .where('u.id = :userId', { userId: +userId })
      .orderBy('cm.lastChat', 'DESC')
      .getOne();
    return Ok(
      res.conversations.map((x) =>
        ConversationEntity.toIConversationEntity(x.conversation),
      ),
    );
  }

  @HandleError
  async startConversation(
    userId: string,
    targetUserId: string,
    iConversation: IConversation,
  ): Promise<Result<IConversationEntity>> {
    const newConversation = ConversationEntity.fromIConversation(iConversation);
    await this.dataSource.transaction(async (entityManager) => {
      const conversationRes = await entityManager.save(newConversation);
      const conversationMembers = [
        ConversationMemberEntity.fromIConversationMember({
          user: { id: userId },
          conversation: { id: conversationRes.id.toString() },
        }),

        ConversationMemberEntity.fromIConversationMember({
          user: { id: targetUserId },
          conversation: { id: conversationRes.id.toString() },
        }),
      ];
      newConversation.members = conversationMembers;
      await entityManager.save(conversationMembers);
    });

    return Ok(ConversationEntity.toIConversationEntity(newConversation));
  }

  @HandleError
  async deleteChat(
    chatId: string,
    senderId: string,
    deletedBy?: string,
  ): Promise<Result<boolean>> {
    if (deletedBy && Number(deletedBy) > 0) {
      const res = await this.chatRepository
        .createQueryBuilder()
        .update(ChatEntity)
        .set({ deletedBy: { id: +deletedBy } })
        .where('id = :chatId and senderId = :senderId', {
          chatId: +chatId,
          senderId: +senderId,
        })
        .execute();
      if (res.affected === 0) {
        return Ok(false);
      }
      return Ok(true);
    }

    const res = await this.chatRepository
      .createQueryBuilder()
      .delete()
      .from(ChatEntity)
      .where('id = :chatId and senderId = :senderId', {
        chatId: +chatId,
        senderId: +senderId,
      })
      .execute();

    if (res.affected === 0) {
    }
    return Ok(true);
  }

  @HandleError
  async seenChat(
    chatId: string,
    conversationId: string,
    userId: string,
  ): Promise<Result<boolean>> {
    await this.chatRepository
      .createQueryBuilder()
      .update(ChatEntity)
      .set({ seen: true })
      .where('id < :chatId and conversationId = :conversationId', {
        chatId: +chatId,
        conversationId: +conversationId,
      })
      .andWhere('senderId != :userId', { userId: +userId })
      .execute();

    return Ok(true);
  }

  @HandleError
  async sendChat(
    userId: string,
    targetUserId: string,
    iChat: IChat,
  ): Promise<Result<IChatEntity>> {
    const newChat = ChatEntity.fromIChat(iChat);
    let chat: ChatEntity;
    await this.dataSource.transaction(async (entityManger) => {
      chat = await entityManger.save(newChat);
      if (!chat) {
        return Err('create chat failed');
      }

      await entityManger
        .getRepository(ChatEntity)
        .createQueryBuilder()
        .update(ChatEntity)
        .set({ seen: true })
        .where('id < :chatId and conversationId = :conversationId', {
          chatId: chat.id,
          conversationId: iChat.conversation.id,
        })
        .andWhere('senderId != :userId', {
          userId: +userId,
        })

        .execute();
    });
    return Ok(ChatEntity.toIChatEntity(chat));
  }

  @HandleError
  async getChat(
    chatId: string,
    senderId: string,
  ): Promise<Result<IChatEntity>> {
    const res = await this.chatRepository
      .createQueryBuilder('ch')
      .where('ch.senderId = :senderId and ch.id = :chatId', {
        senderId: +senderId,
        chatId: +chatId,
      })
      .getOne();

    if (!res) {
      return Err('chat not found', GenericErrorCode.NOT_FOUND);
    }

    return Ok(ChatEntity.toIChatEntity(res));
  }

  @HandleError
  async editChat(
    chatId: string,
    senderId: string,
    iChat: Partial<IChat>,
  ): Promise<Result<IChatEntity>> {
    const res = await this.chatRepository
      .createQueryBuilder('ch')
      .update(ChatEntity)
      .set({
        content: iChat?.content,
        seen: iChat?.seen,
        isEdited: iChat?.isEdited,
        isDeleted: iChat?.isDeleted,
        filePath: iChat?.filePath,
      })
      .where('id = :chatId and senderId = :senderId', {
        chatId: +chatId,
        senderId: +senderId,
      })
      .returning('*')
      .updateEntity(true)
      .execute();
    if (res.affected === 0) {
      return Err('edit chat failed');
    }

    return Ok(ChatEntity.toIChatEntity(res.raw[0]));
  }

  @HandleError
  async sendChatToGroup(
    senderId: string,
    groupId: string,
    iChat: IChat,
  ): Promise<Result<IChatEntity>> {
    const newData = ChatEntity.fromIChat(iChat);
    const res = await this.chatRepository.save(newData);
    if (!res) {
      return Err('send chat to group failed');
    }

    return Ok(ChatEntity.toIChatEntity(res));
  }

  @HandleError
  async addMemberToGroup(
    userIds: string[],
    conversationId: string,
  ): Promise<Result<IConversationEntity>> {
    let conversation: ConversationEntity;
    await this.dataSource.transaction(async (entityManager) => {
      const users = userIds.map((x) =>
        ConversationMemberEntity.fromIConversationMember({
          user: { id: x },
          conversation: { id: conversationId },
        }),
      );
      const res = await entityManager.save(users);
      if (res.length === 0) {
        return Err('add member failed');
      }
      conversation = await entityManager
        .getRepository(ConversationEntity)
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.members', 'cm', 'c.id = cm.conversationId')
        .leftJoinAndSelect('cm.user', 'u', 'cm.userId =u.id ')
        .where('c.id = :id', { id: +conversationId })
        .getOne();
    });
    return Ok(ConversationEntity.toIConversationEntity(conversation));
  }

  @HandleError
  async getConversationNotSeenCount(
    conversationIds: string[],
  ): Promise<Result<Partial<IConversationEntity>[]>> {
    const data = await this.conversationRepository
      .createQueryBuilder('c')
      .select(['c.id', 'COUNT(ch.id) AS unseenCount'])
      .leftJoin('c.chats', 'ch', 'ch.conversationId = c.id')
      .where('ch.seen = :seen and c.id = ANY(:conversationIds) ', {
        seen: false,
        conversationIds: conversationIds.map((x) => +x),
      })
      .groupBy('c.id')
      .getRawMany();
    return Ok(
      data.map((x) =>
        ConversationEntity.toIConversationEntity({
          id: x.c_id.toString(),
          notSeen: x.unseencount,
        }),
      ),
    );
  }

  @HandleError
  async getGroupMembers(groupId: string): Promise<Result<string[]>> {
    const res = await this.conversationMemberRepository
      .createQueryBuilder('cm')
      .select(['cm.userId as memberId'])
      .where('cm.conversationId = :id', { id: +groupId })
      .getRawMany();
    return Ok(res.map((x) => x.memberid));
  }
}
