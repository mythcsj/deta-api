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
    const deta = Deta();
    const db = deta.Base('data');
    const res = await db.get(key);
    let value = '';
    if (!res) {
        value = await getRemoteEnv(key);
        if (value) {
            await db.put({ value }, key);
        }
    }
    return value.toString();
}

async function getRemoteEnv(constKey: string) {
    const { data } = await axios(
        `${AUTH_CENTER_API}/api/env?constKey=${constKey}`
    );
    return data['data'];
}
