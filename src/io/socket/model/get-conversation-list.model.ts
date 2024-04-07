import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetConversationListRequest {
  @IsNumber()
  page: number;
  @IsNumber()
  pageSize: number;
  @IsNotEmpty()
  conversationId: string;
}
export class GetConversationChats {
  id: string;
  content: string;
  seen: boolean;
  senderId: string;
  createdAt: string;
}
export class GetConversationListResponse {
  id: string;
  name: string;
  chats: GetConversationChats[];
}
