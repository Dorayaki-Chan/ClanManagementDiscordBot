import {
    SlashCommandBuilder,
    AttachmentBuilder,
    ChatInputCommandInteraction,
    Client,
} from 'discord.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import Handlebars from 'handlebars';
import dataURI from 'datauri';
import { OperationDatabase } from '../database/operations';
import rolesRaw from '../../template/roles.json';
import type { BotCommand, RoleData, ProfileRow } from '../types/index';
import path from 'path';
import { getLogger } from '../utils/logger';

const log = getLogger('Command/info');
const roles = rolesRaw as RoleData[];

class MakeProfileImg {
    data: Record<string, unknown>;

    constructor(result: ProfileRow, interaction: ChatInputCommandInteraction) {
        const whatRole = (rid: number | null) =>
            rid ? roles.find(r => r.id === rid) ?? null : null;

        const d = result.d_enter_at;
        const t = result.t_enter_at;
        const w = result.w_enter_at;

        this.data = {
            discord: {
                avater: interaction.user.displayAvatarURL(),
                id: result.d_user_id,
                name: result.d_name,
                ign: result.d_ign,
                role: whatRole(result.d_r_id),
                enter_year:  d?.getFullYear() ?? null,
                enter_month: d ? d.getMonth() + 1 : null,
                enter_day:   d?.getDate() ?? null,
            },
            thunder: {
                ign: result.t_ign,
                role: whatRole(result.t_r_id),
                enter_year:  t?.getFullYear() ?? null,
                enter_month: t ? t.getMonth() + 1 : null,
                enter_day:   t?.getDate() ?? null,
            },
            wotb: {
                ign: result.w_ign,
                role: whatRole(result.w_r_id),
                enter_year:  w?.getFullYear() ?? null,
                enter_month: w ? w.getMonth() + 1 : null,
                enter_day:   w?.getDate() ?? null,
            },
            date: new Date().toLocaleString('ja-JP'),
        };
    }

    async init(): Promise<void> {
        this.data = {
            ...this.data,
            pic: {
                dataURI_background: await dataURI('./images/space01.png'),
                thunderLogo:        await dataURI('./images/WarThunder.png'),
                wotbLogo:           await dataURI('./images/wotb.png'),
            },
        };
    }

    async #createProfile(htmlFile: string, height: number): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 640, height });

        const htmlPath = path.join(__dirname, `html-project/public/${htmlFile}.html`);
        const template = Handlebars.compile(fs.readFileSync(htmlPath, 'utf8'));
        await page.setContent(template(this.data));

        const cssPath = path.join(__dirname, 'html-project/assets/css/style.css');
        const cssSrc = fs.readFileSync(cssPath, 'utf8');
        const discord = this.data.discord as Record<string, unknown>;
        const discordRole = discord.role as Record<string, string> | null;
        const pic = this.data.pic as Record<string, string>;
        const css = cssSrc
            .replace('{{body.height}}', `${height}px`)
            .replace('{{backgroundImg}}', pic.dataURI_background)
            .replace('{{discord_role.color}}', discordRole?.color ?? '');
        await page.addStyleTag({ content: css });

        const screenshot = await page.screenshot({ type: 'png', omitBackground: true });
        await browser.close();

        return Buffer.isBuffer(screenshot) ? screenshot : Buffer.from(screenshot);
    }

    makeFull()    { return this.#createProfile('full',    450); }
    makeThunder() { return this.#createProfile('thunder', 350); }
    makeWotb()    { return this.#createProfile('wotb',    350); }
    makeDiscord() { return this.#createProfile('discord', 230); }
}

const command: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('情報を統括するコマンドです。')
        .addSubcommand(sub =>
            sub.setName('profile').setDescription('Botに登録されているプロフィールを表示します。')
        )
        .addSubcommand(sub =>
            sub.setName('activity').setDescription('WarThunderのアクティビティ履歴を表示します。')
                .addStringOption(opt =>
                    opt.setName('period').setDescription('グラフに表示する期間を選択してください。')
                        .addChoices(
                            { name: 'one-year',        value: 'oneYear'  },
                            { name: 'last-six-months', value: 'halfYear' },
                            { name: 'all',             value: 'all'      },
                        )
                )
        ),

    async execute_commands(interaction: ChatInputCommandInteraction, _client: Client) {
        const sub = interaction.options.getSubcommand();
        log.info(`受信: user=${interaction.user.id} sub=${sub}`);

        if (sub === 'profile') {
            const result = await OperationDatabase.getProfile(interaction.user.id);
            if (!result.length) {
                await interaction.reply(
                    'プロフィールが登録されていません。反映まで1日ほどかかります。\n__**2日以上**経っても反映されない場合は、管理者にお問い合わせください。__'
                );
                return;
            }

            await interaction.deferReply();
            const r = result[0];
            const img = new MakeProfileImg(r, interaction);
            await img.init();

            try {
                let buf: Buffer;
                if (r.t_ign && r.w_ign)   buf = await img.makeFull();
                else if (r.t_ign)          buf = await img.makeThunder();
                else if (r.w_ign)          buf = await img.makeWotb();
                else                       buf = await img.makeDiscord();

                const attachment = new AttachmentBuilder(buf, { name: 'Profile.png' });
                await interaction.editReply({ files: [attachment] });
                log.info(`プロフィール画像生成完了: user=${interaction.user.id}`);
            } catch (err) {
                log.error(`プロフィール画像生成エラー: user=${interaction.user.id}: ${err}`);
                throw err;
            }
        } else {
            await interaction.reply('工事中');
        }
    },
};

export default command;
