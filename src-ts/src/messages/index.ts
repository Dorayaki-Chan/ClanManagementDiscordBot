import { EmbedBuilder, Client, TextChannel, PermissionFlagsBits } from 'discord.js';
import type { Daily } from '../scheduler/index';
import { getLogger } from '../utils/logger';

const log = getLogger('Messages');

export async function fixedTermReport(
    client: Client,
    daily: Daily,
    channelId: string
): Promise<void> {
    const embed = new EmbedBuilder()
        .setTitle('定時報告')
        .setDescription('本日も一日お疲れさまでした！定時報告です！')
        .addFields(
            {
                name: '🌸ご入隊ありがとうございます🌸',
                value: `本日${daily.wotbEnters.length + daily.thunderEnters.length + daily.discordEnters.length}名の方が当クランに参加してくださいました！\nよろしくね～♪`,
            },
            { name: '<:WT:747482544714547231>WarThunder部門',            value: daily.thunderEntersText,  inline: true },
            { name: '<:Blitz:755234073957367938>World of Tanks Blitz部門', value: daily.wotbEntersText,    inline: true },
            { name: '<:discord:1016346034760327218>クランサーバー部門',    value: daily.discordEntersText,  inline: true },
            {
                name: '🎉お疲れさまでした🎉',
                value: `本日${daily.wotbLefters.length + daily.thunderLefters.length + daily.discordLefters.length}名の方が脱退しました。\n今までありがとうございました。`,
            },
            { name: '<:WT:747482544714547231>WarThunder部門',            value: daily.thunderLeftersText, inline: true },
            { name: '<:Blitz:755234073957367938>World of Tanks Blitz部門', value: daily.wotbLeftersText,   inline: true },
            { name: '<:discord:1016346034760327218>クランサーバー部門',    value: daily.discordLeftersText, inline: true },
        )
        .setColor(0x800080)
        .setTimestamp();

    const channel = client.channels.cache.get(channelId);
    if (channel && 'send' in channel) {
        await (channel as TextChannel).send({ embeds: [embed] });
    }
}

export async function kickCall(
    client: Client,
    text: string,
    channelId: string,
    thunderRoleId: string,
    progress: string,
    minactivity: string
): Promise<void> {
    const embed = new EmbedBuilder()
        .setTitle('__**:cherry_blossom:非アクティブメンバー粛清大会:cherry_blossom:**__')
        .setDescription(
            '**非アクティブ且つDiscordクラン鯖未参加プレイヤー**を部隊よりキックします。\n候補者は下記の通りです。不具合により誤検出される場合があります。\n該当者は至急連絡されたし。'
        )
        .addFields({
            name: '粛正対象者一覧',
            value: `${text}\n※非アクティブプレイヤー\n\tWarThunder部門入隊後${progress}日が経過し直近30日のアクティビティが${minactivity}以下の者`,
        })
        .setColor(0x00ff00)
        .setTimestamp();

    const channel = client.channels.cache.get(channelId);
    if (!channel || !('send' in channel)) return;

    const tc = channel as TextChannel;
    const me = tc.guild.members.me;
    if (me) {
        const perms = tc.permissionsFor(me);
        const required = [
            { flag: PermissionFlagsBits.SendMessages,     name: 'SendMessages' },
            { flag: PermissionFlagsBits.EmbedLinks,       name: 'EmbedLinks' },
            { flag: PermissionFlagsBits.MentionEveryone,  name: 'MentionEveryone' },
            { flag: PermissionFlagsBits.ViewChannel,      name: 'ViewChannel' },
        ];
        const missing = required.filter(r => !perms?.has(r.flag)).map(r => r.name);
        if (missing.length) {
            log.warn(`kickCall 権限不足 channel=${channelId}: ${missing.join(', ')}`);
        } else {
            log.info(`kickCall 権限確認OK channel=${channelId}`);
        }
    }

    try {
        await tc.send({ content: `<@&${thunderRoleId}>`, embeds: [embed] });
    } catch (err) {
        log.error(`kickCall 送信失敗 channel=${channelId}: ${err}`);
        throw err;
    }
}
