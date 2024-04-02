import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class BlockUserRequest {
  @IsNotEmpty()
  @IsPhoneNumber()
  @IsString()
  phone: string;
}
export class BlockUserResponse {}
