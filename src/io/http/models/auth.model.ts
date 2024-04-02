import { isMobilePhone, IsNotEmpty, isString } from 'class-validator';
import {
  Must,
  NotNull,
} from '../../../common/validations/custom-validation/must-sync.rule';

export class AuthRequest {
  @IsNotEmpty()
  @Must((x) => isMobilePhone(x), NotNull, { message: 'phone is not valid' })
  phone: string;

  @IsNotEmpty()
  @Must((x) => isString(x), NotNull, { message: 'name is not valid' })
  name: string;

  @IsNotEmpty()
  @Must((x) => isString(x), NotNull, { message: 'username is not valid' })
  username: string;
}

export class AuthResponse {
  id: string;
  name: string;
  username: string;
  phone: string;
  acToken: string;
  rtToken: string;
  createdAt: string;
  updatedAt: string;
}
