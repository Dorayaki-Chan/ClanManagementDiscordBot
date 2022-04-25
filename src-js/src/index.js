require('dotenv').config();
const mainApp = require('./process/main');
const cron = require('node-cron');

const { Client , Intents, MessageEmbed} = require('discord.js');
const token = process.env.BOT_TOKEN;
const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});
'use strict';
client.once('ready', () => {
  console.log('接続しました！');
});

// 毎分
// '* * * * *'
client.on('ready', () => {
  cron.schedule('* * * * *', () => {
    client.channels.cache.get('967753820052533248').send("テスト!");
  },{
    scheduled: true,
    timezone: "Asia/Tokyo"
  });
});

// client.on('message', (message) => {
//   console.log('通過！');
//   if (message.content === 'やぁ' && !message.author.bot){
//     message.reply('こんにちは！').catch(console.error);
//   }
// });
/* 入室 */
client.on('guildMemberAdd', member => {
  console.log(`${member.guild.name} に ${member.displayName} が参加しました`)
})
/* 退室 */
client.on('guildMemberRemove', member => {
  console.log(`${member.guild.name} から ${member.displayName} が退出しました`)
})

client.on("messageCreate", (message) => {
  if (message.author.bot) { //botからのmessageを無視
    return;
  }
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
  .catch(console.error)
