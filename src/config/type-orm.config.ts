import { join } from 'path';
import { AppConfig } from './app.config';
import { DbConfig } from './db.config';
import { DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const injectionToken = 'TypeOrmConfig' as const;

export interface TypeOrmConfig {
  asModuleOptions(): TypeOrmModuleOptions;
  asDataSourceOptions(): DataSourceOptions;
}

class TypeOrmConfigImpl implements TypeOrmConfig {
  constructor(
    private appConfig: AppConfig,
    private dbConfig: DbConfig,
  ) {}

  private fromRootDir(path: string) {
    return join(__dirname, '../../', path);
  }

  asDataSourceOptions(): DataSourceOptions {
    const {
      host,
      user: username,
      password,
      port,
      name: database,
    } = this.dbConfig;

    return {
      type: 'postgres' as const,
      host,
      port,
      username,
      password,
      database,
      migrations: [this.fromRootDir('./db/migrations/*{ts,js}')],
      entities: [this.fromRootDir('./**/*.entity.{ts,js}')],
      logging: this.appConfig.isDev(),
      synchronize: false, // do not change
    };
  }

  asModuleOptions(): TypeOrmModuleOptions {
    return {
      ...this.asDataSourceOptions(),
      retryAttempts: 3,
      retryDelay: 3 * 1000, // 3 seconds
      autoLoadEntities: false,
    };
  }
}

export const factory = (
  appConfig: AppConfig,
  dbConfig: DbConfig,
): TypeOrmConfig => {
  return new TypeOrmConfigImpl(appConfig, dbConfig);
};
