import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class DeleteChatRequest {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsNotEmpty()
  @IsBoolean()
  forMe: boolean;
}
export class DeleteChatResponse {
  success: boolean;
}
