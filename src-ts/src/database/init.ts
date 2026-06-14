/**
 * DB スキーマ初期化スクリプト（初回のみ実行）
 * 実行: npm run createDB
 */
import pool from './pool';
import { IntegrationApiRequest } from '../api/index';
import roleDataRaw from '../../template/roles.json';
import type { RoleData } from '../types/index';
import type { ResultSetHeader } from 'mysql2/promise';

const roleData = roleDataRaw as RoleData[];

async function createDatabase(): Promise<void> {
    await createTables();
    console.log('テーブル作成完了');

    const [discordUsers, wotbUsers, thunderUsers] = await Promise.all([
        IntegrationApiRequest.requestDiscord(),
        IntegrationApiRequest.requestWotb(),
        IntegrationApiRequest.requestThunder(),
    ]);
    console.log('API 取得完了');

    await insertRoleInfo();
    await insertThunderInfo(thunderUsers);
    discordUsers.forEach(u => u.setgameid(wotbUsers, thunderUsers));
    await insertWotbInfo(wotbUsers);
    await insertDiscordInfo(discordUsers);
    console.log('データ挿入完了');

    await pool.end();
}

async function createTables(): Promise<void> {
    await Promise.all([
        pool.query(`
            CREATE TABLE IF NOT EXISTS r_roles (
                r_id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
                r_name VARCHAR(20) UNIQUE NOT NULL,
                r_dis_id VARCHAR(18)
            )
        `),
        pool.query(`
            CREATE TABLE IF NOT EXISTS w_wotb_members (
                w_user_id INT UNSIGNED NOT NULL PRIMARY KEY,
                w_ign VARCHAR(24) UNIQUE NOT NULL,
                r_id TINYINT UNSIGNED NOT NULL,
                w_enter_at DATETIME,
                w_left_at DATETIME,
                w_is_flag BOOLEAN DEFAULT true NOT NULL,
                w_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                w_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX rw_index(r_id),
                CONSTRAINT fk_rw_id FOREIGN KEY (r_id) REFERENCES r_roles (r_id)
                    ON DELETE RESTRICT ON UPDATE CASCADE
            )
        `),
        pool.query(`
            CREATE TABLE IF NOT EXISTS t_wt_members (
                t_user_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
                t_ign VARCHAR(16) UNIQUE NOT NULL,
                r_id TINYINT UNSIGNED NOT NULL,
                t_enter_at DATE,
                t_left_at DATE,
                t_is_flag BOOLEAN DEFAULT true NOT NULL,
                t_all_active INT DEFAULT 0 NOT NULL,
                t_special_treatment BOOLEAN DEFAULT false NOT NULL,
                t_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                t_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX rt_index(r_id),
                CONSTRAINT fk_rt_id_ FOREIGN KEY (r_id) REFERENCES r_roles (r_id)
                    ON DELETE RESTRICT ON UPDATE CASCADE
            )
        `),
        pool.query(`
            CREATE TABLE IF NOT EXISTS d_discord_members (
                d_user_id BIGINT NOT NULL PRIMARY KEY,
                d_name VARCHAR(32) NOT NULL,
                w_user_id INT UNSIGNED,
                t_user_id INT UNSIGNED,
                r_id TINYINT UNSIGNED NOT NULL,
                d_nick VARCHAR(32),
                d_ign VARCHAR(32) NOT NULL,
                d_enter_at DATETIME NOT NULL,
                d_left_at DATETIME,
                d_is_flag BOOLEAN DEFAULT true NOT NULL,
                d_sub_id BIGINT UNIQUE,
                d_subign VARCHAR(32),
                d_upign_flag BOOLEAN DEFAULT false NOT NULL,
                d_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                d_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX wd_index(w_user_id),
                INDEX td_index(t_user_id),
                INDEX rd_index(r_id),
                CONSTRAINT fk_rd_id FOREIGN KEY (r_id) REFERENCES r_roles (r_id)
                    ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT fk_wd_id FOREIGN KEY (w_user_id) REFERENCES w_wotb_members (w_user_id)
                    ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT fk_td_id FOREIGN KEY (t_user_id) REFERENCES t_wt_members (t_user_id)
                    ON DELETE RESTRICT ON UPDATE CASCADE
            )
        `),
        pool.query(`
            CREATE TABLE IF NOT EXISTS wt_actives (
                wt_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
                t_user_id INT UNSIGNED NOT NULL,
                wt_active SMALLINT NOT NULL,
                wt_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX wta_index(t_user_id),
                CONSTRAINT fk_wt_active FOREIGN KEY (t_user_id) REFERENCES t_wt_members (t_user_id)
                    ON DELETE RESTRICT ON UPDATE CASCADE
            )
        `),
    ]);
}

async function insertRoleInfo(): Promise<void> {
    const values = roleData.map(r => [r.id, r.name, r.discordid]);
    await pool.query(
        `INSERT INTO r_roles (r_id, r_name, r_dis_id) VALUES ?`,
        [values]
    );
}

async function insertThunderInfo(thunderUsers: import('../structures/profile').ThunderUser[]): Promise<void> {
    await Promise.all(
        thunderUsers.map(async user => {
            user.setActive();
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO t_wt_members (t_ign, r_id, t_enter_at, t_all_active) VALUES (?, ?, ?, ?)`,
                [user.ign, user.role?.main?.id ?? 1, user.enter_at?.getDate ?? null, user.allactive]
            );
            await pool.query(
                `INSERT INTO wt_actives (t_user_id, wt_active) VALUES (?, ?)`,
                [result.insertId, user.nowactive]
            );
            user.id = result.insertId;
        })
    );
}

async function insertWotbInfo(wotbUsers: import('../structures/profile').WotbUser[]): Promise<void> {
    const values = wotbUsers.map(u => [u.id, u.ign, u.role?.main?.id ?? 1, u.enter_at?.getDateTime ?? null]);
    await pool.query(
        `INSERT INTO w_wotb_members (w_user_id, w_ign, r_id, w_enter_at) VALUES ?`,
        [values]
    );
}

async function insertDiscordInfo(discordUsers: import('../structures/profile').DiscordUser[]): Promise<void> {
    const values = discordUsers.map(u => [
        BigInt(u.id as string),
        u.username,
        u.wotbClass?.id ?? null,
        u.thunderClass?.id ?? null,
        u.role?.main?.id ?? 1,
        u.nick,
        u.ign,
        u.enter_at?.getDateTime ?? null,
    ]);
    await pool.query(
        `INSERT INTO d_discord_members (d_user_id, d_name, w_user_id, t_user_id, r_id, d_nick, d_ign, d_enter_at) VALUES ?`,
        [values]
    );
}

createDatabase().catch(console.error);
