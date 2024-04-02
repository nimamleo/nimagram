import { Injectable } from '@nestjs/common';
import { IConversationProvider } from '../../provider/chat/conversation.provider';
import {
  IConversation,
  IConversationEntity,
} from '../../../../models/chat/conversation.model';
import { HandleError } from '../../../../common/decorators/handler-error.decorator';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { Err, Ok, Result } from '../../../../common/result';
import {
  fromIConversation,
  toIConversationEntity,
} from './entities/conversation.entity';
import { GenericErrorCode } from '../../../../common/errors/generic-error';
import { IChat, IChatEntity } from '../../../../models/chat/chat.model';
import {
  fromIChat,
  toIChatEntity,
} from '../../provider/chat/entities/chat.model';
import {
  ConversationType,
  fromAppConversationType,
} from '../../../../enum/conversation-type';
import { ILimitationOptions } from '../../../../common/pagination/limitation.interface';
import { toIUserEntity } from '../user/entities/user-prisma.entity';

@Injectable()
export class ConversationPgsqlService implements IConversationProvider {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError
  async startConversation(
    userId: string,
    targetUserId: string,
    iConversation: IConversation,
  ): Promise<Result<IConversationEntity>> {
    return this.prisma.$transaction(
      async (entityManager): Promise<Result<IConversationEntity>> => {
        const newData = fromIConversation(iConversation);
        const res = await entityManager.conversation.create({
          data: {
            ...newData,
            members: {
              createMany: {
                data: [{ userId: +userId }, { userId: +targetUserId }],
              },
            },
          },
          include: { members: { select: { user: true } } },
        });
        if (!res) {
          return Err('create conversation failed', GenericErrorCode.INTERNAL);
        }

        const conversation = toIConversationEntity({
          id: res.id,
          name: res.name,
          image: res.image,
          type: res.type,
          lastChat: res.lastChat,
          description: res.description,
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
        });
        conversation.members = res.members.map((x) =>
          toIUserEntity({
            id: x.user.id,
            name: x.user.name,
            username: x.user.username,
          }),
        );
        return Ok(conversation);
      },
    );
  }

