import { ConversationType as PrismaConversationType } from '@prisma/client';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

export function fromAppConversationType(
  value: ConversationType,
): PrismaConversationType {
  switch (value) {
    case ConversationType.DIRECT:
      return PrismaConversationType.Direct;
    case ConversationType.GROUP:
      return PrismaConversationType.Group;
    default:
      return null;
  }
}
export function toAppConversationType(
  value: PrismaConversationType,
): ConversationType {
  switch (value) {
    case PrismaConversationType.Group:
      return ConversationType.GROUP;
    case PrismaConversationType.Direct:
      return ConversationType.DIRECT;
    default:
      return null;
  }
}
