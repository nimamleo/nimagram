import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class AddContactRequest {
  @IsNotEmpty()
  @IsPhoneNumber()
  @IsString()
  phone: string;
}
export class AddContactResponse {}
