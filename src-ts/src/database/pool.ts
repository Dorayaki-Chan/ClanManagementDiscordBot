import mysql from 'mysql2/promise';
import { DB_SETTING } from '../config';

// シングルトン接続プール — 全 DB 操作はこれを import して使う
const pool = mysql.createPool({
    ...DB_SETTING,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;
