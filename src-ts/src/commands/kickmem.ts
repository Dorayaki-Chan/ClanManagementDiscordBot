import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChatInputCommandInteraction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    Client,
    GuildMember,
} from 'discord.js';
import { Monthly } from '../scheduler/index';
import { kickCall } from '../messages/index';
import { CONFIG } from '../config';
import discordServerInfoRaw from '../../template/discordServerInfo.json';
import type { BotCommand, DiscordServerInfo } from '../types/index';
import { getLogger } from '../utils/logger';

const log = getLogger('Command/kickmem');
const serverInfo = discordServerInfoRaw as DiscordServerInfo;
const { clanmasterRole, thunderRole, clanNewsCh } = serverInfo.roles.clanmasterRole
    ? {
        clanmasterRole: serverInfo.roles.clanmasterRole,
        thunderRole:    serverInfo.roles.thunderRole,
        clanNewsCh:     serverInfo.channels.clanNewsCh,
    }
    : { clanmasterRole: '', thunderRole: '', clanNewsCh: '' };

// ボタン3つ（はい / 変更 / キャンセル）のアクション行を生成
function makeKickButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('kickmem:kick-ok')
            .setStyle(ButtonStyle.Primary).setLabel('はい'),
        new ButtonBuilder().setCustomId('kickmem:kick-update')
            .setStyle(ButtonStyle.Success).setLabel('変更'),
        new ButtonBuilder().setCustomId('kickmem:kick-cancel')
            .setStyle(ButtonStyle.Danger).setLabel('キャンセル'),
    );
}

const command: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('kickmem')
        .setDescription('非アクティブプレイヤーを検出します。'),

    async execute_commands(interaction: ChatInputCommandInteraction, _client: Client) {
        log.info(`受信: user=${interaction.user.id}`);
        const member = interaction.member as GuildMember;
        if (!member.roles.cache.has(clanmasterRole)) {
            await interaction.reply({ content: '管理者限定コマンドのため無効な操作です。', ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        const mom = new Monthly();
        await mom.kickMember();

        await interaction.editReply({
            content: `以下のメンバーで宜しいですか？\n${mom.kickMemText}`,
            components: [makeKickButtons()],
        });
    },

    async execute_messageComponents(interaction: MessageComponentInteraction, client: Client) {
        const { customId } = interaction;

        if (customId === 'kickmem:kick-ok') {
            log.info(`ボタン: kick-ok user=${interaction.user.id}`);
            const text = interaction.message.content.split('\n').slice(1).join('\n');
            await kickCall(
                client, text, clanNewsCh, thunderRole,
                CONFIG.KickMember.progress, CONFIG.KickMember.minactivity
            );
            await interaction.update({ content: '告知投下しました！', components: [] });

        } else if (customId === 'kickmem:kick-update') {
            log.info(`ボタン: kick-update user=${interaction.user.id}`);
            const prepareBtn = new ButtonBuilder()
                .setCustomId('kickmem:kick-update-ok')
                .setStyle(ButtonStyle.Primary)
                .setLabel('準備完了!');
            await interaction.update({
                content: `候補者をクリップボードにコピーしてください。\n${interaction.message.content.split('\n').slice(1).join('\n')}`,
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(prepareBtn)],
            });

        } else if (customId === 'kickmem:kick-update-ok') {
            log.info(`ボタン: kick-update-ok user=${interaction.user.id}`);
            const modal = new ModalBuilder()
                .setCustomId('kickmem:kick-update-form')
                .setTitle('キックメンバーの編集');
            const input = new TextInputBuilder()
                .setCustomId('kick-update-member')
                .setLabel('キックメンバーを編集してください')
                .setPlaceholder('> ・name1\n> ・name2')
                .setStyle(TextInputStyle.Paragraph);
            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(input)
            );
            await interaction.showModal(modal);

        } else if (customId === 'kickmem:kick-cancel') {
            log.info(`ボタン: kick-cancel user=${interaction.user.id}`);
            await interaction.update({ content: 'キャンセルしました！', components: [] });
        }
    },

    async execute_modals(interaction: ModalSubmitInteraction, _client: Client) {
        if (interaction.customId === 'kickmem:kick-update-form') {
            log.info(`モーダル: kick-update-form user=${interaction.user.id}`);
            const editedText = interaction.fields.getTextInputValue('kick-update-member');
            // ModalSubmitInteraction は message component から来た場合 update() が使える
            await (interaction as unknown as MessageComponentInteraction).update({
                content: `以下のメンバーで宜しいですか？\n${editedText}`,
                components: [makeKickButtons()],
            });
        }
    },
};

export default command;
