import rbx from 'noblox.js';
import { Client, Collection, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv';
import RobloxToken from './models/token';
import Exile from './models/userExile';
import Words from './models/wordOrPhrase';

dotenv.config();

const bot: any = new Client({
  ws: { intents: ['GUILD_MESSAGES', 'GUILDS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS', 'GUILD_PRESENCES'] },
  disableMentions: 'everyone',
});

bot.commands = new Collection();
bot.aliases = new Collection();

['commands', 'aliases'].forEach((collection: string) => {
  bot[collection] = new Collection();
});
['loadCommands', 'loadEvents'].forEach((handlerFile: string) => require(`./handlers/${handlerFile}.js`)(bot));

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

  console.log(`[SUCCESS]: Logged into the "${(await rbx.getCurrentUser()).UserName}" Roblox account!`);

  setInterval(refreshCookie, 300000);

  // -- Removing user who's supposed to be exiled
  async function ExileUsers(): Promise<void> {
    const user = Exile.find({}).select('RobloxUsername RobloxID Moderator Reason');

    (await user).forEach(async (player: { RobloxID: any; RobloxUsername: String; Moderator: String; Reason: String }) => {
      try {
        const rank = await rbx.getRankInGroup(Number(process.env.GROUP), player.RobloxID);

        if (rank !== 0) {
          await rbx.exile(Number(process.env.GROUP), player.RobloxID).then((): void => {
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
          });
        }
      } catch (err) {
        return;
      }
    });
  }

  setInterval(ExileUsers, 7000);

  async function DeletePosts(): Promise<void> {
    try {
      rbx.getWall(Number(process.env.GROUP), 'Desc', 10).then(async (WallPostPage) => {
        const posts = WallPostPage.data;
        const blacklisted = await Words.find({}).select('content');

        for (let i = 0; i < posts.length; i += 1) {
          const msg = posts[i];

          blacklisted.forEach(async (word: any) => {
            if (msg.body.toLowerCase().includes(word.content)) {
              try {
                await rbx.deleteWallPost(Number(process.env.GROUP), msg.id);
              } catch (err) {
                console.log(err);
                return;
              }
              bot.channels.cache.get(process.env.ADMIN_LOG).send(
                new MessageEmbed() //
                  .setTitle(`:warning: Post deleted!`)
                  .setColor('#FFD62F')
                  .setDescription(`**${Object.values(msg.poster)[0].username}'s post was deleted automatically by SaikouGroup**`)
                  .addField('Deleted Message:', msg.body)
                  .addField('Deletion Reason:', `Post included the word/phrase **${word.content}** which is blacklisted.`)
                  .setFooter(`Deleted Post Player ID: ${Object.values(msg.poster)[0].userId} `)
                  .setTimestamp()
              );
            }
          });
        }
      });
    } catch (err) {
      return;
    }
  }

  setInterval(DeletePosts, 120000);

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
