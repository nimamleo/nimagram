import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { AuthService } from '../../../infrastructure/auth/service/auth.service';
import { Err, Result } from '../../../common/result';
import { IUserEntity } from '../../../models/user/user.model';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToWs().getClient();
    const token = await this.extractToken(request);
    const verifyTokenRes = await this.verifyToken(token);
    request['wsUser'] = verifyTokenRes.value;
    return !!verifyTokenRes.isOk();
  }

  async extractToken(req: IncomingMessage) {
    const token = req?.headers?.authorization;
    if (!token) {
      return null;
    }
    const splitToken = token.split(' ');
    if (splitToken.length !== 2) {
      return null;
    }

    if (splitToken[0] === 'Bearer') {
      return splitToken[1];
    }

    return null;
  }

  async verifyToken(token: string): Promise<Result<IUserEntity>> {
    const verifyRes = await this.authService.verifyToken(token);
    if (verifyRes.isError()) {
      return Err(verifyRes.err);
    }

    return verifyRes;
  }
}
