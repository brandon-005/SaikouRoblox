import rbx from 'noblox.js';
import { Client, Collection, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv';
import RobloxToken from './models/token';
import Exile from './models/userExile';

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

async function refreshCookie() {
  const cookieDatabase = await RobloxToken.findOne({ Test: process.env.RobloxTest });
  const Newcookie = await rbx.refreshCookie();
  cookieDatabase!.RobloxToken = Newcookie;
  cookieDatabase?.save();
}

async function startApp() {
  const cookie = await RobloxToken.findOne({ Test: process.env.RobloxTest });
  if (!cookie) return console.error('No token');

  await rbx.setCookie(`${cookie.RobloxToken}`);

  const currentUser = await rbx.getCurrentUser();
  console.log(currentUser);

  setInterval(refreshCookie, 300000);

  // -- Removing user who's supposed to be exiled
  async function ExileUsers() {
    const user = Exile.find({}).select('RobloxUsername RobloxID');

    (await user).forEach(async (player: any) => {
      // @ts-ignore
      const rankName = await rbx.getRankNameInGroup(process.env.GROUP, player.RobloxID).catch((err) => console.log(err));
      if (rankName !== 'Guest') {
        // @ts-ignore
        await rbx.exile(process.env.GROUP, player.RobloxID);
        console.log(`Exiled: ${player.RobloxUsername}`);
      }
    });
  }

  setInterval(ExileUsers, 5000);

  // Fix random error with logs... Unhandled rejection Error: Authorization has been denied for this request.

  // -- Change Rank logs
  //   rbx.onAuditLog(5447155).on('data', async (data) => {
  //     console.log(data);
  //     if (data.actionType === 'Change Rank') {
  //       bot.channels.cache.get('795630559660736513').send(
  //         new MessageEmbed() //
  //           .setTitle(`:warning: Updated Role!`)
  //           .setColor('#FFD62F')
  //           .setDescription(`**${Object.values(data.description)[3]}'s role was updated by ${data.actor.user.username}**`)
  //           .addField('Old Role:', Object.values(data.description)[4], true)
  //           .addField('New Role:', Object.values(data.description)[5], true)
  //           .setFooter(`Updated User ID: ${Object.values(data.description)[0]} `)
  //           .setTimestamp()
  //       );
  //     }

  //     if (data.actionType === 'Remove Member') {
  //       const user = await Exile.findOne({ RobloxUsername: Object.values(data.description)[1] });
  //       if (user) {
  //         bot.channels.cache.get('795630559660736513').send(
  //           new MessageEmbed() //
  //             .setTitle(`:warning: Automatic Exile!`)
  //             .setColor('#FFD62F')
  //             .setDescription(`**${Object.values(data.description)[1]} was exiled automatically by ${data.actor.user.username}**`)
  //             .addField('Exile Giver:', `${user.Moderator}`, true)
  //             .addField('Exile Reason:', `${user.Reason}`, true)
  //             .setFooter(`Exiled User ID: ${Object.values(data.description)[0]} `)
  //             .setTimestamp()
  //         );
  //       } else {
  //         bot.channels.cache.get('795630559660736513').send(
  //           new MessageEmbed() //
  //             .setTitle(`:warning: Exiled User!`)
  //             .setColor('#FFD62F')
  //             .setDescription(`**${Object.values(data.description)[1]}'s was exiled by ${data.actor.user.username}**`)
  //             .setFooter(`Updated User ID: ${Object.values(data.description)[0]} `)
  //             .setTimestamp()
  //         );
  //       }
  //    }
  //   });
}

startApp();

const token = process.env.TEST === 'true' ? process.env.DISCORD_TESTTOKEN : process.env.DISCORD_TOKEN;
bot.login(token);
