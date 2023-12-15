import { z } from 'zod';

export const injectionToken = 'AwsCognitoConfig' as const;

const schema = z
  .object({
    AWS_COGNITO_CLIENT_ID: z.string().min(1),
    AWS_COGNITO_USER_POOL_ID: z.string().min(1),
    AWS_COGNITO_REGION: z.string().min(1),
  })
  .required();

export interface AwsCognitoConfig {
  readonly clientId: string;
  readonly userPoolId: string;
  readonly region: string;
}

export const factory = (): AwsCognitoConfig => {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      JSON.stringify(
        {
          message: 'invalid env config',
          issues: result.error.issues,
        },
        null,
        2,
      ),
    );
  }

  return {
    clientId: result.data.AWS_COGNITO_CLIENT_ID,
    userPoolId: result.data.AWS_COGNITO_USER_POOL_ID,
    region: result.data.AWS_COGNITO_REGION,
  };
};
