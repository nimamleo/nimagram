import { Inject, Injectable } from '@nestjs/common';
import {
  CONVERSATION_DATABASE_PROVIDER,
  IConversationProvider,
} from '../../infrastructure/database/provider/chat/conversation.provider';
import { HandleError } from '../../common/decorators/handler-error.decorator';
import {
  IConversation,
  IConversationEntity,
} from '../../models/chat/conversation.model';
import { Err, Ok, Result } from '../../common/result';
import { GenericErrorCode } from '../../common/errors/generic-error';
import { IChat, IChatEntity } from '../../models/chat/chat.model';
import { ILimitationOptions } from '../../common/pagination/limitation.interface';
import { ConversationType } from '../../enum/conversation-type';

@Injectable()
export class ConversationService {
  constructor(
    @Inject(CONVERSATION_DATABASE_PROVIDER)
    private readonly conversationRepository: IConversationProvider,
  ) {}

  @HandleError
  async startConversation(
    userId: string,
    targetUserId: string,
    iConversation: IConversation,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.conversationRepository.startConversation(
      userId,
      targetUserId,
      iConversation,
    );
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async getConversationByUsers(
    userId: string,
    targetUserId: string,
  ): Promise<Result<IConversationEntity>> {
    const res = await this.conversationRepository.getConversationByUsers(
      userId,
      targetUserId,
    );
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async getConversationList(
    userId: string,
  ): Promise<Result<IConversationEntity[]>> {
    const res = await this.conversationRepository.getConversationList(userId);
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    const seenResult =
      await this.conversationRepository.getConversationNotSeenCount(
        res.value.map((x) => x.id),
      );

    res.value.map((x) => {
      for (const i of seenResult.value) {
        if (x.id == i.id) {
          x.notSeen = i.notSeen;
        }
      }
    });

    return Ok(res.value);
  }

  @HandleError
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<Result<boolean>> {
    const userConversationList = await this.getConversationList(userId);
    if (userConversationList.isError()) {
      return Err(userConversationList.err);
    }

    if (
      !userConversationList.value
        .map((x) => x.id)
        .includes(conversationId.toString())
    ) {
      return Err('delete conversation failed');
    }

    const res =
      await this.conversationRepository.deleteConversation(conversationId);
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async sendChat(
    userId: string,
    targetUserId: string,
    iChat: IChat,
  ): Promise<Result<IChatEntity>> {
    const res = await this.conversationRepository.sendChat(
      userId,
      targetUserId,
      iChat,
    );

    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async getConversationChats(
    conversationId: string,
    senderId: string,
    limitation: ILimitationOptions,
  ): Promise<Result<IChatEntity[]>> {
    const res = await this.conversationRepository.getConversationChats(
      conversationId,
      senderId,
      limitation,
    );
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async editChat(
    chatId: string,
    senderId: string,
    iChat: Partial<IChat>,
  ): Promise<Result<IChatEntity>> {
    const isChatExist = await this.conversationRepository.getChat(
      chatId,
      senderId,
    );
    if (isChatExist.isError()) {
      return Err(isChatExist.err);
    }
    const res = await this.conversationRepository.editChat(
      chatId,
      senderId,
      iChat,
    );
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async deleteChat(
    chatId: string,
    senderId: string,
    deletedBy?: string,
  ): Promise<Result<boolean>> {
    const isChatExist = await this.conversationRepository.getChat(
      chatId,
      senderId,
    );
    if (isChatExist.isError()) {
      return Err(isChatExist.err);
    }
    const res = await this.conversationRepository.deleteChat(
      chatId,
      senderId,
      deletedBy,
    );
    if (res.isError()) {
      return Err(res.err, GenericErrorCode.INTERNAL);
    }

    return Ok(res.value);
  }

  @HandleError
  async addMemberToGroup(
    userIds: string[],
    conversationId: string,
  ): Promise<Result<IConversationEntity>> {
    const conversation =
      await this.conversationRepository.getConversationById(conversationId);
    if (conversation.isError()) {
      return Err(conversation.err, GenericErrorCode.INTERNAL);
    }
    const members =
      await this.conversationRepository.getGroupMembers(conversationId);
    if (members.isError()) {
      return Err(members.err);
    }

    if (userIds.some((x) => members.value.includes(x))) {
      return Ok(conversation.value);
    }
    const res = await this.conversationRepository.addMemberToGroup(
      userIds,
      conversationId,
    );

    if (res.isError()) {
      return Err(res.err);
    }

    return Ok(res.value);
  }

  @HandleError
  async sendChatToGroup(
    senderId: string,
    groupId: string,
    iChat: IChat,
  ): Promise<Result<IChatEntity>> {
    const isGroupExist =
      await this.conversationRepository.getConversationById(groupId);
    if (isGroupExist.isError()) {
      return Err(isGroupExist.err);
    }
    if (isGroupExist.value.type !== ConversationType.GROUP) {
      return Err('you can not send message to this conversation');
    }
    const res = await this.conversationRepository.sendChatToGroup(
      senderId,
      groupId,
      iChat,
    );
    if (res.isError()) {
      return Err(res.err);
    }

    res.value.conversation = isGroupExist.value;

    return Ok(res.value);
  }

  @HandleError
  async getGroupChats(
    senderId: string,
    conversationId: string,
    limitation: ILimitationOptions,
  ): Promise<Result<IConversationEntity>> {
    const conversation =
      await this.conversationRepository.getConversationById(conversationId);
    if (conversation.isError()) {
      return Err(conversation.err, GenericErrorCode.INTERNAL);
    }
    const groupChatList =
      await this.conversationRepository.getConversationChats(
        conversationId,
        senderId,
        { limit: limitation.limit, skip: limitation.skip },
      );

    if (groupChatList.isError()) {
      return Err(groupChatList.err, GenericErrorCode.INTERNAL);
    }

    conversation.value.chats = groupChatList.value;

    return Ok(conversation.value);
  }

  @HandleError
  async seenChat(
    chatId: string,
    conversationId: string,
    userId: string,
  ): Promise<Result<boolean>> {
    const isConversation =
      await this.conversationRepository.getConversationById(conversationId);
    if (isConversation.isError()) {
      return Err(isConversation.err);
    }
    const res = await this.conversationRepository.seenChat(
      chatId,
      conversationId,
      userId,
    );

    if (res.isError()) {
      return Err(res.err);
    }

    return Ok(res.value);
  }

  @HandleError
  async getConversationById(
    conversationId: string,
  ): Promise<Result<IConversationEntity>> {
    const res =
      await this.conversationRepository.getConversationById(conversationId);

    if (res.isError()) {
      return Err(res.err);
    }

    return Ok(res.value);
  }
}
