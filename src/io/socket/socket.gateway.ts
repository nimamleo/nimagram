import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsGuard } from './guard/ws.guard';
import { AddContactRequest } from './model/add-contact.model';
import { UserService } from '../../application/user/user.service';
import { GetUserWs } from './guard/decorator/get-user-ws.decorator';
import { IUserEntity } from '../../models/user/user.model';
import { StdResponse } from '../../common/std-response/std-response';
import { Err, Ok, Result } from '../../common/result';
import { BlockUserRequest } from './model/block-user.model';
import { ConversationService } from '../../application/chat/conversation.service';
import {
  StartConversationRequest,
  StartConversationResponse,
} from './model/start-conversation.model';
import { ConversationType } from '../../enum/conversation-type';
import { GenericErrorCode } from '../../common/errors/generic-error';
import {
  ConversationListRequest,
  ConversationListResponse,
} from './model/conversation-list.model';
import {
  DeleteConversationRequest,
  DeleteConversationResponse,
} from './model/delete-conversation.model';
import {
  SendMessageRequest,
  SendMessageResponse,
} from './model/send-message.model';
import { ChatType } from '../../enum/chat-type.enum';
import { SendChatBackResponse } from './model/send-chat-back.model';
import { instrument } from '@socket.io/admin-ui';
import {
  GetConversationListRequest,
  GetConversationListResponse,
} from './model/get-conversation-list.model';
import { PaginationHelper } from '../../common/pagination/pagination-helper';
import { EditChatRequest, EditChatResponse } from './model/edit-chat.model';
import {
  DeleteChatRequest,
  DeleteChatResponse,
} from './model/delete-chat.model';
import { IConversationEntity } from '../../models/chat/conversation.model';
import {
  CreateGroupRequest,
  CreateGroupResponse,
} from './model/create-group.model';
import { AddMemberRequest, AddMemberResponse } from './model/add-member.model';
import {
  SendMessageToGroupRequest,
  SendMessageToGroupResponse,
} from './model/send-message-to-group.model';
import {
  GroupChatListRequest,
  GroupChatListResponse,
} from './model/group-chat-list.model';
import {
  DeleteChatGroupRequest,
  DeleteChatGroupResponse,
} from './model/delete-chat-group.model';
import { SeenChatRequest, SeenChatResponse } from './model/seen-chat.model';
import { IConversationMemberEntity } from '../../models/chat/conversation-member.model';

