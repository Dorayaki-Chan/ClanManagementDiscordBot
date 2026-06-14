import axios from 'axios';
import type { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { ThunderUser } from '../structures/profile';
import { CONFIG } from '../config';
import { getLogger } from '../utils/logger';

const log = getLogger('API/Scraping');

const THUNDER_URL = encodeURI(
    `https://warthunder.com/en/community/claninfo/${CONFIG.ThunderConfig.clanname}`
);

export class Scrape {
    static async thunderClanTable(): Promise<ThunderUser[]> {
        log.info('WarThunder スクレイピング開始');
        try {
            const response = await axios.get<string>(THUNDER_URL, {
                responseType: 'text',
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            });

            const $ = cheerio.load(response.data);
            const users: ThunderUser[] = [];

            $('div.squadrons-members__grid-item').each((index, value) => {
                if (index < 6) return; // ヘッダー行をスキップ

                const i = Math.trunc(index / 6) - 1;

                switch (index % 6) {
                    case 0: {
                        const temp = new ThunderUser();
                        temp.isflag = true;
                        users.push(temp);
                        break;
                    }
                    case 1: {
                        const href = $(value).find('a').attr('href') ?? '';
                        const ign = href
                            .replace('en/community/userinfo/?nick=', '')
                            .split('@')[0];
                        users[i].ign = ign;
                        break;
                    }
                    case 3: {
                        const text = $(value).text().replace(/\s+/g, '');
                        users[i].nowactive = Number(text);
                        break;
                    }
                    case 4: {
                        const roleText = $(value).text().replace(/\s+/g, '');
                        users[i].setrole = [roleText];
                        break;
                    }
                    case 5: {
                        const dateText = $(value).text().replace(/\s+/g, '');
                        users[i].setEnter = dateText;
                        break;
                    }
                }
            });

            if (users.length === 0) {
                log.warn('WarThunder スクレイピング: 取得ユーザー0件 (HTML構造変化の可能性あり)');
            } else {
                log.info(`WarThunder スクレイピング完了: ${users.length} 名`);
            }
            return users;
        } catch (err) {
            log.error(`WarThunder スクレイピングエラー: ${(err as AxiosError).message}`);
            throw err;
        }
    }
}
