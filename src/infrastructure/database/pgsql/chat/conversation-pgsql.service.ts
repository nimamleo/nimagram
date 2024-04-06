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
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class ConversationPgsqlService implements IConversationProvider {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(ConversationMemberEntity)
    private readonly conversationMemberRepository: Repository<ConversationMemberEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
    const conversationMembers = await this.conversationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect(
        'conversationMembers',
        'cm',
        'cm.conversationId = c.id',
      )
      .leftJoinAndSelect('user', 'u', 'u.id =  cm.userId')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('cm2.conversationId')
          .from('conversationMembers', 'cm2')
          .where('cm2.userId = :userId')
          .getQuery();

        return 'c.id in' + subQuery;
      })
      .setParameter('userId', +userId)
      .getRawMany();

    const conversations: ConversationEntity[] = conversationMembers.map((x) => {
      const conversation = new ConversationEntity();
      conversation.id = x.c_id;
      conversation.name = x.c_name;
      conversation.image = x.c_image;
      conversation.description = x.c_description;
      conversation.type = x.c_type;
      conversation.lastChat = x.c_lastChat;
      conversation.notSeen = x.c_notSeen;
      conversation.createdAt = x.c_createdAt;
      conversation.updatedAt = x.c_updatedAt;

      const memeber = new UserEntity();
      memeber.id = x.u_id;
      memeber.name = x.u_name;
      memeber.username = x.u_username;
      memeber.avatar = x.u_avatar;
      memeber.bio = x.u_bio;
      memeber.phone = x.u_phone;
      memeber.lastOnline = x.u_lastOnline;
      memeber.createdAt = x.u_createdAt;
      memeber.updatedAt = x.u_updatedAt;

      const conversationMember = new ConversationMemberEntity();
      conversationMember.user = memeber;

      conversation.members = [conversationMember];
      return conversation;
    });

    return;
    return Ok(
      conversations.map((x) => ConversationEntity.toIConversationEntity(x)),
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
