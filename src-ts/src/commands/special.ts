import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    GuildMember,
} from 'discord.js';
import { OperationDatabase } from '../database/operations';
import discordServerInfoRaw from '../../template/discordServerInfo.json';
import type { BotCommand, DiscordServerInfo } from '../types/index';
import { getLogger } from '../utils/logger';

const log = getLogger('Command/special');
const { clanmasterRole } = (discordServerInfoRaw as DiscordServerInfo).roles;

const command: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('special')
        .setDescription('特例処置者を設定します')
        .addSubcommand(sub =>
            sub.setName('add').setDescription('特例処置者の追加を行います。')
                .addStringOption(opt =>
                    opt.setName('ign').setDescription('特例処置者のIGNを入力してください。').setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('remove').setDescription('特例処置者の削除を行います。')
                .addStringOption(opt =>
                    opt.setName('ign').setDescription('特例処置者のIGNを入力してください。').setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('list').setDescription('特例処置者の一覧を表示します。')
        ),

    async execute_commands(interaction: ChatInputCommandInteraction, _client: Client) {
        const ops = OperationDatabase.specialUser();
        const member = interaction.member as GuildMember;
        const isAdmin = member.roles.cache.has(clanmasterRole);
        const sub = interaction.options.getSubcommand();
        log.info(`受信: user=${interaction.user.id} sub=${sub}`);

        if (sub === 'add' || sub === 'remove') {
            if (!isAdmin) {
                await interaction.reply({ content: '管理者限定コマンドのため無効な操作です。', ephemeral: true });
                return;
            }
            const ign = interaction.options.getString('ign', true);
            const result = sub === 'add'
                ? await ops.addSpecialUser(ign)
                : await ops.removeSpecialUser(ign);

            if (result.affectedRows === 1 && result.changedRows === 1) {
                const verb = sub === 'add' ? '特例処置対象者に変更しました。' : '特例処置対象者から削除しました。';
                log.info(`${sub} 成功: ${ign}`);
                await interaction.reply({ content: `**${ign}**を${verb}`, ephemeral: true });
            } else if (result.affectedRows === 1 && result.changedRows === 0) {
                const msg = sub === 'add' ? 'は既に特例処置対象者です。' : 'は特例処置対象者ではありません。';
                log.info(`${sub} スキップ: ${ign} (変更なし)`);
                await interaction.reply({ content: `**${ign}**${msg}`, ephemeral: true });
            } else {
                const fallback = sub === 'add'
                    ? `の追加に失敗しました。\nIGNが異なるか、データベースの更新がまだです。`
                    : `の削除に失敗しました。\nIGNが異なる可能性があります。`;
                log.warn(`${sub} 失敗: ${ign} (DB未反映かIGN不一致)`);
                await interaction.reply({ content: `**${ign}**${fallback}`, ephemeral: true });
            }
        } else if (sub === 'list') {
            const users = await ops.getSpecialUsers();
            const list = users.map(u => `・${u.ign}`).join('\n');
            log.info(`list 取得: ${users.length} 件`);
            await interaction.reply({
                content: `特例処置者の一覧を表示します。\n>>> ${list || '（なし）'}`,
                ephemeral: false,
            });
        }
    },
};

export default command;
