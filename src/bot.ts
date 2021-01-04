import rbx from 'noblox.js';
import { Client, Collection, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv';
import RobloxToken from './models/token';

dotenv.config();

const bot: any = new Client({
  ws: { intents: ['GUILD_MESSAGES', 'GUILDS', 'GUILD_MESSAGE_REACTIONS'] },
  disableMentions: 'everyone',
});

bot.commands = new Collection();
bot.aliases = new Collection();

['commands', 'aliases'].forEach((collection) => {
  bot[collection] = new Collection();
});
['loadCommands', 'loadEvents'].forEach((handlerFile) => require(`./handlers/${handlerFile}.js`)(bot));

const token = process.env.TEST === 'true' ? process.env.DISCORD_TESTTOKEN : process.env.DISCORD_TOKEN;
bot.login(token);

async function refreshCookie() {
  const cookieDatabase = await RobloxToken.findOne({ _id: '5ff32afe08a98c2828ff1e3a' });
  const Newcookie = await rbx.refreshCookie();
  cookieDatabase!.RobloxToken = Newcookie;
  cookieDatabase?.save();
}

async function startApp() {
  const cookie = await RobloxToken.findOne({ _id: '5ff32afe08a98c2828ff1e3a' });
  if (!cookie) return console.error('No token');

  await rbx.setCookie(`${cookie.RobloxToken}`);

  const currentUser = await rbx.getCurrentUser();
  console.log(currentUser);

  setInterval(refreshCookie, 300000);

  // -- Change Rank logs

  rbx.onAuditLog(5447155).on('data', (data) => {
    if (data.actionType === 'Change Rank') {
      console.log(Object.values(data.description)[3]);
      bot.channels.cache.get('795630559660736513').send(
        new MessageEmbed() //
          .setTitle(`:warning: Updated Role!`)
          .setColor('#FFD62F')
          .setDescription(`**${Object.values(data.description)[3]}'s role was updated by ${data.actor.user.username}**`)
          .addField('Old Role:', Object.values(data.description)[4], true)
          .addField('New Role:', Object.values(data.description)[5], true)
          .setFooter(`Updated User ID: ${Object.values(data.description)[0]} `)
          .setTimestamp()
      );
    }
  });
}

startApp();
