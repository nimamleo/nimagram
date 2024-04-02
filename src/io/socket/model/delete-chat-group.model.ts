import { IsNotEmpty } from 'class-validator';

export class DeleteChatGroupRequest {
  @IsNotEmpty()
  chatId: string;
}
export class DeleteChatGroupResponse {
  success: boolean;
}
