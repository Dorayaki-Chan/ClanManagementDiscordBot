import {
    Client,
    GatewayIntentBits,
    Partials,
    ActivityType,
} from 'discord.js';
import cron from 'node-cron';
import { CONFIG } from './config';
import { loadCommands } from './commands/index';
import { Daily, Monthly } from './scheduler/index';
import { fixedTermReport, kickCall } from './messages/index';
import discordServerInfoRaw from '../template/discordServerInfo.json';
import type { DiscordServerInfo } from './types/index';
import { getLogger } from './utils/logger';

const serverInfo = discordServerInfoRaw as DiscordServerInfo;
const commands = loadCommands();
const log = getLogger('Bot');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Message, Partials.Channel],
});

// 起動時: スラッシュコマンド登録 + プレゼンス設定
client.once('ready', async () => {
    if (!client.user || !client.application) return;
    log.info(`接続しました: ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: '神げー界隈', type: ActivityType.Competing }],
        status: 'online',
    });

    const slashData = [...commands.values()].map(c => c.data);
    await client.application.commands.set(slashData, CONFIG.DiscordConfig.guildid);
    log.info(`スラッシュコマンド登録完了 (${slashData.length} 件)`);
});

// Cron スケジューラ登録
client.on('ready', () => {
    // 毎日 03:00 JST: 定時報告 + ロール変更
    cron.schedule('0 0 3 * * *', async () => {
        log.info('定時実行 (Daily) 開始');
        try {
            const daily = new Daily();
            await daily.main();
            await fixedTermReport(client, daily, serverInfo.channels.clanNewsCh);
            log.info(`定時報告送信: channel=${serverInfo.channels.clanNewsCh}`);

            const guild = client.guilds.cache.get(CONFIG.DiscordConfig.guildid);
            if (!guild) return;

            for (const { user, change } of daily.roleChangers) {
                const member = await guild.members.fetch(user.id as string).catch(() => null);
                if (!member) continue;
                if (change === 'toClanmem') {
                    await member.roles.add(serverInfo.roles.clanMemberRole);
                    await member.roles.remove(serverInfo.roles.genroMemberRole);
                    await member.roles.remove(serverInfo.roles.gestRole);
                    await member.roles.remove(serverInfo.roles.plzyourselfRole);
                    log.info(`ロール変更 → clanmem: ${user.id}`);
                } else if (change === 'toGenro') {
                    await member.roles.add(serverInfo.roles.genroMemberRole);
                    await member.roles.remove(serverInfo.roles.clanMemberRole);
                    log.info(`ロール変更 → genro: ${user.id}`);
                }
            }

            const changeCh = client.channels.cache.get(serverInfo.channels.changeRoleCallCh);
            if (changeCh && 'send' in changeCh) {
                await (changeCh as import('discord.js').TextChannel).send(daily.roleChangeText);
            }
        } catch (err) {
            log.error(`定時実行 (Daily) エラー: ${err}`);
        }
    }, { scheduled: true, timezone: 'Asia/Tokyo' });

    // 毎日 08:58:30 JST: 非アクティブメンバー粛清告知（月初判定は Monthly.main() 内で行う）
    cron.schedule('30 58 8 * * *', async () => {
        log.info('定時実行 (Monthly) 開始');
        try {
            const mom = new Monthly();
            await mom.main();
            await kickCall(
                client, mom.kickMemText,
                serverInfo.channels.clanNewsCh,
                serverInfo.roles.thunderRole,
                CONFIG.KickMember.progress,
                CONFIG.KickMember.minactivity
            );
            log.info(`キック告知送信: channel=${serverInfo.channels.clanNewsCh}`);
        } catch (err) {
            log.error(`定時実行 (Monthly) エラー: ${err}`);
        }
    }, { scheduled: true, timezone: 'Asia/Tokyo' });
});

// メッセージハンドラ（テスト用）
client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (message.content === 'hihi') message.reply('hihi');
    if (message.content === 'ping') message.reply('pong');
});

// インタラクションルーター
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = commands.get(interaction.commandName);
            if (!command) return;
            await command.execute_commands(interaction, client);

        } else if (interaction.isMessageComponent()) {
            // カスタム ID は "commandName:action" 形式
            const commandName = interaction.customId.split(':')[0];
            const command = commands.get(commandName);
            if (command?.execute_messageComponents) {
                await command.execute_messageComponents(interaction, client);
            }

        } else if (interaction.isModalSubmit()) {
            // カスタム ID は "commandName:modal-id" 形式
            const commandName = interaction.customId.split(':')[0];
            const command = commands.get(commandName);
            if (command?.execute_modals) {
                await command.execute_modals(interaction, client);
            }
        }
    } catch (error) {
        const interactionId = interaction.isChatInputCommand()
            ? interaction.commandName
            : ('customId' in interaction ? String((interaction as { customId: unknown }).customId) : 'unknown');
        log.error(`コマンドエラー [${interactionId}] user=${interaction.user.id}: ${error}`);
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'コマンド実行時にエラーが発生しました',
                ephemeral: true,
            }).catch(() => {});
        }
    }
});

client.login(CONFIG.Credentials.token).catch(err => log.error(`ログイン失敗: ${err}`));
