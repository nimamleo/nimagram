export class GroupChatListRequest {
  groupId: string;
  page: number;
  pageSize: number;
}
export class GroupChatList {
  id: string;
  content: string;
  createdAt: string;
  seen: boolean;
  isEdited: boolean;
}
export class GroupChatListResponse {
  id: string;
  name: string;
  createdAt: string;
  chats: GroupChatList[];
}
