import { Message } from 'discord.js';
import { getIdFromUsername, getPlayerInfo, getRankNameInGroup } from 'noblox.js';
import axios from 'axios';
import verifiedUser from '../../models/verification';
import bannedPlayers from '../../models/banned';
import { BannedTypes } from '../../types/banned';

export = {
  config: {
    name: 'verify',
    description: 'Verify your Roblox account',
    aliases: ['link', 'linkaccount'],
    accessableby: "Everyone (unless you're called PrimeAlpha)",
  },
  run: async (bot: any, message: Message) => {
    let RobloxID = 0;
    let Rank = '';

    message.channel.send(`Welcome to **${message.guild?.name}**, ${message.author.username}! :wave: \nPlease visit our website https://google.co.uk to verify your Roblox Account, it won't take long!`);

    message.channel.send('what is your roblox name');

    const collectingrobloxname = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
    const robloxname = collectingrobloxname.first()?.toString();

    try {
      RobloxID = await getIdFromUsername(String(robloxname));
    } catch (e) {
      return message.channel.send('Username was never inputted in time or you put in an incorrect user.');
    }

    const foundPlayer = await verifiedUser.findOne({ RobloxName: robloxname });
    const Bannedplayer = await bannedPlayers.find({}).select('RobloxUsername RobloxID');

    if (foundPlayer) return message.channel.send('You are already verified. Did you mean to set this account primary with .switchaccount?');

    message.channel.send('put apple on your status and reply with done when you are done');

    const collectingApple = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
    const done = collectingApple.first();

    if (done?.content.toLowerCase() === 'done') {
      const playerInfo = await getPlayerInfo(RobloxID);
      console.log(playerInfo.status);
      console.log(playerInfo.blurb);
      console.log(playerInfo.age);

      if (playerInfo.blurb.toLowerCase() !== 'apple' && playerInfo.status?.toLowerCase() !== 'apple') return message.channel.send('oh you think im stupid, put the word apple as your status or description, jeez');

      if (playerInfo.age! <= 14) {
        return bot.channels.cache.get(process.env.ADMIN_LOG).send(`Warning: ${playerInfo.username}'s account is under two weeks old, their account is currently ${playerInfo.age} days old.`);
      }

      await axios.get('https://friends.roblox.com/v1/users/109306508/friends').then((response) =>
        Object.values(response.data.data).forEach((value: any) => {
          Bannedplayer.forEach((banned: BannedTypes) => {
            if (value.name === banned.RobloxUsername) bot.channels.cache.get(process.env.ADMIN_LOG).send(`This player is friends with ${value.name} who is a banned player, be aware!`);
          });
        })
      );

      switch (await getRankNameInGroup(Number(process.env.GROUP), RobloxID)) {
        case 'Follower':
          Rank = 'Follower';
          break;

        case 'Dedicated Follower':
          Rank = 'Dedicated Follower';
          break;

        case 'Ultimate Follower':
          Rank = 'Ultimate Follower';
          break;

        case 'Supreme Follower':
          Rank = 'Supreme Follower';
          break;

        case 'Omega Follower':
          Rank = 'Omega Follower';
          break;

        default:
          Rank = 'Follower';
          break;
      }

      const newUser = await verifiedUser.create({
        RobloxName: playerInfo.username,
        RobloxID,
        DiscordID: message.author.id,
        timestamp: Date.now(),
        Role: Rank,
        Primary: true,
      });

      await newUser.save();

      message.channel.send('Verified successfully.');

      message.member?.roles.add(message.member!.guild.roles.cache.find((discordRole) => discordRole.name === Rank)!, 'Verified Player role').catch(() => undefined);
      message.member?.setNickname(playerInfo.username).catch(() => undefined);
    }
  },
};
