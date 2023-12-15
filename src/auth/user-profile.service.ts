import { z } from 'zod';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Inject, Injectable } from '@nestjs/common';
import { AwsCognitoConfig, ConfigInjectionTokens } from '../config';
import { UserProfile } from './user-profile';
import { UserCredentials } from './user-credentials';
import { PinoLogger } from 'nestjs-pino';

const schema: z.ZodType<UserProfile> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  isEmailVerified: z.coerce.boolean(),
});

const cognitoUserAttributes = [
  'sub',
  'email_verified',
  'name',
  'email',
] as const;

type CognitoUserAttributeName = (typeof cognitoUserAttributes)[number];

// map needs to be kept in sync otherwise validation error will be raised
const cognitoUserAttributesToUserProfileAttributesMap: ReadonlyMap<
  CognitoUserAttributeName,
  keyof UserProfile
> = new Map([
  ['sub', 'id'],
  ['name', 'name'],
  ['email', 'email'],
  ['email_verified', 'isEmailVerified'],
]);

@Injectable()
export class UserProfileService {
  private cognito: CognitoIdentityProviderClient;

  constructor(
    @Inject(ConfigInjectionTokens.AwsCognitoConfig)
    config: AwsCognitoConfig,
    private readonly logger: PinoLogger,
  ) {
    this.cognito = new CognitoIdentityProviderClient({
      region: config.region,
    });
    logger.setContext(UserProfileService.name);
  }

  public async getUserProfile(user: UserCredentials) {
    this.logger.info({ userId: user.id }, 'getting user profile');

    const response = await this.cognito.send(
      new GetUserCommand({
        AccessToken: user.accessToken,
      }),
    );

    const attrs = response.UserAttributes;

    if (!attrs) {
      this.logger.error({ userId: user.id }, 'failed to get user attributes');
      throw new TypeError(`user ${user.id} attributes are empty`);
    }

    this.logger.debug(
      { userId: user.id },
      'mapping aws cognito attributes to user profile',
    );
    return this.mapCognitoUserAttributesToUserProfile(attrs);
  }

  private mapCognitoUserAttributesToUserProfile(
    attrs: NonNullable<GetUserCommandOutput['UserAttributes']>,
  ): UserProfile {
    const obj = attrs.reduce((result, current) => {
      // ignore attribute with empty name
      if (!current.Name) {
        return result;
      }

      // ignore unexpected attribute
      if (!cognitoUserAttributes.includes(current.Name as any)) {
        return result;
      }

      const attrName = current.Name as CognitoUserAttributeName;

      const mappedName =
        cognitoUserAttributesToUserProfileAttributesMap.get(attrName);

      // ignore attribute that could not be mapped
      if (!mappedName) {
        return result;
      }

      return {
        ...result,
        [mappedName]: current.Value,
      };
    }, {});

    const result = schema.safeParse(obj);

    if (!result.success) {
      throw new TypeError(
        JSON.stringify(
          {
            message: 'error parsing user profile',
            issues: result.error.issues,
          },
          null,
          2,
        ),
      );
    }

    return result.data;
  }
}
