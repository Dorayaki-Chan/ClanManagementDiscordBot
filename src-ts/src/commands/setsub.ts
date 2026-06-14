import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import type { BotCommand } from '../types/index';

const command: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('setsub')
        .setDescription('サブ垢を設定します。')
        .addUserOption(opt =>
            opt.setName('subaccount')
                .setDescription('サーバーに所属する本垢を選択してください。')
                .setRequired(true)
        ),

    async execute_commands(interaction: ChatInputCommandInteraction, _client: Client) {
        await interaction.reply('サブ垢コマンド実行');
    },
};

export default command;
