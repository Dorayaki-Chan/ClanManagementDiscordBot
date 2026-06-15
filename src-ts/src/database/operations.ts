import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from './pool';
import { WotbUser, ThunderUser, DiscordUser } from '../structures/profile';
import { role } from '../structures/role';
import { shapDatetime } from '../utils/datetime';
import { CONFIG } from '../config';
import type {
    WotbMemberRow,
    ThunderMemberRow,
    DiscordMemberRow,
    WtActiveRow,
    CountRow,
    ProfileRow,
    RoleData,
    RoleChangeEntry,
    RoleChangeType,
} from '../types/index';
import roleDataRaw from '../../template/roles.json';
import { getLogger } from '../utils/logger';

const roleData = roleDataRaw as RoleData[];
const opLog = getLogger('DB/Operations');

export class OperationDatabase {

    // =========================================================
    // Daily: 3 プラットフォームの入退室同期
    // =========================================================
    static async Daily(
        wotbNewusers: WotbUser[],
        thunderNewusers: ThunderUser[],
        discordNewusers: DiscordUser[]
    ) {
        const [dailyWotb, dailyThunder] = await Promise.all([
            OperationDatabase.#wotbDaily(wotbNewusers),
            OperationDatabase.#thunderDaily(thunderNewusers),
        ]);
        const dailyDiscord = await OperationDatabase.#discordDaily(discordNewusers);
        return [dailyWotb, dailyThunder, dailyDiscord] as const;
    }

    static async #wotbDaily(newusers: WotbUser[]) {
        const [rows] = await pool.query<(WotbMemberRow & RowDataPacket)[]>(
            `SELECT * FROM w_wotb_members NATURAL INNER JOIN r_roles WHERE w_is_flag = true`
        );

        const lefters = rows
            .filter(older => !newusers.some(n => n.id === older.w_user_id))
            .map(older => {
                const user = new WotbUser();
                user.id = older.w_user_id;
                user.ign = older.w_ign;
                if (older.r_dis_id) user.setrole = [older.r_dis_id];
                if (older.w_enter_at) user.setEnter = older.w_enter_at;
                if (older.w_left_at) user.setLeft = older.w_left_at;
                user.isflag = false;
                return user;
            });

        const enters = newusers.filter(
            newer => !rows.some(o => newer.id === o.w_user_id)
        );

        if (lefters.length) {
            const ids = lefters.map(u => u.id);
            const day = new shapDatetime();
            await pool.query(
                `UPDATE w_wotb_members SET w_is_flag = false, w_left_at = ? WHERE w_user_id IN (?)`,
                [day.getDateTime, ids]
            );
        }

        if (enters.length) {
            const values = enters.map(u => [
                u.id,
                u.ign,
                u.role?.main?.id ?? 1,
                u.enter_at?.getDateTime ?? null,
                true,
            ]);
            await pool.query(
                `INSERT INTO w_wotb_members (w_user_id, w_ign, r_id, w_enter_at, w_is_flag)
                 VALUES ?
                 ON DUPLICATE KEY UPDATE w_is_flag = VALUES(w_is_flag)`,
                [values]
            );
        }

