// ============================================================
// DB 行型（MySQL カラム名に対応）
// ============================================================

export interface WotbMemberRow {
    w_user_id: number;
    w_ign: string;
    r_id: number;
    r_dis_id?: string;
    w_enter_at: Date | null;
    w_left_at: Date | null;
    w_is_flag: boolean;
    w_created_at?: Date;
    w_updated_at?: Date;
}

export interface ThunderMemberRow {
    t_user_id: number;
    t_ign: string;
    r_id: number;
    r_dis_id?: string;
    t_enter_at: Date | null;
    t_left_at: Date | null;
    t_is_flag: boolean;
    t_all_active: number;
    t_special_treatment?: boolean;
    t_created_at?: Date;
    t_updated_at?: Date;
}

export interface DiscordMemberRow {
    d_user_id: string;   // BIGINT は bigNumberStrings:true で string になる
    d_name: string;
    w_user_id: number | null;
    t_user_id: number | null;
    r_id: number;
    r_dis_id?: string;
    d_nick: string | null;
    d_ign: string;
    d_enter_at: Date | null;
    d_left_at: Date | null;
    d_is_flag: boolean;
    d_sub_id: string | null;
    d_subign: string | null;
    d_upign_flag: boolean;
}

export interface WtActiveRow {
    wt_id: number;
    t_user_id: number;
    wt_active: number;
    wt_created_at: Date;
}

export interface RoleRow {
    r_id: number;
    r_name: string;
    r_dis_id: string;
}

export interface CountRow {
    count_is: number | string;
}

// /info profile の JOIN クエリ結果
export interface ProfileRow {
    d_user_id: string;
    d_enter_at: Date | null;
    d_ign: string;
    d_name: string;
    t_ign: string | null;
    w_ign: string | null;
    d_r_id: number | null;
    t_r_id: number | null;
    w_r_id: number | null;
    t_enter_at: Date | null;
    w_enter_at: Date | null;
}

// ============================================================
// 設定ファイル型
// ============================================================

export interface AppConfig {
    Credentials: { token: string };
    Database: { host: string; user: string; password: string };
    WargamingConfig: { applicationid: string; clanid: string };
    DiscordConfig: { guildid: string; limit: string };
    ThunderConfig: { clanname: string };
    KickMember: { progress: string; minactivity: string };
}

// roles.json の各エントリ
export interface RoleData {
    id: number;
    name: string;
    othername: string[];
    discordid: string;
    type: 'main' | 'sub';
    color?: string;
}

// discordServerInfo.json の構造
export interface DiscordServerInfo {
    roles: {
        clanMemberRole: string;
        genroMemberRole: string;
        botRole: string;
        thunderRole: string;
        clanmasterRole: string;
        gestRole: string;
        plzyourselfRole: string;
    };
    channels: {
        clanNewsCh: string;
        changeRoleCallCh: string;
        testDropCh: string;
        callCenterCh: string;
    };
}

// ============================================================
// 外部 API レスポンス型
// ============================================================

export interface WotbMemberApiData {
    account_name: string;
    role: string;
    joined_at: number;
}

export interface WotbClanApiResponse {
    data: {
        [clanId: string]: {
            members: {
                [accountId: string]: WotbMemberApiData;
            };
        };
    };
}

export interface DiscordMemberApiResponse {
    user: {
        id: string;
        username: string;
        bot?: boolean;
    };
    nick: string | null;
    roles: string[];
    joined_at: string;
}

// ============================================================
// コマンドモジュール型
// ============================================================

import type {
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    ChatInputCommandInteraction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    Client,
} from 'discord.js';

export interface BotCommand {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute_commands(
        interaction: ChatInputCommandInteraction,
        client: Client
    ): Promise<void>;
    execute_messageComponents?(
        interaction: MessageComponentInteraction,
        client: Client
    ): Promise<void>;
    execute_modals?(
        interaction: ModalSubmitInteraction,
        client: Client
    ): Promise<void>;
}

// ============================================================
// ロール変更型
// ============================================================

export type RoleChangeType = 'toClanmem' | 'toGenro' | 'no';

export interface RoleChangeEntry {
    user: import('../structures/profile').DiscordUser;
    change: RoleChangeType;
}
