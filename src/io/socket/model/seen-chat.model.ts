import { IsNotEmpty } from 'class-validator';

export class SeenChatRequest {
  @IsNotEmpty()
  chatId: string;

  @IsNotEmpty()
  conversationId: string;
}
export class SeenChatResponse {
  success: boolean;
}
