import { z } from 'zod';

export const injectionToken = 'AwsSqsConfig' as const;

const schema = z
  .object({
    AWS_SQS_URL: z.string().min(1),
    AWS_SQS_REGION: z.string().min(1),
  })
  .required();

export interface AwsSqsConfig {
  readonly queueUrl: string;
  readonly region: string;
}

export const factory = (): AwsSqsConfig => {
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
    queueUrl: result.data.AWS_SQS_URL,
    region: result.data.AWS_SQS_REGION,
  };
};
