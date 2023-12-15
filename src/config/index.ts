export { ConfigModule } from './config.module';

export type { AppConfig } from './app.config';
export type { AwsCognitoConfig } from './aws-cognito.config';
export type { DbConfig } from './db.config';
export type { AwsSqsConfig } from './aws-sqs.config';
export type { TypeOrmConfig } from './type-orm.config';

import * as appConfig from './app.config';
import * as dbConfig from './db.config';
import * as typeOrmConfig from './type-orm.config';
import * as awsCognitoConfig from './aws-cognito.config';
import * as awsSqsConfig from './aws-sqs.config';

export const ConfigInjectionTokens = {
  [appConfig.injectionToken]: appConfig.injectionToken,
  [dbConfig.injectionToken]: dbConfig.injectionToken,
  [typeOrmConfig.injectionToken]: typeOrmConfig.injectionToken,
  [awsCognitoConfig.injectionToken]: awsCognitoConfig.injectionToken,
  [awsSqsConfig.injectionToken]: awsSqsConfig.injectionToken,
};
