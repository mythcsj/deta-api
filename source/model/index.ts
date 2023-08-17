import { ConnectionOptions, parse } from 'pg-connection-string';
import { DataSource } from 'typeorm';

import { User } from './User';
import { EnvMap } from '../config/deta';

export * from './Base';
export * from './User';

const DATABASE_URL = EnvMap.get('DATABASE_URL');

const { host, port, user, password, database } = DATABASE_URL
    ? parse(DATABASE_URL)
    : ({} as ConnectionOptions);

const commonOptions = {
    synchronize: true,
    entities: [User],
    migrations: [`.data/*.ts`]
};

export default new DataSource({
    type: 'postgres',
    host,
    port: +port,
    username: user,
    password,
    database,
    logging: true,
    ...commonOptions
});