        return { lefters, enters };
    }

    static async #thunderDaily(newusers: ThunderUser[]) {
        const [rows] = await pool.query<(ThunderMemberRow & RowDataPacket)[]>(
            `SELECT * FROM t_wt_members NATURAL INNER JOIN r_roles WHERE t_is_flag = true`
        );

        const lefters = rows
            .filter(older => !newusers.some(n => n.ign === older.t_ign))
            .map(older => {
                const user = new ThunderUser();
                user.id = older.t_user_id;
                user.ign = older.t_ign;
                if (older.r_dis_id) user.setrole = [older.r_dis_id];
                if (older.t_enter_at) user.setEnter = older.t_enter_at;
                if (older.t_left_at) user.setLeft = older.t_left_at;
                user.allactive = older.t_all_active;
                user.isflag = false;
                return user;
            });

        const enters = newusers.filter(
            newer => !rows.some(o => newer.ign === o.t_ign)
        );

        if (lefters.length) {
            const ids = lefters.map(u => u.id);
            const day = new shapDatetime();
            await pool.query(
                `UPDATE t_wt_members SET t_is_flag = false, t_left_at = ? WHERE t_user_id IN (?)`,
                [day.getDateTime, ids]
            );
        }

        for (const user of enters) {
            const [result] = await pool.query<ResultSetHeader & RowDataPacket>(
                `INSERT INTO t_wt_members (t_ign, r_id, t_enter_at, t_is_flag)
                 VALUES (?, ?, ?, true)
                 ON DUPLICATE KEY UPDATE t_is_flag = VALUES(t_is_flag)`,
                [user.ign, user.role?.main?.id ?? 1, user.enter_at?.getDateTime ?? null]
            );
            user.id = result.insertId;
        }

        return { lefters, enters };
    }

    static async #discordDaily(newusers: DiscordUser[]) {
        const [rows] = await pool.query<(DiscordMemberRow & RowDataPacket)[]>(
            `SELECT * FROM d_discord_members NATURAL INNER JOIN r_roles WHERE d_is_flag = true`
        );

        const lefters: DiscordUser[] = [];
        for (const older of rows) {
            if (!newusers.some(n => n.id === older.d_user_id)) {
                const user = new DiscordUser();
                user.id = older.d_user_id;
                user.ign = older.d_ign;
                if (older.r_dis_id) user.setrole = [older.r_dis_id];
                if (older.d_enter_at) user.setEnter = older.d_enter_at;
                if (older.d_left_at) user.setLeft = older.d_left_at;
                user.username = older.d_name;
                user.nick = older.d_nick;
                user.isflag = false;
                user.subign = older.d_subign;
                user.upignFlag = older.d_upign_flag;
                lefters.push(user);
            }
        }

        const enters = newusers.filter(
            newer => !rows.some(o => newer.id === o.d_user_id)
        );

        if (lefters.length) {
            const ids = lefters.map(u => BigInt(u.id as string));
            const day = new shapDatetime();
            await pool.query(
                `UPDATE d_discord_members SET d_is_flag = false, d_left_at = ? WHERE d_user_id IN (?)`,
                [day.getDateTime, ids]
            );
        }

        if (enters.length) {
            const values = enters.map(u => [
                BigInt(u.id as string),
                u.username,
                u.ign,
                u.nick,
                u.role?.main?.id ?? 1,
                u.enter_at?.getDateTime ?? null,
                true,
            ]);
            await pool.query(
                `INSERT INTO d_discord_members (d_user_id, d_name, d_ign, d_nick, r_id, d_enter_at, d_is_flag)
                 VALUES ?
                 ON DUPLICATE KEY UPDATE d_is_flag = VALUES(d_is_flag)`,
                [values]
            );
        }

        // 全メンバーの IGN・ゲームアカウント紐づけを更新
        const toChanges = await Promise.all(
            newusers.map(async user => {
                const [subRows] = await pool.query<RowDataPacket[]>(
                    `SELECT d_subign, d_upign_flag FROM d_discord_members WHERE d_ign = ?`,
                    [user.id]
                );
                const sub = subRows[0] as { d_subign: string | null; d_upign_flag: boolean } | undefined;
                const wotbIgn = sub?.d_upign_flag && sub.d_subign ? sub.d_subign : user.ign;

                const [thunderRows] = await pool.query<(ThunderMemberRow & RowDataPacket)[]>(
                    `SELECT * FROM t_wt_members NATURAL INNER JOIN r_roles WHERE t_ign = ?`,
                    [user.ign]
                );
                const [wotbRows] = await pool.query<(WotbMemberRow & RowDataPacket)[]>(
                    `SELECT * FROM w_wotb_members NATURAL INNER JOIN r_roles WHERE w_ign = ?`,
                    [wotbIgn]
                );

                if (wotbRows.length) {
                    user.wotbClass = OperationDatabase.#rowToWotbUser(wotbRows[0]);
                }
                if (thunderRows.length) {
                    user.thunderClass = OperationDatabase.#rowToThunderUser(thunderRows[0]);
                }

                const rightDiscordRole = OperationDatabase.#determineRoleChange(user);

                await pool.query(
                    `UPDATE d_discord_members
                     SET d_name = ?, d_nick = ?, d_ign = ?,
                         w_user_id = ?, t_user_id = ?, r_id = ?
                     WHERE d_user_id = ?`,
                    [
                        user.username,
                        user.nick,
                        user.ign,
                        user.wotbClass?.id ?? null,
                        user.thunderClass?.id ?? null,
                        user.role?.main?.id ?? 1,
                        BigInt(user.id as string),
                    ]
                );

                return rightDiscordRole;
            })
        );

        return {
            lefters,
            enters,
            roleChange: toChanges.filter((e): e is RoleChangeEntry => e !== null),
        };
    }

    // =========================================================
    // /info profile 用プロフィール取得
    // =========================================================
    static async getProfile(discordUserId: string): Promise<ProfileRow[]> {
        const [rows] = await pool.query<(ProfileRow & RowDataPacket)[]>(
            `SELECT d_user_id, d_enter_at, d_ign, d_name, t_ign, w_ign,
                    d_discord_members.r_id as d_r_id,
                    t_wt_members.r_id as t_r_id,
                    w_wotb_members.r_id as w_r_id,
                    t_enter_at, w_enter_at
             FROM d_discord_members
             LEFT JOIN t_wt_members ON t_wt_members.t_user_id = d_discord_members.t_user_id
             LEFT JOIN w_wotb_members ON w_wotb_members.w_user_id = d_discord_members.w_user_id
             WHERE d_user_id = ?
             LIMIT 1`,
            [BigInt(discordUserId)]
        );
        return rows;
    }

    // =========================================================
    // 特例処置者管理
    // =========================================================
    static specialUser() {
        return {
            async addSpecialUser(ign: string): Promise<ResultSetHeader> {
                const [result] = await pool.query<ResultSetHeader>(
                    `UPDATE t_wt_members SET t_special_treatment = true WHERE t_ign = ?`,
                    [ign]
                );
                return result;
            },
            async removeSpecialUser(ign: string): Promise<ResultSetHeader> {
                const [result] = await pool.query<ResultSetHeader>(
                    `UPDATE t_wt_members SET t_special_treatment = false WHERE t_ign = ?`,
                    [ign]
                );
                return result;
            },
            async getSpecialUsers(): Promise<Array<{ ign: string }>> {
                const [rows] = await pool.query<RowDataPacket[]>(
                    `SELECT t_ign as ign FROM t_wt_members WHERE t_special_treatment = true`
                );
                return rows as Array<{ ign: string }>;
            },
        };
    }

    // =========================================================
    // Monthly: アクティビティ更新 + キック候補抽出
    // =========================================================
    // メモ：戻り値は30日未経過の場合は null、経過済みは ThunderUser[]（空配列含む）
    static async Monthly(thunderUser: ThunderUser[], discordUser: DiscordUser[]) {
        // 前回のアクティビティ更新から30日経過しているかを判定
        const [rows] = await pool.query<(CountRow & RowDataPacket)[]>(
            `SELECT COUNT(*) AS count_is FROM wt_actives
             WHERE CURRENT_DATE() >= DATE(DATE_ADD(
               (SELECT MAX(wt_created_at) FROM wt_actives), INTERVAL 30 DAY
             ))`
        );
        if (Number(rows[0].count_is)) {
            opLog.info('アクティビティを更新します');
            await OperationDatabase.#UpdateActivity(thunderUser);
            opLog.info('キック候補を抽出します');
            return OperationDatabase.LetLeftUser(thunderUser, discordUser);
        } else {
            opLog.info('アクティビティ更新スキップ: 前回から30日未経過');
            return null;
        }
    }

    static async #UpdateActivity(thunderUser: ThunderUser[]) {
        const [dbRows] = await pool.query<(ThunderMemberRow & RowDataPacket)[]>(
            `SELECT * FROM t_wt_members`
        );

        const values: [number, number][] = [];
        for (const user of thunderUser) {
            const match = dbRows.find(r => r.t_ign === user.ign);
            if (match) {
                user.id = match.t_user_id;
                user.allactive = match.t_all_active + user.nowactive;
                values.push([match.t_user_id, user.nowactive]);
            }
        }

        if (values.length) {
            await pool.query(
                `INSERT INTO wt_actives (t_user_id, wt_active) VALUES ?`,
                [values]
            );
            await Promise.all(
                thunderUser
                    .filter(u => u.id !== null)
                    .map(u =>
                        pool.query(
                            `UPDATE t_wt_members SET t_all_active = ? WHERE t_user_id = ?`,
                            [u.allactive, u.id]
                        )
                    )
            );
        }
    }

    static async LetLeftUser(
        thunderUser: ThunderUser[],
        discordUser: DiscordUser[]
    ): Promise<ThunderUser[]> {
        const now = new Date();
        // 今の日付からキック猶予日数を引いた日付を算出し、最終入室日時がそれより前のユーザーをキック候補とする
        now.setDate(now.getDate() - Number(CONFIG.KickMember.progress));

        const results = await Promise.all(
            thunderUser.map(async tuser => {
                // 活動時間が規定以上
                if (tuser.nowactive > Number(CONFIG.KickMember.minactivity)) return null;
                // 最終入室日時が猶予日数より後
                if (!tuser.enter_at || tuser.enter_at.getDateType >= now) return null;
                // Discordに同一のIGNが存在する場合はキック対象外
                if (discordUser.some(d => d.ign === tuser.ign)) return null;
                // 特例処置対象の場合はキック対象外
                const [rows] = await pool.query<(CountRow & RowDataPacket)[]>(
                    `SELECT COUNT(*) AS count_is FROM t_wt_members
                     WHERE t_ign = ? AND t_special_treatment = true`,
                    [tuser.ign]
                );
                if (Number(rows[0].count_is)) return null;
                return tuser;
            })
        );
        return results.filter((u): u is ThunderUser => u !== null);
    }

    // =========================================================
    // Private helpers
    // =========================================================
    static #rowToWotbUser(row: WotbMemberRow): WotbUser {
        const user = new WotbUser();
        user.id = row.w_user_id;
        user.ign = row.w_ign;
        if (row.r_dis_id) user.setrole = [row.r_dis_id];
        if (row.w_enter_at) user.setEnter = row.w_enter_at;
        if (row.w_left_at) user.setLeft = row.w_left_at;
        user.isflag = row.w_is_flag;
        return user;
    }

    static #rowToThunderUser(row: ThunderMemberRow): ThunderUser {
        const user = new ThunderUser();
        user.id = row.t_user_id;
        user.ign = row.t_ign;
        if (row.r_dis_id) user.setrole = [row.r_dis_id];
        if (row.t_enter_at) user.setEnter = row.t_enter_at;
        if (row.t_left_at) user.setLeft = row.t_left_at;
        user.allactive = row.t_all_active;
        user.isflag = row.t_is_flag;
        return user;
    }

    static #determineRoleChange(user: DiscordUser): RoleChangeEntry | null {
        const toChange: { user: DiscordUser; change: RoleChangeType } = {
            user,
            change: 'no',
        };
        const mainId = user.role?.main?.id;

        if (user.wotbClass?.isflag || user.thunderClass?.isflag) {
            if (mainId === 3 || mainId === 5 || mainId === 6) {
                toChange.change = 'toClanmem';
                const memberRole = roleData.find(r => r.id === 4);
                if (memberRole) user.role!.main = new role(memberRole);
                return toChange;
            }
        } else {
            if (mainId === 4) {
                toChange.change = 'toGenro';
                const genroRole = roleData.find(r => r.id === 3);
                if (genroRole) user.role!.main = new role(genroRole);
                return toChange;
            }
        }
        return null;
    }
}
