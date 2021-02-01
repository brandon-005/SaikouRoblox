import rbx from 'noblox.js';
import { Client, Collection, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv';
import RobloxToken from './models/token';
import Exile from './models/userExile';
import Words from './models/wordOrPhrase';
import timedata from './models/suspendTimes';
import postDeletions from './models/deletions';

dotenv.config();

const bot: any = new Client({
  ws: { intents: ['GUILD_MESSAGES', 'GUILDS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MEMBERS', 'GUILD_PRESENCES'] },
  partials: ['USER'],
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

  async function SuspendAndExile(): Promise<void> {
    const data = timedata.find({}).select('RobloxName RobloxID timestamp Role Duration');
    const user = Exile.find({}).select('RobloxUsername RobloxID Moderator Reason');
    let rank: number;

    /* --- Suspending --- */
    (await data).forEach(async (player) => {
      /* --- If suspended and time hasn't expired --- */
      if (player.timestamp.getTime() + player.Duration > Date.now()) {
        try {
          rank = await rbx.getRankInGroup(Number(process.env.GROUP), player.RobloxID);

          if (rank !== 0) {
            if (rank !== 8) await rbx.setRank(Number(process.env.GROUP), player.RobloxID, 8);
          }
        } catch (err) {
          return;
        }
      } else {
        // -- Reranking player and removing document ---
        bot.channels.cache.get(process.env.ADMIN_LOG).send(
          new MessageEmbed() //
            .setTitle(`✅ Suspension Expired!`)
            .setColor('#7289DA')
            .setDescription(`**${player.RobloxName}'s suspension has concluded.**`)
            .setFooter(`Suspended Player ID: ${player.RobloxID} `)
            .setTimestamp()
        );

        await rbx.setRank(Number(process.env.GROUP), player.RobloxID, player.Role);

        await timedata.deleteOne({ RobloxID: player.RobloxID });
      }
    });

    (await user).forEach(async (player: { RobloxID: any; RobloxUsername: String; Moderator: String; Reason: String }) => {
      try {
        if (rank !== 0) {
          await rbx.exile(Number(process.env.GROUP), player.RobloxID).then((): void => {
            bot.channels.cache.get(process.env.ADMIN_LOG).send(
              new MessageEmbed() //
                .setTitle(`:warning: Automatic Exile!`)
                .setColor('#FFD62F')
                .setDescription(`**${player.RobloxUsername} was exiled automatically by SaikouGroup**`)
                .addField('Exile Giver:', `${player.Moderator}`)
                .addField('Exile Reason:', `${player.Reason}`)
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

  setInterval(SuspendAndExile, 7000);

  const wallPost = rbx.onWallPost(Number(process.env.GROUP));

  wallPost.on('connect', () => {
    console.log('[SUCCESS]: Listening for new wall posts!');
  });

  wallPost.on('error', () => undefined);

  wallPost.on('data', async (post) => {
    const robloxName: string = Object.values(post.poster)[0].username;
    const robloxID: number = Object.values(post.poster)[0].userId;
    let blacklistedWord: string = '';

    const blacklisted = await Words.find({}).select('content');
    const postDeleted = await postDeletions.findOne({ RobloxName: robloxName });

    blacklisted.forEach(async (word: any) => {
      if (post.body.toLowerCase().includes(word.content)) {
        blacklistedWord = word.content;
        try {
          await rbx.deleteWallPost(Number(process.env.GROUP), post.id);
        } catch (err) {
          return;
        }
      }
    });

    const log = new MessageEmbed() //
      .setTitle(`:warning: Post deleted!`)
      .setColor('#FFD62F')
      .setDescription(`**${robloxName}'s post was deleted automatically by SaikouGroup**`)
      .addField('Deleted Message:', post.body)
      .addField('Deletion Reason:', `Post included the word/phrase **${blacklistedWord}** which is blacklisted.`)
      .setFooter(`Deleted Post Player ID: ${robloxID} `)
      .setTimestamp();

    const suspension = new MessageEmbed() //
      .setTitle(`:warning: Automatic Suspension!`)
      .setColor('#FFD62F')
      .setDescription(`**${robloxName}'s was suspended automatically by SaikouGroup**`)
      .addField('Deleted Message:', post.body)
      .setFooter(`Suspended Player ID: ${robloxID} `)
      .setTimestamp();

    if (!postDeleted) {
      const newData = await postDeletions.create({ RobloxName: robloxName, RobloxID: robloxID, Triggers: 1 });
      await newData.save();

      return bot.channels.cache.get(process.env.ADMIN_LOG).send(log);
    }

    postDeleted.Triggers += 1;
    postDeleted.save();

    if (postDeleted.Triggers === 3) {
      const newTime = await timedata.create({
        RobloxName: robloxName,
        RobloxID: robloxID,
        timestamp: new Date(),
        Role: await rbx.getRankNameInGroup(Number(process.env.GROUP), robloxID),
        Duration: 259200000,
        Moderator: 'SaikouGroup',
        Reason: '**[Automated]** Player posted 3 blacklisted posts.',
      });

      await newTime.save();

      suspension.addField('Suspension Duration:', '3 days');
      suspension.addField('Suspension Reason:', 'Player posted 3 blacklisted posts.');

      return bot.channels.cache.get(process.env.ADMIN_LOG).send(suspension);
    }

    if (postDeleted.Triggers === 5) {
      const newTime = await timedata.create({
        RobloxName: robloxName,
        RobloxID: robloxID,
        timestamp: new Date(),
        Role: await rbx.getRankNameInGroup(Number(process.env.GROUP), robloxID),
        Duration: 604800000,
        Moderator: 'SaikouGroup',
        Reason: '**[Automated]** Player posted 5 blacklisted posts.',
      });

      await newTime.save();

      suspension.addField('Suspension Duration:', '7 days');
      suspension.addField('Suspension Reason:', 'Player posted 5 blacklisted posts.');

      return bot.channels.cache.get(process.env.ADMIN_LOG).send(suspension);
    }

    if (postDeleted.Triggers === 7) {
      const newSettings = await Exile.create({
        Moderator: 'SaikouGroup',
        Reason: '**[Automated]** Player posted 7 blacklisted posts before/after suspensions.',
        RobloxUsername: robloxName,
        RobloxID: robloxID,
      });

      await newSettings.save();
      return;
    }

    bot.channels.cache.get(process.env.ADMIN_LOG).send(log);
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
