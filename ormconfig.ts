import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as appConfig from './src/config/app.config';
import * as dbConfig from './src/config/db.config';
import * as typeOrmConfig from './src/config/type-orm.config';

dotenv.config();

const ds = new DataSource(
  typeOrmConfig
    .factory(appConfig.factory(), dbConfig.factory())
    .asDataSourceOptions(),
);

export default ds;
