import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UserCredentials } from './user-credentials';
import { AwsCognitoConfig, ConfigInjectionTokens } from '../config';
import { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';

@Injectable()
export class AuthGuard implements CanActivate {
  private verifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    clientId: string;
    tokenUse: 'access';
  }>;

  constructor(
    @Inject(ConfigInjectionTokens.AwsCognitoConfig)
    private config: AwsCognitoConfig,
    private reflector: Reflector,
  ) {
    this.verifier = CognitoJwtVerifier.create({
      userPoolId: this.config.userPoolId,
      clientId: this.config.clientId,
      tokenUse: 'access',
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.verifier.verify(token);

      request['user'] = UserCredentials.fromAWSCognitoData({
        payload,
        accessToken: token,
      });
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
