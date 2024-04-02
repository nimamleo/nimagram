import { Body, Controller, Get, Logger, Post, Put } from '@nestjs/common';
import { AuthRequest, AuthResponse } from './models/auth.model';
import { UserService } from '../../application/user/user.service';
import { StdResponse } from '../../common/std-response/std-response';
import { Err, Ok } from '../../common/result';
import { AuthService } from '../../infrastructure/auth/service/auth.service';
import { GenericErrorCode } from '../../common/errors/generic-error';
import {
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './models/refresh-token.model';

@Controller('auth')
export class AuthHttpController {
  private readonly logger = new Logger(AuthHttpController.name);
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('verify')
  async verifyUser(@Body() body: AuthRequest) {
    const isUserExist = await this.userService.getUser(body.phone);
    if (isUserExist.isError()) {
      if (isUserExist.err.code !== GenericErrorCode.NOT_FOUND) {
        return StdResponse.fromResult(Err(isUserExist.err));
      }
    }

    if (isUserExist.isOk()) {
      const token = await this.authService.signToken(isUserExist.value);
      if (token.isError()) {
        return StdResponse.fromResult(Err(token.err));
      }
      return StdResponse.fromResult(
        Ok<AuthResponse>({
          id: isUserExist.value.id,
          name: isUserExist.value.name,
          phone: isUserExist.value.phone,
          username: isUserExist.value.username,
          acToken: token.value.acToken,
          rtToken: token.value.rfToken,
          createdAt: isUserExist.value.createdAt.toISOString(),
          updatedAt: isUserExist.value.updatedAt.toISOString(),
        }),
      );
    }
    const userRes = await this.userService.createUser({
      name: body.name,
      phone: body.phone,
      username: body.username,
      bio: undefined,
      avatar: undefined,
      lastOnline: new Date(),
      rfToken: '',
      contacts: [],
      blockedUsers: [],
      conversations: [],
    });
    if (userRes.isError()) {
      return StdResponse.fromResult(Err(userRes.err));
    }

    const token = await this.authService.signToken(userRes.value);
    if (token.isError()) {
      return StdResponse.fromResult(Err(token.err));
    }

    const saveRfToken = await this.userService.updateUser(userRes.value.id, {
      rfToken: token.value.rfToken,
    });
    if (saveRfToken.isError()) {
      return StdResponse.fromResult(Err(saveRfToken.err));
    }

    return StdResponse.fromResult(
      Ok<AuthResponse>({
        id: userRes.value.id,
        name: userRes.value.name,
        phone: userRes.value.phone,
        username: userRes.value.username,
        acToken: token.value.acToken,
        rtToken: token.value.rfToken,
        createdAt: userRes.value.createdAt.toISOString(),
        updatedAt: userRes.value.updatedAt.toISOString(),
      }),
    );
  }

  @Get('refreshToken')
  async refreshToken(@Body() body: RefreshTokenRequest) {
    const res = await this.authService.refreshToken(body.rfToken);
    if (res.isError()) {
      return StdResponse.fromResult(Err(res.err));
    }

    return StdResponse.fromResult(
      Ok<RefreshTokenResponse>({
        acToken: res.value.acToken,
        rfToken: res.value.rfToken,
      }),
    );
  }
}
