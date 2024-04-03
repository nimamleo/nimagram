import { Injectable } from '@nestjs/common';
import { IConversationProvider } from '../../provider/chat/conversation.provider';
import {
  IConversation,
  IConversationEntity,
} from '../../../../models/chat/conversation.model';
import { Result } from '../../../../common/result';
import { IChat, IChatEntity } from '../../../../models/chat/chat.model';
import { ILimitationOptions } from '../../../../common/pagination/limitation.interface';
import { HandleError } from '../../../../common/decorators/handler-error.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { ConversationMemberEntity } from './entities/conversation-member.entity';
import { ConversationType } from '../../../../enum/conversation-type';

@Injectable()
export class ConversationPgsqlService implements IConversationProvider {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(ConversationMemberEntity)
    private readonly conversationMemberRepository: Repository<ConversationMemberEntity>,
  ) {}

  @HandleError
  async getConversationByUsers(
    userId: string,
    targetUserId: string,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.conversationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.members', 'cm')
      .where('cm.userId = :userId', { userId: 1222 })
      .andWhere('cm.userId = :userId', { userId: +targetUserId })
      .andWhere('c.type = :type', { type: ConversationType.DIRECT })
      .getOne();
    console.log(res);
    return;
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
  getConversationList(userId: string): Promise<Result<IConversationEntity[]>> {
    return;
  }
  startConversation(
    userId: string,
    targetUserId: string,
    iConversation: IConversation,
  ): Promise<Result<IConversationEntity>> {
    return;
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
}
