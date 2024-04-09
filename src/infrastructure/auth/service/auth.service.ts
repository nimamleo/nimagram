import { Inject, Injectable } from '@nestjs/common';
import { IAuthProvider } from '../provider/auth.provider';
import { IVerifyUser } from '../../../models/verify-user.model';
import { Err, Ok, Result } from '../../../common/result';
import { IUser, IUserEntity } from '../../../models/user/user.model';
import { JwtService } from '@nestjs/jwt';
import { IJwtConfig, JWT_CONFIG_TOKEN } from '../jwt/config/jwt.config';
import { ConfigService } from '@nestjs/config';
import { HandleError } from '../../../common/decorators/handler-error.decorator';
import {
  IUserProvider,
  USER_DATABASE_PROVIDER,
} from '../../database/provider/user/user.provider';
import { GenericErrorCode } from '../../../common/errors/generic-error';

@Injectable()
export class AuthService implements IAuthProvider {
  private readonly jwtConfig: IJwtConfig;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_DATABASE_PROVIDER)
    private readonly userRepository: IUserProvider,
  ) {
    this.jwtConfig = this.configService.get<IJwtConfig>(JWT_CONFIG_TOKEN);
  }

  @HandleError
  async signToken(iUser: Partial<IUser>): Promise<Result<IVerifyUser>> {
    const actoken = this.jwtService.sign(
      {
        phone: iUser.phone,
        username: iUser.username,
      },
      { secret: this.jwtConfig.secret, expiresIn: '1d' },
    );

    const rftoken = this.jwtService.sign(
      {
        phone: iUser.phone,
        username: iUser.username,
      },
      { secret: this.jwtConfig.secret, expiresIn: '7d' },
    );

    return Ok({ acToken: actoken, rfToken: rftoken });
  }

  @HandleError
  async verifyToken(token: string): Promise<Result<IUserEntity>> {
    if (!token) {
      return Err('token not provided', GenericErrorCode.UNAUTHORIZED);
    }
    const userInToken = await this.jwtService.verify(token, {
      secret: this.jwtConfig.secret,
    });
    console.log(userInToken);

    if (!userInToken) {
      return Err('token is not valid');
    }

    const user = await this.userRepository.getUser(userInToken.phone);
    if (user.isError()) {
      return Err('unauthorized');
    }
    console.log(user);

    return Ok(user.value);
  }

  @HandleError
  async refreshToken(acToken: string): Promise<Result<IVerifyUser>> {
    const verifyToken = await this.verifyToken(acToken);
    if (verifyToken.isError()) {
      return Err('unauthorized');
    }
    const tokens = await this.signToken(verifyToken.value);
    if (tokens.isError()) {
      return Err('unauthorized');
    }

    return Ok({ acToken: tokens.value.acToken, rfToken: tokens.value.rfToken });
  }
}
