import { IChat, IChatEntity } from '../../../../../models/chat/chat.model';
import { Prisma } from '@prisma/client';
import {
  fromAppChatTypeEnum,
  toAppChatTypeEnum,
} from '../../../../../enum/chat-type.enum';

export function fromIChat(iChat: IChat): Prisma.ChatUncheckedCreateInput {
  if (!iChat) {
    return null;
  }

  return {
    content: iChat.content,
    type: fromAppChatTypeEnum(iChat.type),
    filePath: iChat.filePath,
    seen: iChat.seen,
    isEdited: iChat.isEdited,
    isDeleted: iChat.isEdited,
    senderId: +iChat.sender.id,
    conversationId: +iChat.conversation.id,
  };
}

export function toIChatEntity(
  chat: Partial<Prisma.ChatUncheckedCreateInput>,
): IChatEntity {
  if (!chat) {
    return null;
  }

  return {
    id: chat.id.toString(),
    content: chat.content,
    type: toAppChatTypeEnum(chat.type),
    filePath: chat.filePath,
    seen: chat.seen,
    isEdited: chat.isEdited,
    isDeleted: chat.isDeleted,
    sender: { id: chat.senderId.toString() },
    seenBy: [],
    conversation: { id: chat.conversationId.toString() },
    deletedBy: { id: chat?.deletedById?.toString() },
    createdAt: new Date(chat.createdAt),
    updatedAt: new Date(chat.updatedAt),
    deletedAt: new Date(chat.deletedAt),
  };
}
