import { ChatType as PrismaChatType } from '@prisma/client';
export enum ChatType {
  MESSAGE = 'message',
  VOICE = 'voice',
  IMAGE = 'image',
}

export function fromAppChatTypeEnum(value: ChatType): PrismaChatType {
  switch (value) {
    case ChatType.IMAGE:
      return PrismaChatType.Image;
    case ChatType.MESSAGE:
      return PrismaChatType.Message;
    case ChatType.VOICE:
      return PrismaChatType.Voice;
    default:
      return null;
  }
}

export function toAppChatTypeEnum(value: PrismaChatType): ChatType {
  switch (value) {
    case PrismaChatType.Message:
      return ChatType.MESSAGE;
    case PrismaChatType.Image:
      return ChatType.IMAGE;
    case PrismaChatType.Voice:
      return ChatType.VOICE;
    default:
      return null;
  }
}
