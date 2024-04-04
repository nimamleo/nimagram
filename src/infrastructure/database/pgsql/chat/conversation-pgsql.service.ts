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
import { DataSource, Repository } from 'typeorm';
import { ConversationMemberEntity } from './entities/conversation-member.entity';
import { GenericErrorCode } from '../../../../common/errors/generic-error';
import { ConversationType } from '../../../../enum/conversation-type';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class ConversationPgsqlService implements IConversationProvider {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(ConversationMemberEntity)
    private readonly conversationMemberRepository: Repository<ConversationMemberEntity>,
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

  getConversationById(
    conversationId: string,
  ): Promise<Result<IConversationEntity>> {
    return;
  }
  getConversationChats(
    conversationId: string,
    senderId: string,
    limitation: ILimitationOptions,
  ): Promise<Result<IChatEntity[]>> {
    return;
  }

  updateConversation(
    conversationId: string,
    iConversation: Partial<IConversation>,
  ): Promise<Result<IConversationEntity>> {
    return;
  }
  deleteConversation(conversationId: string): Promise<Result<boolean>> {
    return;
  }

  @HandleError
  async getConversationList(
    userId: string,
  ): Promise<Result<IConversationEntity[]>> {
    // const res = await this.conversationRepository
    //   .createQueryBuilder('c')
    //   .leftJoinAndSelect(
    //     'conversationMembers',
    //     'cm',
    //     'cm.conversationId = c.id',
    //   )
    //   .where('cm.userId = :userId', { userId: +userId })
    //   .orderBy('c.lastChat', 'DESC')
    //   .getMany();
    // return Ok(res.map((x) => ConversationEntity.toIConversationEntity(x)));

    const res = await this.conversationRepository
      .createQueryBuilder('c')
      .select('sub.*')
      .addSelect('u.*')
      .from((subQuery) => {
        return subQuery
          .select('*')
          .from(ConversationEntity, 'c')
          .leftJoin(
            ConversationMemberEntity,
            'cm',
            'cm."conversationId" = c.id',
          )
          .where(
            'c.id IN (SELECT cm2."conversationId" FROM "conversationMembers" cm2 WHERE cm2."userId" = :userId)',
            { userId },
          );
      }, 'sub')
      .leftJoin(UserEntity, 'u', 'sub."userId" = u.id')
      .getRawMany();

    console.log(res);

    return;
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
      await entityManager.save(conversationMembers);
    });

    return Ok(ConversationEntity.toIConversationEntity(newConversation));
  }
  deleteChat(
    chatId: string,
    senderId: string,
    deletedBy?: string,
  ): Promise<Result<boolean>> {
    return;
  }
  seenChat(
    chatId: string,
    conversationId: string,
    userId: string,
  ): Promise<Result<boolean>> {
    return;
  }
  sendChat(
    userId: string,
    targetUserId: string,
    iConversationEntity: Partial<IConversationEntity>,
    iChat: IChat,
  ): Promise<Result<IChatEntity>> {
    return;
  }
  getChat(chatId: string, senderId: string): Promise<Result<IChatEntity>> {
    return;
  }
  editChat(
    chatId: string,
    senderId: string,
    iChat: Partial<IChat>,
  ): Promise<Result<IChatEntity>> {
    return;
  }
  sendChatToGroup(
    senderId: string,
    groupId: string,
    iChat: IChat,
  ): Promise<Result<IChatEntity>> {
    return;
  }
  addMemberToGroup(
    userIds: string[],
    conversationId: string,
  ): Promise<Result<IConversationEntity>> {
    return;
  }

  @HandleError
  async getConversationReverse(
    conversationId: string,
    userId: string,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.conversationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect(
        'conversationMembers',
        'cm',
        'c.id = cm.conversationId',
      )
      .leftJoinAndSelect('user', 'u', 'u.id = cm.userId')
      .where('cm.conversationId = :conversationId and cm.userId != :userId', {
        conversationId: +conversationId,
        userId: +userId,
      })
      .getRawOne();

    const conversation = new ConversationEntity();
    conversation.id = res.c_id;
    conversation.name = res.u_name;
    conversation.image = res.u_avatar;
    conversation.type = res.c_type;
    conversation.lastChat = res.c_lastChat;
    conversation.notSeen = res.c_notSeen;
    conversation.description = res.c_description;
    conversation.createdAt = res.c_createdAt;
    conversation.updatedAt = res.c_updatedAt;

    return Ok(ConversationEntity.toIConversationEntity(conversation));
  }
}
