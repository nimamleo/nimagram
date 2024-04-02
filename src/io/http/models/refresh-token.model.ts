import { IsNotEmpty } from 'class-validator';

export class RefreshTokenRequest {
  @IsNotEmpty()
  rfToken: string;
}
export class RefreshTokenResponse {
  acToken: string;
  rfToken: string;
}
