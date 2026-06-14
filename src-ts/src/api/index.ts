import axios from 'axios';
import type { AxiosError } from 'axios';
import { WotbUser, ThunderUser, DiscordUser } from '../structures/profile';
import { WhatYourIgn } from '../utils/ign';
import { Scrape } from './scraping';
import { CONFIG } from '../config';
import type { WotbClanApiResponse, DiscordMemberApiResponse } from '../types/index';
import { getLogger } from '../utils/logger';

const log = getLogger('API');

/** 3 プラットフォーム（WarThunder / WotB / Discord）への API リクエスト統合クラス */
export class IntegrationApiRequest {
    static requestThunder(): Promise<ThunderUser[]> {
        return Scrape.thunderClanTable();
    }

    static async requestWotb(): Promise<WotbUser[]> {
        const url =
            `https://api.wotblitz.asia/wotb/clans/info/` +
            `?application_id=${CONFIG.WargamingConfig.applicationid}` +
            `&clan_id=${CONFIG.WargamingConfig.clanid}` +
            `&extra=members&fields=members%2C+members_ids%2C+updated_at%2C+members_count%2C+tag`;

        const start = Date.now();
        log.info('WotB API リクエスト開始');
        try {
            const { data } = await axios.get<WotbClanApiResponse>(url);
            const members = data.data[CONFIG.WargamingConfig.clanid].members;
            const users = Object.entries(members).map(([id, member]) => {
                const user = new WotbUser();
                user.id = Number(id);
                user.ign = member.account_name;
                user.setrole = [member.role];
                user.setEnter = member.joined_at;
                user.isflag = true;
                return user;
            });
            log.info(`WotB API 完了: ${users.length} 名 (${Date.now() - start}ms)`);
            return users;
        } catch (err) {
            const e = err as AxiosError;
            log.error(`WotB API エラー: ${e.response?.status ?? 'N/A'} ${e.message}`);
            throw err;
        }
    }

    static async requestDiscord(): Promise<DiscordUser[]> {
        const url =
            `https://discord.com/api/v10/guilds/${CONFIG.DiscordConfig.guildid}` +
            `/members?limit=${CONFIG.DiscordConfig.limit}`;

        const start = Date.now();
        log.info('Discord API リクエスト開始');
        try {
            const { data } = await axios.get<DiscordMemberApiResponse[]>(url, {
                headers: { Authorization: `Bot ${CONFIG.Credentials.token}` },
            });
            const users = data
                .filter(member => !member.user.bot)
                .map(member => {
                    const user = new DiscordUser();
                    user.id = member.user.id;
                    user.ign = WhatYourIgn.getign(member.user.username, member.nick);
                    user.setrole = member.roles;
                    user.setEnter = member.joined_at;
                    user.username = member.user.username;
                    user.nick = member.nick;
                    user.isflag = true;
                    return user;
                });
            log.info(`Discord API 完了: ${users.length} 名 (${Date.now() - start}ms)`);
            return users;
        } catch (err) {
            const e = err as AxiosError;
            log.error(`Discord API エラー: ${e.response?.status ?? 'N/A'} ${e.message}`);
            throw err;
        }
    }
}
