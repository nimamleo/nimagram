import { Prisma } from '@prisma/client';
import {
  IConversation,
  IConversationEntity,
} from '../../../../../models/chat/conversation.model';
import {
  fromAppConversationType,
  toAppConversationType,
} from '../../../../../enum/conversation-type';

export function fromIConversation(
  iConversation: IConversation,
): Prisma.ConversationUncheckedCreateInput {
  if (!iConversation) {
    return null;
  }

  return {
    name: iConversation.name,
    image: iConversation.image,
    type: fromAppConversationType(iConversation.type),
    description: iConversation.description,
    lastChat: iConversation.lastChat,
  };
}

export function toIConversationEntity(
  conversation: Partial<Prisma.ConversationUncheckedCreateInput>,
): IConversationEntity {
  if (!conversation) {
    return null;
  }

  return {
    id: conversation.id.toString(),
    name: conversation.name,
    image: conversation.image,
    type: toAppConversationType(conversation.type),
    description: conversation.description,
    lastChat: new Date(conversation.lastChat),
    notSeen: 0,
    members: [],
    chats: [],
    createdAt: new Date(conversation.createdAt),
    updatedAt: new Date(conversation.updatedAt),
  };
}
