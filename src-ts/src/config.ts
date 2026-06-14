import fs from 'fs';
import ini from 'ini';
import dotenv from 'dotenv';
import type { AppConfig } from './types/index';

dotenv.config();

export const CONFIG: AppConfig = ini.parse(
    fs.readFileSync('./config/config.ini', 'utf-8')
) as AppConfig;

export const DB_SETTING = {
    // docker-compose が DB_HOST=db を注入するため env を優先
    host: process.env.DB_HOST ?? CONFIG.Database.host,
    user: process.env.USER!,
    password: process.env.USER_PASSWORD!,
    database: 'clandb',
    supportBigNumbers: true,
    bigNumberStrings: true,
};
