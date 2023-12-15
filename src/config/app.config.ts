import { z } from 'zod';
import { NonFunctionProperties } from '../shared/non-function-properties';

export const injectionToken = 'AppConfig' as const;

const schema = z
  .object({
    APP_ENV: z.enum(['dev', 'test']).default('dev'),
    APP_PORT: z.coerce.number().int().min(1),
  })
  .required();

export interface AppConfig {
  readonly env: string;
  readonly port: number;

  isDev(): boolean;
}

type AppConfigProps = NonFunctionProperties<AppConfig>;

class AppConfigImpl implements AppConfig {
  readonly env: string;
  readonly port: number;

  constructor(props: AppConfigProps) {
    Object.assign(this, props);
  }

  isDev() {
    return this.env === 'dev';
  }
}

export const factory = (): AppConfig => {
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

  return new AppConfigImpl({
    env: result.data.APP_ENV,
    port: result.data.APP_PORT,
  });
};
