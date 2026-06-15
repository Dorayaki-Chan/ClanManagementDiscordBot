import { IntegrationApiRequest } from '../api/index';
import { OperationDatabase } from '../database/operations';
import type { WotbUser, ThunderUser, DiscordUser } from '../structures/profile';
import type { RoleChangeEntry } from '../types/index';
import { getLogger } from '../utils/logger';

const dailyLog = getLogger('Scheduler/Daily');
const monthlyLog = getLogger('Scheduler/Monthly');

function invalidSymbol(text: string): string {
    return text.split('').map(c => ['_', '*', '~'].includes(c) ? '\\' + c : c).join('');
}

/** 毎日 03:00 JST に入退室を同期するクラス */
export class Daily {
    wotbLefters: WotbUser[] = [];
    wotbEnters: WotbUser[] = [];
    thunderLefters: ThunderUser[] = [];
    thunderEnters: ThunderUser[] = [];
    discordLefters: DiscordUser[] = [];
    discordEnters: DiscordUser[] = [];
    roleChangers: RoleChangeEntry[] = [];

    async main(): Promise<void> {
        const start = Date.now();
        dailyLog.info('実行開始');

        const [discordUsers, wotbUsers, thunderUsers] = await Promise.all([
            IntegrationApiRequest.requestDiscord(),
            IntegrationApiRequest.requestWotb(),
            IntegrationApiRequest.requestThunder(),
        ]);

        const [dailyWotb, dailyThunder, dailyDiscord] = await OperationDatabase.Daily(
            wotbUsers, thunderUsers, discordUsers
        );

        this.wotbLefters    = dailyWotb.lefters;
        this.wotbEnters     = dailyWotb.enters;
        this.thunderLefters = dailyThunder.lefters;
        this.thunderEnters  = dailyThunder.enters;
        this.discordLefters = dailyDiscord.lefters;
        this.discordEnters  = dailyDiscord.enters;
        this.roleChangers   = dailyDiscord.roleChange;

        dailyLog.info(`WotB   : 入室 ${this.wotbEnters.length} 名, 退室 ${this.wotbLefters.length} 名`);
        dailyLog.info(`Thunder: 入室 ${this.thunderEnters.length} 名, 退室 ${this.thunderLefters.length} 名`);
        dailyLog.info(`Discord: 入室 ${this.discordEnters.length} 名, 退室 ${this.discordLefters.length} 名, ロール変更 ${this.roleChangers.length} 件`);
        dailyLog.info(`実行完了 (${((Date.now() - start) / 1000).toFixed(1)}s)`);
    }

    get wotbLeftersText():    string { return this.#usersText(this.wotbLefters); }
    get wotbEntersText():     string { return this.#usersText(this.wotbEnters); }
    get thunderLeftersText(): string { return this.#usersText(this.thunderLefters); }
    get thunderEntersText():  string { return this.#usersText(this.thunderEnters); }
    get discordLeftersText(): string { return this.#usersText(this.discordLefters); }
    get discordEntersText():  string { return this.#usersText(this.discordEnters); }

    get roleChangeText(): string {
        const text = this.roleChangers
            .map(e => `・${invalidSymbol(e.user.ign ?? '')}\t${e.change}`)
            .join('\n');
        return text || '該当者なし';
    }

    #usersText(users: Array<{ ign: string | null }>): string {
        const text = users.map(u => `・${invalidSymbol(u.ign ?? '')}`).join('\n');
        return text || '該当者なし';
    }
}

/** 毎日 08:58:30 JST にアクティビティ更新・キック候補抽出を行うクラス */
export class Monthly {
    kickMem: ThunderUser[] = [];
    wasSkipped: boolean = false;

    async main(): Promise<void> {
        const start = Date.now();
        monthlyLog.info('実行開始');

        const [discordUsers, thunderUsers] = await Promise.all([
            IntegrationApiRequest.requestDiscord(),
            IntegrationApiRequest.requestThunder(),
        ]);
        const result = await OperationDatabase.Monthly(thunderUsers, discordUsers);
        if (result === null) {
            this.wasSkipped = true;
            this.kickMem = [];
        } else {
            this.wasSkipped = false;
            this.kickMem = result;
        }

        monthlyLog.info(`実行完了: キック候補 ${this.kickMem.length} 名 (${((Date.now() - start) / 1000).toFixed(1)}s)`);
    }

    async kickMember(): Promise<void> {
        const [discordUsers, thunderUsers] = await Promise.all([
            IntegrationApiRequest.requestDiscord(),
            IntegrationApiRequest.requestThunder(),
        ]);
        this.kickMem = await OperationDatabase.LetLeftUser(thunderUsers, discordUsers);
    }

    get kickMemText(): string {
        const sorted = [...this.kickMem].sort((a, b) =>
            (a.ign ?? '').toLowerCase().localeCompare((b.ign ?? '').toLowerCase())
        );
        const text = sorted.map(u => `> ・${invalidSymbol(u.ign ?? '')}`).join('\n');
        return text || '該当者なし';
    }
}
