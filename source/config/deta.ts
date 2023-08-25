import { Deta } from 'deta';
import axios from 'axios';

const AUTH_CENTER_API = 'https://ac.source-builder.com';

export enum EnvKey {
    SECRET_KEY = 'SECRET_KEY',
    DATABASE_URL = 'DATABASE_URL'
}

export class EnvMap {
    private static data: Map<string, string>;

    constructor() {
        EnvMap.initData();
    }

    private static async initData() {
        if (!this.data) {
            this.data = new Map<string, string>();
            for (const key in EnvKey) {
                this.data.set(key, await getEnv(key));
            }
        }
        return this.data;
    }

    public static get(key: string) {
        if (!this.data) {
            EnvMap.initData();
        }
        return this.data[key];
    }
}

export async function getEnv(key: string) {
    const db = await getDataBase('data');
    const res = await db.get(key);
    let value = '';
    if (!res) {
        value = await getRemoteEnv(key);
        if (value) await db.put({ value }, key);
    } else {
        value = res['value'].toString();
    }
    return value.toString();
}

async function getDataBase(baseName: string) {
    const deta = Deta();
    const db = deta.Base(baseName);
    const { count } = await db.fetch();
    if (count == 0) {
        const putOne = await db.put({ value: 'value' }, 'key');
        if (putOne) await db.delete('key');
    }
    return db;
}

async function getRemoteEnv(constKey: string) {
    const db = await getDataBase('config');
    const { status, data } = await axios(
        `${AUTH_CENTER_API}/api/env?constKey=${constKey}`,
        {
            headers: {
                'auth-token': (await db.get('AUTH-TOKEN'))['value'].toString()
            }
        }
    );
    if (status != 200) return '';
    return data['data'];
}
