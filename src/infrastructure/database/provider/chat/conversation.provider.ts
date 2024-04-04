import {
  IConversation,
  IConversationEntity,
} from '../../../../models/chat/conversation.model';
import { Result } from '../../../../common/result';
import { IChat, IChatEntity } from '../../../../models/chat/chat.model';
import { ILimitationOptions } from '../../../../common/pagination/limitation.interface';

export interface IConversationReader {
  getConversationByUsers(
    userId: string,
    targetUserId: string,
  ): Promise<Result<IConversationEntity>>;
  getConversationList(userId: string): Promise<Result<IConversationEntity[]>>;
  getConversationChats(
    conversationId: string,
    senderId: string,
    limitation: ILimitationOptions,
  ): Promise<Result<IChatEntity[]>>;
  getChat(chatId: string, senderId: string): Promise<Result<IChatEntity>>;
  getConversationById(
    conversationId: string,
  ): Promise<Result<IConversationEntity>>;
  getConversationReverse(
    conversationId: string,
    userId: string,
  ): Promise<Result<IConversationEntity>>;
}
export interface IConversationWriter {
  startConversation(
    userId: string,
    targetUserId: string,
    iConversation: IConversation,
  ): Promise<Result<IConversationEntity>>;
  deleteConversation(conversationId: string): Promise<Result<boolean>>;
  sendChat(
    userId: string,
    targetUserId: string,
    iConversationEntity: Partial<IConversationEntity>,
    iChat: IChat,
  ): Promise<Result<IChatEntity>>;
  editChat(
    chatId: string,
    senderId: string,
    iChat: Partial<IChat>,
  ): Promise<Result<IChatEntity>>;
  deleteChat(
    chatId: string,
    senderId: string,
    deletedBy?: string,
  ): Promise<Result<boolean>>;
  addMemberToGroup(
    userIds: string[],
    conversationId: string,
  ): Promise<Result<IConversationEntity>>;
  updateConversation(
    conversationId: string,
    iConversation: Partial<IConversation>,
  ): Promise<Result<IConversationEntity>>;
  sendChatToGroup(
    senderId: string,
    groupId: string,
    iChat: IChat,
  ): Promise<Result<IChatEntity>>;
  seenChat(
    chatId: string,
    conversationId: string,
    userId: string,
  ): Promise<Result<boolean>>;
}

export const CONVERSATION_DATABASE_PROVIDER = 'conversation-database-provider';

export interface IConversationProvider
  extends IConversationReader,
    IConversationWriter {}
