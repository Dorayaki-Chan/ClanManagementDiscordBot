/**
 * @file index.js
 * @brief メイン処理
 * @date 2021-03-06
 * @version 1.00
 * @details
 * DiscordBotのメイン処理
 */

const { Client , Intents, MessageEmbed, Permissions, MessageButton, Modal, TextInputComponent, MessageActionRow} = require('discord.js');
const {Daily, Monthly} = require(`./runbot/main.js`);
const {fixedTermReport, kickCall} = require(`./messages/message.js`);

const discordServerInfoData = require('../template/discordServerInfo.json');

const client = new Client({
    intents: Object.values(Intents.FLAGS)
});

const cron = require('node-cron');

const fs = require('fs');
const ini = require('ini');

const config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'));

const token = config.Credentials.token;

/* ロールID */
const clanMemberRole = discordServerInfoData.roles.clanMemberRole;
const genroMemberRole = discordServerInfoData.roles.genroMemberRole;
const botRole = discordServerInfoData.roles.botRole;
const thunderRole = discordServerInfoData.roles.thunderRole;
const gestRole = discordServerInfoData.roles.gestRole;
const plzyourselfRole = discordServerInfoData.roles.plzyourselfRole;

/* チャンネルID */
const clanNewsCh = discordServerInfoData.channels.clanNewsCh;
const changeRoleCallCh = discordServerInfoData.channels.changeRoleCallCh;
const testDropCh = discordServerInfoData.channels.testDropCh;
const callCenterCh = discordServerInfoData.channels.callCenterCh;


/* コマンドを読み込み */
const commands = (()=>{
    const commands = {};
    const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands[command.data.name] = command;
    }
    return commands;
})();


'use strict';


// ログイン時のログ表示
client.once('ready', async() => {
    /* コマンドを登録 */
    const data = (()=>{
        const data = [];
        for (const commandName in commands) {
            data.push(commands[commandName].data);
        }
        return data;
    })();    
    await client.application.commands.set(data, config.DiscordConfig.guildid);
    // 接続確認
    console.log('接続しました！', new Date());
    client.user.setPresence({ activities: [{ name: '神げー界隈', type:"COMPETING" }], status: 'online' });
});


// ログインされたら実行
// 定期実行の処理
client.on('ready', async() => {
    cron.schedule('0 0 3 * * *', async() => {
        /** 
         * @todo スクレイピング→入退室の確認など
         */
        console.log("3時だよ!全員集合！");
        const daily = new Daily();
        await daily.main();
        console.log(daily.test);
        // 定時報告送信
        await fixedTermReport(MessageEmbed, client, daily, clanNewsCh);

        // クランメンバー→元老
        const discordMemberInfo = client.guilds.cache.get(`${config.DiscordConfig.guildid}`);
        daily.roleChangers.forEach(obj => {
            if(obj.change == "toClanmem"){
                discordMemberInfo.members.fetch(obj.user.id).then((member) => {
                    // クラメンロール付与
                    member.roles.add(clanMemberRole);
                    // 元老ロール剥奪
                    member.roles.remove(genroMemberRole);
                    // ゲストロール剥奪
                    member.roles.remove(gestRole);
                    // 自己紹介してね剥奪
                    member.roles.remove(plzyourselfRole);
                });
            }
            else if(obj.change == "toGenro"){
                discordMemberInfo.members.fetch(obj.user.id).then((member) => {
                    // 元老ロール付与
                    member.roles.add(genroMemberRole);
                    // クランメンバーロール剥奪
                    member.roles.remove(clanMemberRole);
                });
            }
            else{
                console.log("どこも通過しなかった");
            }
        });
        // テスト用ID
        client.channels.cache.get(changeRoleCallCh).send(daily.roleChangeText);
    },{
        scheduled: true,
        timezone: "Asia/Tokyo"
    });
    /**
     * @todo 月初めに実行。キックメンバーの報告
     */
    cron.schedule('30 58 8 * * *', async() => {
    // cron.schedule('30 12 15 * * *', async() => {
        const mom = new Monthly();
        await mom.main();
        await kickCall(MessageEmbed, client, mom.kickMemText, clanNewsCh, thunderRole, config);
    },{
        scheduled: true,
        timezone: "Asia/Tokyo"
    });
});


// メッセージの処理
client.on("messageCreate", (message) => {
    if (message.author.bot) { //botからのmessageを無視
        return;
    }
    if (message.content === 'hihi') {
        console.log("hihi");
        message.reply('hihi');
    }
    if (message.content === 'ping') {
        message.reply('pong');
    }
});


// インタラクション(スラッシュコマンド)の処理
client.on("interactionCreate", async (interaction) => {
    // console.log("\n\n\n\n\n");
    if(interaction.isCommand()) {
        const command = commands[interaction.commandName];
        try {
            await command.execute_commands(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'よくわかんないけど、コマンド実行時にエラー出たよ',
                ephemeral: true,
            })
        }
    }
    else if(interaction.isMessageComponent()){
        // console.log(interaction.message.interaction.commandName);
        const command = commands[interaction.message.interaction.commandName];
        try {
            await command.execute_messageComponents(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'よくわかんないけど、MessageComponent実行時にエラー出たよ',
                ephemeral: true,
            })
        }
    }
    else if (interaction.isModalSubmit()){
        // console.log(interaction.message.interaction.commandName);
        const command = commands[interaction.message.interaction.commandName];
        try {
            await command.execute_modals(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'よくわかんないけど、Modal実行時にエラー出たよ',
                ephemeral: true,
            })
        }
    }
    
});


// ログイン
client.login(token)
    .catch(console.error);

