import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';

export class UserCredentials {
  readonly id: string;
  readonly accessToken: string;

  private constructor(params: { id: string; accessToken: string }) {
    Object.assign(this, params);
  }

  public toString(): string {
    return `UserCredentials<${this.id}>`;
  }

  static fromAWSCognitoData(params: {
    payload: CognitoAccessTokenPayload;
    accessToken: string;
  }) {
    return new UserCredentials({
      id: params.payload.sub,
      accessToken: params.accessToken,
    });
  }
}