@WebSocketGateway(8080, {
  cors: { origin: ['https://admin.socket.io'], credentials: true },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly wsGuard: WsGuard,
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
  ) {}
  private readonly logger = new Logger(SocketGateway.name);
  afterInit() {
    this.logger.debug('gateway init');
    instrument(this.server, {
      auth: false,
      mode: 'development',
    });
  }

  async handleConnection(client: Socket) {
    this.logger.debug(`user with socket id ${client.id} connected`);
    const token = await this.wsGuard.extractToken(client.request);
    const verifyRes = await this.wsGuard.verifyToken(token);
    this.logger.debug(
      `${verifyRes.value.name} joined to rooms with ids: ${verifyRes.value.conversations.map((x: IConversationMemberEntity) => x.conversation.id)}`,
    );
    client.join(
      verifyRes.value.conversations.map(
        (x: IConversationMemberEntity) => x.conversation.id,
      ),
    );
    client['user'] = verifyRes.value;
    if (verifyRes.isError()) client.disconnect();
  }

  handleDisconnect() {}

  @SubscribeMessage('add.contact')
  async addContact(
    @MessageBody() msg: AddContactRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const res = await this.userService.addContact(user.id, msg.phone);
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(Ok(res.value));
  }

  @SubscribeMessage('block.user')
  async blockUser(
    @MessageBody() msg: BlockUserRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const res = await this.userService.blockUser(user.id, msg.phone);
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(Ok(res.value));
  }

  @SubscribeMessage('start.conversation')
  async startConversation(
    @MessageBody() msg: StartConversationRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const targetUser = await this.userService.getUserById(msg.targetId);
    if (targetUser.isError()) {
      return StdResponse.fromResult(
        Err(targetUser.err, GenericErrorCode.INTERNAL),
      );
    }
    const iSConversationExist =
      await this.conversationService.getConversationByUsers(
        user.id,
        targetUser.value.id,
      );
    if (iSConversationExist.isError()) {
      if (iSConversationExist.err.code !== GenericErrorCode.NOT_FOUND) {
        return StdResponse.fromResult(Err(iSConversationExist.err));
      }
    }

    if (iSConversationExist.isOk()) {
      return StdResponse.fromResult(
        Ok<StartConversationResponse>({
          id: iSConversationExist.value.id,
          name: iSConversationExist.value.name,
          type: iSConversationExist.value.type,
          image: iSConversationExist.value.image,
          chats: [],
          members: {
            list: [
              { name: user.name, id: user.id },
              { id: targetUser.value.id, name: targetUser.value.name },
            ],
          },
          createdAt: iSConversationExist.value.createdAt.toISOString(),
        }),
      );
    }
    const isUserBlock = await this.userService.IsUserBlocked(
      user.id,
      msg.targetId,
    );
    if (isUserBlock.value) {
      return StdResponse.fromResult(Ok('first unblock user'));
    }

    const conversation = await this.conversationService.startConversation(
      user.id,
      msg.targetId,
      {
        name: targetUser.value.name,
        description: null,
        type: ConversationType.DIRECT,
        notSeen: 0,
        image: targetUser.value.avatar,
        lastChat: new Date(),
        chats: [],
        members: [],
      },
    );
    if (conversation.isError()) {
      return StdResponse.fromResult(
        Err(conversation.err, GenericErrorCode.INTERNAL),
      );
    }

    return StdResponse.fromResult(
      Ok<StartConversationResponse>({
        id: conversation.value.id,
        name: conversation.value.name,
        type: conversation.value.type,
        image: conversation.value.image,
        chats: [],
        members: {
          list: [
            { name: user.name, id: user.id },
            { id: targetUser.value.id, name: targetUser.value.name },
          ],
        },
        createdAt: conversation.value.createdAt.toISOString(),
      }),
    );
  }

  @SubscribeMessage('conversation.list')
  async getConversationList(
    @MessageBody() msg: ConversationListRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const conversationList = await this.conversationService.getConversationList(
      user.id,
    );
    if (conversationList.isError()) {
      return StdResponse.fromResult(Err(conversationList.err));
    }
    const userRes = await this.userService.getUserById(user.id);
    if (userRes.isError()) {
      return StdResponse.fromResult(Err(userRes.err));
    }

    for (const conversation of conversationList.value) {
      conversation.members.map((member: IConversationMemberEntity) => {
        if (member.user.id !== user.id) {
          conversation.name = member.user.name;
          conversation.image = member.user.avatar;
        }
      });
    }

    return StdResponse.fromResult(
      Ok<ConversationListResponse>({
        list: conversationList.value.map((x) => ({
          id: x.id,
          name: x.name,
          image: x.image,
          type: x.type,
          notSeen: x.notSeen,
          lastChat: x.lastChat.toISOString(),
          createdAt: x.createdAt.toISOString(),
        })),
      }),
    );
  }

  @SubscribeMessage('delete.conversation')
  async deleteConversation(
    @MessageBody() msg: DeleteConversationRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const res = await this.conversationService.deleteConversation(
      msg.conversationId,
      user.id,
    );
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(
      Ok<DeleteConversationResponse>({ success: res.value }),
    );
  }

  @SubscribeMessage('send.chat')
  async sendMessage(
    @MessageBody() msg: SendMessageRequest,
    @GetUserWs() user: IUserEntity,
    @ConnectedSocket() client: Socket,
  ) {
    let conversation: Result<IConversationEntity>;
    if (!msg.conversationId) {
      conversation = await this.conversationService.getConversationByUsers(
        user.id,
        msg.targetUserId,
      );
      if (conversation.isError()) {
        if (conversation.err.code != GenericErrorCode.NOT_FOUND) {
          return StdResponse.fromResult(Err(conversation.err));
        }
      }
    }
    if (
      conversation.isError() &&
      conversation.err.code === GenericErrorCode.NOT_FOUND
    ) {
      conversation = await this.conversationService.startConversation(
        user.id,
        msg.targetUserId,
        {
          name: user.name,
          description: null,
          type: ConversationType.DIRECT,
          notSeen: 0,
          image: user.avatar,
          lastChat: new Date(),
          chats: [],
          members: [],
        },
      );
    }
    const targetUser = await this.userService.getUserById(msg.targetUserId);
    if (targetUser.isError()) {
      return StdResponse.fromResult(Err(targetUser.err));
    }

    const createChat = await this.conversationService.sendChat(
      user.id,
      msg.targetUserId,
      {
        content: msg.content,
        type: ChatType.MESSAGE,
        seen: false,
        filePath: null,
        isEdited: false,
        isDeleted: false,
        sender: { id: user.id },
        conversation: { id: msg.conversationId || conversation.value.id },
        deletedBy: undefined,
      },
    );

    if (createChat.isError()) {
      return StdResponse.fromResult(Err(createChat.err));
    }

    client.broadcast.to(createChat.value.conversation.id).emit(
      'send.chat.back',
      StdResponse.fromResult(
        Ok<SendChatBackResponse>({
          chatId: createChat.value.id,
          content: createChat.value.content,
          createdAt: createChat.value.createdAt.toISOString(),
        }),
      ),
    );

    return StdResponse.fromResult(
      Ok<SendMessageResponse>({
        id: createChat.value.id,
        content: createChat.value.content,
        type: createChat.value.type,
        filePath: createChat.value.filePath,
        isEdited: createChat.value.isEdited,
        isDeleted: createChat.value.isDeleted,
        seen: createChat.value.seen,
        senderId: createChat.value.sender.id,
        conversationId: createChat.value.conversation.id,
        updatedAt: createChat.value.updatedAt.toISOString(),
        createdAt: createChat.value.createdAt.toISOString(),
      }),
    );
  }

  @SubscribeMessage('conversation.chats')
  async getConversationChats(
    @MessageBody() msg: GetConversationListRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const pagination = new PaginationHelper(msg.page, msg.pageSize);

    const conversation = await this.conversationService.getConversationById(
      msg.conversationId,
    );
    if (conversation.isError()) {
      return StdResponse.fromResult(Err(conversation.err));
    }

    const res = await this.conversationService.getConversationChats(
      msg.conversationId,
      user.id,
      {
        limit: pagination.getLimit(),
        skip: pagination.getSkip(),
      },
    );
    if (res.isError()) {
      return StdResponse.fromResult(
        Err(res.err, GenericErrorCode.UNAUTHORIZED),
      );
    }

    return StdResponse.fromResult(
      Ok<GetConversationListResponse>({
        id: conversation.value.id,
        name: conversation.value.name,
        chats: res.value.map((x) => ({
          id: x.id,
          content: x.content,
          seen: x.seen,
          senderId: x.sender.id,
          createdAt: x.createdAt.toISOString(),
        })),
      }),
    );
  }

  @SubscribeMessage('edit.chat')
  async editChat(
    @MessageBody() msg: EditChatRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const res = await this.conversationService.editChat(msg.chatId, user.id, {
      content: msg.content,
      isEdited: msg.isEdited,
      isDeleted: msg.isDeleted,
    });
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(
      Ok<EditChatResponse>({
        id: res.value.id,
        type: res.value.type,
        content: res.value.content,
        isDeleted: res.value.isDeleted,
        isEdited: res.value.isEdited,
        filePath: res.value.filePath,
        createdAt: res.value.createdAt.toISOString(),
        updatedAt: res.value.updatedAt.toISOString(),
      }),
    );
  }

  @SubscribeMessage('delete.chat')
  async deleteChat(
    @MessageBody() msg: DeleteChatRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const res = await this.conversationService.deleteChat(
      msg.chatId,
      user.id,
      msg.forMe ? user.id : null,
    );
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(
      Ok<DeleteChatResponse>({ success: res.value }),
    );
  }

  @SubscribeMessage('create.group')
  async createGroup(
    @MessageBody() msg: CreateGroupRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const secondUser = await this.userService.getUserById(msg.secondUserId);
    if (secondUser.isError()) {
      return StdResponse.fromResult(Err(secondUser.err));
    }

    const res = await this.conversationService.startConversation(
      user.id,
      msg.secondUserId,
      {
        name: msg.name,
        description: msg?.description,
        type: ConversationType.GROUP,
        image: msg.image,
        notSeen: 0,
        lastChat: new Date(),
        chats: [],
        members: [],
      },
    );

    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err, GenericErrorCode.INTERNAL));
    }

    return StdResponse.fromResult(
      Ok<CreateGroupResponse>({
        id: res.value.id,
        name: res.value.name,
        image: res.value.image,
        description: res.value.description,
        type: res.value.type,
        lastChat: res.value.lastChat.toISOString(),
        createdAt: res.value.createdAt.toISOString(),
        members: res.value.members.map((x) => ({
          id: x.id,
          name: x.name,
          username: x.username,
        })),
      }),
    );
  }

  @SubscribeMessage('add.member')
  async addMember(
    @MessageBody() msg: AddMemberRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const res = await this.conversationService.addMemberToGroup(
      msg.userIds,
      msg.groupId,
    );

    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(
      Ok<AddMemberResponse>({
        id: res.value.id,
        name: res.value.name,
        image: res.value.image,
        type: res.value.type,
        description: res.value.description,
        lastChat: res.value.lastChat.toISOString(),
        createdAt: res.value.createdAt.toISOString(),
        members: res.value.members.map((x: IConversationMemberEntity) => ({
          id: x.user.id,
          name: x.user.name,
          username: x.user.username,
        })),
      }),
    );
  }
  @SubscribeMessage('send.to.group')
  async sendChatToGroup(
    @MessageBody() msg: SendMessageToGroupRequest,
    @GetUserWs() user: IUserEntity,
    @ConnectedSocket() socket: Socket,
  ) {
    const res = await this.conversationService.sendChatToGroup(
      user.id,
      msg.conversationId,
      {
        content: msg.content,
        type: ChatType.MESSAGE,
        seen: false,
        isEdited: false,
        isDeleted: false,
        filePath: undefined,
        sender: { id: user.id },
        conversation: { id: msg.conversationId },
        deletedBy: undefined,
      },
    );

    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    socket.broadcast.to(res.value.conversation.id).emit(
      'send.chat.back',
      StdResponse.fromResult(
        Ok<SendChatBackResponse>({
          chatId: res.value.id,
          content: res.value.content,
          createdAt: res.value.createdAt.toISOString(),
        }),
      ),
    );

    return StdResponse.fromResult(
      Ok<SendMessageToGroupResponse>({
        id: res.value.id,
        content: res.value.content,
        type: res.value.type,
        filePath: res.value.filePath,
        seen: res.value.seen,
        isEdited: res.value.isEdited,
        isDeleted: res.value.isDeleted,
        senderId: res.value.sender.id,
        conversationId: res.value.conversation.id,
        createdAt: res.value.createdAt.toISOString(),
        updatedAt: res.value.updatedAt.toISOString(),
      }),
    );
  }

  @SubscribeMessage('group.chat.list')
  async groupChatList(
    @MessageBody() msg: GroupChatListRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const pagination = new PaginationHelper(msg.page, msg.pageSize);

    const res = await this.conversationService.getGroupChats(
      user.id,
      msg.groupId,
      { limit: pagination.getLimit(), skip: pagination.getSkip() },
    );
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(
      Ok<GroupChatListResponse>({
        id: res.value.id,
        name: res.value.name,
        createdAt: res.value.createdAt.toISOString(),
        chats: res.value.chats.map((x) => ({
          id: x.id,
          content: x.content,
          isEdited: x.isEdited,
          seen: x.seen,
          createdAt: x.createdAt.toISOString(),
        })),
      }),
    );
  }

  @SubscribeMessage('delete.chat.group')
  async deleteChatFromGroup(
    @MessageBody() msg: DeleteChatGroupRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const res = await this.conversationService.deleteChat(msg.chatId, user.id);
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(
      Ok<DeleteChatGroupResponse>({
        success: res.value,
      }),
    );
  }

  @SubscribeMessage('seen.chat')
  async seenChat(
    @MessageBody() msg: SeenChatRequest,
    @GetUserWs() user: IUserEntity,
  ) {
    const res = await this.conversationService.seenChat(
      msg.chatId,
      msg.conversationId,
      user.id,
    );
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(
      Ok<SeenChatResponse>({
        success: res.value,
      }),
    );
  }
}
