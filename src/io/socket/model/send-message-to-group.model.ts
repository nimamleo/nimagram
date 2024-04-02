import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageToGroupRequest {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsString()
  conversationId: string;
}
export class SendMessageToGroupResponse {
  id: string;
  content: string;
  seen: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  filePath: string;
  type: string;
  conversationId: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
}
