import { Module } from '@nestjs/common';
import * as appConfig from './app.config';
import * as dbConfig from './db.config';
import * as typeOrmConfig from './type-orm.config';
import * as awsCognitoConfig from './aws-cognito.config';
import * as awsSqsConfig from './aws-sqs.config';

@Module({
  imports: [],
  providers: [
    {
      provide: appConfig.injectionToken,
      useFactory: appConfig.factory,
    },
    {
      provide: dbConfig.injectionToken,
      useFactory: dbConfig.factory,
    },
    {
      provide: awsCognitoConfig.injectionToken,
      useFactory: awsCognitoConfig.factory,
    },
    {
      provide: awsSqsConfig.injectionToken,
      useFactory: awsSqsConfig.factory,
    },
    {
      provide: typeOrmConfig.injectionToken,
      inject: [appConfig.injectionToken, dbConfig.injectionToken],
      useFactory: typeOrmConfig.factory,
    },
  ],
  exports: [
    appConfig.injectionToken,
    awsCognitoConfig.injectionToken,
    awsSqsConfig.injectionToken,
    typeOrmConfig.injectionToken,
  ],
})
export class ConfigModule {}
