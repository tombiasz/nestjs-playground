import { z } from 'zod';

export const injectionToken = 'DbConfig' as const;

const schema = z
  .object({
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().min(1),
  })
  .required();

export interface DbConfig {
  readonly name: string;
  readonly user: string;
  readonly password: string;
  readonly host: string;
  readonly port: number;
}

export const factory = (): DbConfig => {
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
    name: result.data.DB_NAME,
    user: result.data.DB_USER,
    password: result.data.DB_PASSWORD,
    host: result.data.DB_HOST,
    port: result.data.DB_PORT,
  };
};
