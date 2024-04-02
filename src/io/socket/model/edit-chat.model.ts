import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditChatRequest {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isEdited: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}
export class EditChatResponse {
  id: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  filePath: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}
