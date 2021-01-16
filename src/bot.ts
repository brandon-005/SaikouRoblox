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
    const user = Exile.find({}).select('RobloxUsername RobloxID Moderator Reason');

    (await user).forEach(async (player: any) => {
      // @ts-ignore
      const rank = await rbx.getRankInGroup(process.env.GROUP, player.RobloxID).catch((err) => console.log('Get rank in group encountered an error', err));

      if (typeof rank === 'undefined') return;

      if (rank !== 0) {
        await rbx // @ts-ignore
          .exile(process.env.GROUP, player.RobloxID)
          .then(() => {
            bot.channels.cache.get(process.env.ADMIN_LOG).send(
              new MessageEmbed() //
                .setTitle(`:warning: Automatic Exile!`)
                .setColor('#FFD62F')
                .setDescription(`**${player.RobloxUsername} was exiled automatically by SaikouGroup**`)
                .addField('Exile Giver:', `${player.Moderator}`, true)
                .addField('Exile Reason:', `${player.Reason}`, true)
                .setFooter(`Exiled Player ID: ${player.RobloxID} `)
                .setTimestamp()
            );
          })
          .catch((error) => {
            console.log('There was an error exiling the player!', error);
          });
      }
    });
  }

  setInterval(ExileUsers, 30000);

  const blacklisted = ['https://', 'have robux', 'me robux'];

  // @ts-ignore
  rbx.onWallPost(process.env.GROUP).on('data', async (data) => {
    const user = Exile.find({}).select('RobloxUsername RobloxID Moderator Reason');
    let check;

    (await user).forEach(async (player: any) => {
      if (player.RobloxID === Object.values(data.poster)[0].userId) {
        check = true;

        await rbx // @ts-ignore
          .deleteWallPost(process.env.GROUP, data.id)
          .then(() => {
            bot.channels.cache.get(process.env.ADMIN_LOG).send(
              new MessageEmbed() //
                .setTitle(`:warning: Post deleted!`)
                .setColor('#FFD62F')
                .setDescription(`**${Object.values(data.poster)[0].username}'s post was deleted automatically by SaikouGroup**`)
                .addField('Deleted Message:', data.body)
                .addField('Deletion Reason:', `Player is permanently exiled from this group.`)
                .setFooter(`Deleted Post Player ID: ${Object.values(data.poster)[0].userId} `)
                .setTimestamp()
            );
          })
          .catch((error) => {
            console.log('There was an error deleting the wall post (exiled player post)!', error);
          });
      }
    });

    if (check === true) return;

    blacklisted.forEach(async (word) => {
      if (data.body.toLowerCase().includes(word)) {
        await rbx // @ts-ignore
          .deleteWallPost(process.env.GROUP, data.id)
          .then(() => {
            bot.channels.cache.get(process.env.ADMIN_LOG).send(
              new MessageEmbed() //
                .setTitle(`:warning: Post deleted!`)
                .setColor('#FFD62F')
                .setDescription(`**${Object.values(data.poster)[0].username}'s post was deleted automatically by SaikouGroup**`)
                .addField('Deleted Message:', data.body)
                .addField('Deletion Reason:', `Post included the word/phrase **${word}** which is blacklisted.`)
                .setFooter(`Deleted Post Player ID: ${Object.values(data.poster)[0].userId} `)
                .setTimestamp()
            );
          })
          .catch((error) => {
            console.log('There was an error deleting the wall post (blacklisted post)!', error);
          });
      }
    });
  });

  // @ts-ignore
  rbx.onWallPost(process.env.GROUP).on('error', (err) => {
    console.log(`onWallPost event encountered an error!`, err);
  });

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