  @HandleError
  async getConversationByUsers(
    userId: string,
    targetUserId: string,
  ): Promise<Result<IConversationEntity>> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        members: { every: { userId: { in: [+userId, +targetUserId] } } },
      },
    });
    if (!conversation) {
      return Err('conversation not found', GenericErrorCode.NOT_FOUND);
    }

    return Ok(toIConversationEntity(conversation));
  }

  @HandleError
  async getConversationList(
    userId: string,
  ): Promise<Result<IConversationEntity[]>> {
    const res = await this.prisma.user.findFirst({
      where: {
        id: +userId,
      },
      include: {
        conversations: {
          orderBy: { conversation: { lastChat: 'desc' } },
          select: {
            conversation: {
              include: {
                _count: { select: { chats: { where: { seen: false } } } },
              },
            },
          },
        },
      },
    });
    return Ok(
      res.conversations.map((x) => {
        const conversation = toIConversationEntity({
          id: x.conversation.id,
          name: x.conversation.name,
          image: x.conversation.image,
          type: x.conversation.type,
          lastChat: x.conversation.lastChat,
          description: x.conversation.description,
          createdAt: x.conversation.createdAt,
          updatedAt: x.conversation.updatedAt,
        });

        conversation.notSeen = x.conversation._count.chats;
        return conversation;
      }),
    );
  }

  @HandleError
  async deleteConversation(conversationId: string): Promise<Result<boolean>> {
    return this.prisma.$transaction(async (entityManager) => {
      const deleteRes = await entityManager.conversationsOnUsers.deleteMany({
        where: { conversationId: +conversationId },
      });
      if (!deleteRes) {
        return Err('delete conversation failed');
      }
      const res = await entityManager.conversation.delete({
        where: { id: +conversationId },
      });

      if (!res) {
        return Err('delete conversation failed');
      }

      return Ok(true);
    });
  }

  @HandleError
  async sendChat(
    userId: string,
    targetUserId: string,
    iConversationEntity: Partial<IConversationEntity>,
    iChat: IChat,
  ): Promise<Result<IChatEntity>> {
    return this.prisma.$transaction(async (entityManager) => {
      const newChat = fromIChat(iChat);
      const newConversation = fromIConversation({
        name: iConversationEntity.name,
        image: iConversationEntity.image,
        type: ConversationType.DIRECT,
        notSeen: 0,
        lastChat: new Date(),
        description: iConversationEntity.description,
        members: [],
        chats: [],
      });
      const res = await entityManager.chat.create({
        data: {
          content: newChat.content,
          seen: newChat.seen,
          isEdited: newChat.isEdited,
          isDeleted: newChat.isDeleted,
          type: newChat.type,
          conversation: {
            connectOrCreate: {
              where: {
                id: +iConversationEntity?.id,
                members: {
                  every: { userId: { in: [+userId, +targetUserId] } },
                },
              },
              create: {
                ...newConversation,
                members: {
                  createMany: {
                    data: [{ userId: +userId }, { userId: +targetUserId }],
                  },
                },
              },
            },
          },
          sender: {
            connect: { id: +userId },
          },
        },
      });
      if (!res) {
        return Err('create chat failed', GenericErrorCode.INTERNAL);
      }

      const updateLastChat = await entityManager.conversation.update({
        where: {
          id: +iConversationEntity.id,
        },
        data: {
          lastChat: new Date(),
        },
      });
      if (!updateLastChat) {
        return Err(
          'update conversation lastChat failed',
          GenericErrorCode.INTERNAL,
        );
      }

      const lastChats = await entityManager.chat.findMany({
        where: {
          id: {
            lt: +res.id,
          },
        },
      });
      if (lastChats.length >= 1) {
        const seenChat = await entityManager.chat.updateMany({
          where: {
            id: { lt: +res.id },
            conversationId: +iConversationEntity.id,
            senderId: { not: +userId },
          },
          data: {
            seen: true,
          },
        });
      }

      return Ok(toIChatEntity(res));
    });
  }

  @HandleError
  async getConversationChats(
    conversationId: string,
    senderId: string,
    limitation: ILimitationOptions,
  ): Promise<Result<IChatEntity[]>> {
    const res = await this.prisma.chat.findMany({
      where: {
        conversationId: +conversationId,
        OR: [{ deletedById: { not: +senderId } }, { deletedById: null }],
      },
      skip: limitation.skip,
      take: limitation.limit,
    });
    return Ok(res.map((x) => toIChatEntity(x)));
  }

  @HandleError
  async editChat(
    chatId: string,
    senderId: string,
    iChat: Partial<IChat>,
  ): Promise<Result<IChatEntity>> {
    const res = await this.prisma.chat.update({
      where: {
        id: +chatId,
        senderId: +senderId,
        deletedById: { not: +senderId },
      },
      data: {
        content: iChat.content,
        filePath: iChat.filePath,
        isEdited: iChat.isEdited,
        isDeleted: iChat.isDeleted,
      },
    });

    if (!res) {
      return Err('update chat failed', GenericErrorCode.INTERNAL);
    }

    return Ok(toIChatEntity(res));
  }

  @HandleError
  async deleteChat(
    chatId: string,
    senderId: string,
    deletedBy?: string,
  ): Promise<Result<boolean>> {
    let res: any;
    if (!deletedBy) {
      res = await this.prisma.chat.delete({
        where: { id: +chatId, senderId: +senderId },
      });
    }
    if (deletedBy) {
      res = await this.prisma.chat.update({
        where: { id: +chatId, senderId: +senderId },
        data: { deletedById: +deletedBy },
      });
    }

    if (!res) {
      return Err('delete chat failed', GenericErrorCode.INTERNAL);
    }

    return Ok(true);
  }

  @HandleError
  async getChat(
    chatId: string,
    senderId: string,
  ): Promise<Result<IChatEntity>> {
    const res = await this.prisma.chat.findFirst({
      where: {
        id: +chatId,
        senderId: +senderId,
        OR: [{ deletedById: { not: +senderId } }, { deletedById: null }],
      },
    });
    if (!res) {
      return Err('chat not found', GenericErrorCode.NOT_FOUND);
    }

    return Ok(toIChatEntity(res));
  }

  @HandleError
  async addMemberToGroup(
    userIds: string[],
    conversationId: string,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.prisma.conversation.update({
      where: {
        id: +conversationId,
        type: fromAppConversationType(ConversationType.GROUP),
      },
      data: {
        members: {
          createMany: { data: userIds.map((id) => ({ userId: +id })) },
        },
      },
      include: { members: { select: { user: true } } },
    });

    if (!res) {
      return Err('add members failed', GenericErrorCode.INTERNAL);
    }

    const conversation = toIConversationEntity({
      id: res.id,
      name: res.name,
      image: res.image,
      type: res.type,
      lastChat: res.lastChat,
      description: res.description,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
    });
    conversation.members = res.members.map((x) =>
      toIUserEntity({
        id: x.user.id,
        name: x.user.name,
        username: x.user.username,
      }),
    );

    return Ok(conversation);
  }

  @HandleError
  async getConversationById(
    conversationId: string,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.prisma.conversation.findFirst({
      where: {
        id: +conversationId,
      },
    });

    if (!res) {
      return Err('conversation not found', GenericErrorCode.NOT_FOUND);
    }

    return Ok(toIConversationEntity(res));
  }

  @HandleError
  async updateConversation(
    conversationId: string,
    iConversation: Partial<IConversation>,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.prisma.conversation.update({
      where: { id: +conversationId },
      data: {
        name: iConversation?.name,
        image: iConversation?.image,
        lastChat: iConversation?.lastChat,
        description: iConversation?.description,
      },
    });

    if (!res) {
      return Err('updated conversation not found', GenericErrorCode.NOT_FOUND);
    }

    return Ok(toIConversationEntity(res));
  }

  @HandleError
  async sendChatToGroup(
    senderId: string,
    groupId: string,
    iChat: IChat,
  ): Promise<Result<IChatEntity>> {
    const newChat = fromIChat(iChat);
    const res = await this.prisma.chat.create({
      data: {
        content: newChat.content,
        filePath: newChat.filePath,
        type: newChat.type,
        isEdited: newChat.isEdited,
        isDeleted: newChat.isDeleted,
        seen: newChat.seen,
        conversation: {
          connect: {
            id: +groupId,
          },
        },
        sender: {
          connect: {
            id: +senderId,
          },
        },
      },
    });

    if (!res) {
      return Err('create chat failed', GenericErrorCode.INTERNAL);
    }

    return Ok(toIChatEntity(res));
  }

  @HandleError
  async seenChat(
    chatId: string,
    conversationId: string,
    userId: string,
  ): Promise<Result<boolean>> {
    const lastChats = await this.prisma.chat.findMany({
      where: {
        id: {
          lt: +chatId,
        },
      },
    });
    if (lastChats.length >= 1) {
      await this.prisma.chat.updateMany({
        where: {
          id: { lte: +chatId },
          conversationId: +conversationId,
          senderId: { not: +userId },
        },
        data: {
          seen: true,
        },
      });
    }

    return Ok(true);
  }
}
