require('dotenv').config();
const mainApp = require('./process/main');
const cron = require('node-cron');

const data = require('../data/data.json');
const ngWords = data.date.ngWords;

const { Client , Intents, MessageEmbed, Permissions} = require('discord.js');
const token = process.env.BOT_TOKEN;
const client = new Client({
  // intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
  // intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_WEBHOOKS", "GUILD_PRESENCES", "GUILD_MESSAGES"]
  intents: Object.values(Intents.FLAGS)
});
'use strict';

const guild_id = process.env.GUILD_ID;

/*client.once('ready', () => {
  console.log('接続しました！');
  client.guilds.cache.get(`${guild_id}`).members.fetch(`${アカウントID}`).then((mesConttents) => {
    console.log(mesConttents.constructor.name);
    mesConttents.roles.add(`${ロールID}`);
  });
  //.roles.add('558947013744525313')
});*/

const start = new Date();

// 毎分
// '* * * * *'
// 毎分0秒に1分起きに実行
// '0 */1 * * * *'
client.on('ready', () => {
  console.log('接続しました！');
  cron.schedule('0 */1 * * * *', () => {
    const now = new Date();
    const pass = (now.getTime() - start.getTime()) / 1000 / 60;
    client.channels.cache.get('967753820052533248').send(`起動後${Math.round(pass)}分経過`);
  },{
    scheduled: true,
    timezone: "Asia/Tokyo"
  });
});

client.on('guildMemberUpdate', (oldMembers, newMembers) => {
  console.log("変更前");
  console.log(oldMembers.roles.cache.map(role => role.id));
  console.log("変更後");
  console.log(newMembers.roles.cache.map(role => role.id));
  console.log("\n\n\n");
});

// client.on('message', (message) => {
//   console.log('通過！');
//   if (message.content === 'やぁ' && !message.author.bot){
//     message.reply('こんにちは！').catch(console.error);
//   }
// });
/* 入室 */
client.on('guildMemberAdd', (member) => {
  console.log(`${member.guild.name} に ${member.displayName} が参加しました`);
});
/* 退室 */
client.on('guildMemberRemove', (member) => {
  console.log(`${member.guild.name} から ${member.displayName} が退出しました`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) { //botからのmessageを無視
    return;
  }

  /* NGワード検出 */
  if(message.channel.parentId == '558946199760142337'){
    for(word of ngWords){
      if(message.content.includes(word)){
        // const msg = `暴力的な言葉を検出しました:${word}\nはいBAN`;
        // message.channel.send(msg);
        message.member.roles.add('968726766208299068').then(
          () => {
            message.guild.channels.create('名誉取り消し申請所', { 
              parent: "968729716607565875",
              permissionOverwrites: [
                {
                  id: message.author.id,
                  allow: [
                    Permissions.FLAGS.VIEW_CHANNEL, 
                    Permissions.FLAGS.SEND_MESSAGES,
                    Permissions.FLAGS.EMBED_LINKS
                  ],
                },
                {
                  id: '428086533086642179',
                  deny: [Permissions.FLAGS.VIEW_CHANNEL]
                },
                {
                  id: '965547497307140106',
                  allow: [
                    Permissions.FLAGS.MANAGE_CHANNELS,
                    Permissions.FLAGS.VIEW_CHANNEL, 
                    Permissions.FLAGS.SEND_MESSAGES,
                    Permissions.FLAGS.EMBED_LINKS,
                    Permissions.FLAGS.ADD_REACTIONS
                  ]
                }
              ]
            }).then(channel => {
              channel.send('MESSAGE HERE')
            });
          }
        );
        
        return;
      }
    }
  };
  if (message.content === '!test') {
    mainApp.runEveryDay().then(([mesConttents]) => {
      mesConttents.joinWt = mesConttents.joinWt.substring(0, 700);
      // inWT inWotb outWT out Wotb
      if(mesConttents.mesFlag.inWt){
        if(mesConttents.mesFlag.inWotb){
          if(mesConttents.mesFlag.outWt){
            if(mesConttents.mesFlag.outWotb){
              // 1 1 1 1
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }else{
              // 1 1 1 0
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }
          }else{
            if(mesConttents.mesFlag.outWotb){
              // 1 1 0 1
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }else{
              // 1 1 0 0
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }
          }
        }else{
          if(mesConttents.mesFlag.outWt){
            if(mesConttents.mesFlag.outWotb){
              // 1 0 1 1
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }else{
              // 1 0 1 0
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }
          }else{
            if(mesConttents.mesFlag.outWotb){
              // 1 0 0 1
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }else{
              // 1 0 0 0
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }
          }
        }
      }else{
        if(mesConttents.mesFlag.inWotb){
          if(mesConttents.mesFlag.outWt){
            if(mesConttents.mesFlag.outWotb){
              // 0 1 1 1
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }else{
              // 0 1 1 0
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }
          }else{
            if(mesConttents.mesFlag.outWotb){
              // 0 1 0 1
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }else{
              // 0 1 0 0
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🌸ご入隊おめでとうございます🌸`, `本日${mesConttents.mesFlag.inWotb+mesConttents.mesFlag.inWt}名の方が当クランに参加してくださいました！\nよろしくね～♪`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.joinWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.joinWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }
          }
        }else{
          if(mesConttents.mesFlag.outWt){
            if(mesConttents.mesFlag.outWotb){
              // 0 0 1 1
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }else{
              // 0 0 1 0
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }
          }else{
            if(mesConttents.mesFlag.outWotb){
              // 0 0 0 1
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！定時報告です！')
                .addField(`🎉お疲れさまでした🎉`, `本日${mesConttents.mesFlag.outWotb+mesConttents.mesFlag.outWt}名の方が当クランを脱退しました。\n今までありがとうございました。`)
                .addField(`<:WT:747482544714547231>WarThunder部門`, `${mesConttents.leftWt}`, true)
                .addField(`<:Blitz:755234073957367938>World of Tanks Blitz部門`, `${mesConttents.leftWotb}`, true)
                .setColor('#800080')
                .setTimestamp();
              client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }else{
              // 0 0 0 0
              const embed = new MessageEmbed()
                .setTitle('定時報告')
                .setDescription('本日も一日お疲れさまでした！また明日もがんばろー💪')
                .setColor('#800080')
                .setTimestamp();
                client.channels.cache.get('967753820052533248').send({ embeds: [embed] });
            }
          }
        }
      }
    });
    return;
  }
  if (message.content === 'hihi') {
    mainApp.test().then((val) => {
      console.log(val);
    });
    return;
  }
  let msg = message.content; //ユーザが送信したメッセージはmessage.contentで取得可能
  message.channel.send(msg); //メッセージが送られたチャンネルに返信
});
// client.on('message', async message => {
//   if (message.content === '!prompt') {
//     message.channel.send('yes か no を送信してください')
//     const filter = msg => msg.author.id === message.author.id
//     const collected = await message.channel.awaitMessages({ filter, max: 1, time: 10000 })
//     const response = collected.first()
//     if (!response) return message.channel.send('タイムアウト')
//     if (!['yes', 'no'].includes(response.content)) return message.channel.send('正しくありません')
//     message.channel.send(`${response.content} が送信されました`)
//   }
// })

client.login(token)
  .catch(console.error);
