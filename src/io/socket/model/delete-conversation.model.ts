import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteConversationRequest {
  @IsNotEmpty()
  @IsString()
  conversationId: string;
}
export class DeleteConversationResponse {
  success: boolean;
}
