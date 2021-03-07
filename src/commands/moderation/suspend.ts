import { Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';
import ms from 'ms';
import timeData from '../../models/suspendTimes';

export = {
  config: {
    name: 'suspend',
    description: 'Suspend a Roblox user.',
    usage: '.suspend',
    accessableby: 'KICK_MEMBERS',
    aliases: ['usersuspend', 'robloxsuspend'],
  },
  run: async (bot: any, message: Message) => {
    let modName = message.guild!.member(message.author)?.nickname;

    if (modName === null) modName = message.author.username;

    if (!message.member!.hasPermission('KICK_MEMBERS')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** suspend\n**Permissions Needed:** <KICK_MEMBERS>')
          .setColor('#f94343')
          .setFooter('<> - Staff Perms ● Public Perms - [] ')
      );
    }

    function cancel(msg: any) {
      if (msg.content.toLowerCase() === 'cancel')
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('Suspension Cancelled!') //
            .setDescription(`The suspension has been cancelled successfully.`)
            .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('#2ED85F')
            .setThumbnail(bot.user!.displayAvatarURL())
        );
    }

    message.channel.send(
      new MessageEmbed()
        .setTitle('Prompt [1/3]') //
        .setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to suspend a user.\n\n❓ **What is the Roblox username of the person you would like to suspend?**\n\nInput **cancel** to cancel the suspend prompt.`)
        .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
        .setColor('#7289DA')
        .setThumbnail(bot.user!.displayAvatarURL())
    );

    const collectingRobloxName = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
    let RobloxName: any = collectingRobloxName.first()?.toString();

    if (cancel(collectingRobloxName.first())) return;

    if (RobloxName.startsWith('<@') || RobloxName.startsWith('<@!')) {
      RobloxName = message.guild!.member(RobloxName.replace(/[\\<>@#&!]/g, ''))?.nickname;
    }

    let RobloxID;
    try {
      RobloxID = await rbx.getIdFromUsername(RobloxName);
    } catch (e) {
      return message.channel.send('Username was never inputted in time or you put in an incorrect user.');
    }

    if ((await rbx.getRankInGroup(Number(process.env.GROUP), RobloxID)) >= 20) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle(`❌ Unable to suspend user!`)
          .setDescription(`The player you are trying to perform this action on cannot be suspended.`)
          .setColor('#f94343')
          .setFooter(`Unable to suspend user.`)
      );
    }

    const rankName: string = await rbx.getRankNameInGroup(Number(process.env.GROUP), RobloxID);

    if (rankName === 'Guest') {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔍 Unable to find Roblox player!')
          .setDescription(`Please provide a Roblox player who is still in the group!`)
          .setColor('#f94343')
          .setFooter('Unable to find player')
          .setTimestamp()
      );
    }

    if (rankName === `${process.env.SUSPENDED_RANK}`) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle(`❌ Unable to suspend user`)
          .setDescription(`The player you are trying to perform this action on is already suspended.`)
          .setColor('#f94343')
          .setFooter(`Unable to suspend user.`)
      );
    }

    try {
      message.channel.send(
        new MessageEmbed()
          .setTitle('Prompt [2/3]') //
          .setDescription(`Please follow the instructions provided to suspend a user.\n\n❓ **What is the reason for suspending this user?**\n\nInput **cancel** to cancel the suspend prompt.`)
          .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
          .setColor('#7289DA')
          .setThumbnail(bot.user!.displayAvatarURL())
      );

      const collectingReason = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const Reason = collectingReason.first();

      if (cancel(Reason)) return;

      message.channel.send(
        new MessageEmbed()
          .setTitle('Prompt [3/3]') //
          .setDescription(`Please follow the instructions provided to suspend a user.\n\n❓ **How long would you like to suspend this player for?**\n\nInput **cancel** to cancel the suspend prompt.`)
          .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
          .setColor('#7289DA')
          .setThumbnail(bot.user!.displayAvatarURL())
      );

      const collectingDuration = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const Duration: any = collectingDuration.first()?.toString();

      if (cancel(collectingDuration.first())) return;

      if (!ms(Duration)) {
        return message.channel.send(
          new MessageEmbed() //
            .setColor('#f94343')
            .setTitle('⏱️ Supply a time!')
            .setDescription(`Please supply a correct time for the suspension.`)
            .setFooter('h - Hours ● Days - d')
        );
      }

      const confirm = await message.channel.send(
        new MessageEmbed() //
          .setTitle('Are you sure?') //
          .setDescription(`Please confirm this final prompt to suspend the user.\n\n❓ **Are the following fields correct for the suspension?**\n\n• \`Roblox Player\` - **[${RobloxName}](https://www.roblox.com/users/${RobloxID}/profile)**\n• \`Reason\` - **${Reason}**\n• \`Duration\` - **${ms(ms(Duration))}**\n\nIf the fields above look correct you can suspend this user by reacting with a ✅ or cancel the suspension with ❌ if these fields don't look right.`)
          .setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
          .setColor('#f94343')
      );
      confirm.react('✅');
      confirm.react('❌');

      const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

      if (ConfirmationResult === '✅') {
        const suspendTime = await timeData.findOne({ RobloxID });

        if (!suspendTime) {
          const newTime = await timeData.create({
            RobloxName,
            RobloxID,
            timestamp: new Date(),
            Role: await rbx.getRankNameInGroup(Number(process.env.GROUP), RobloxID),
            Duration: ms(Duration),
            Moderator: modName,
            Reason,
          });

          await newTime.save();

          try {
            await rbx.setRank(Number(process.env.GROUP), RobloxID, 8);
          } catch (err) {
            return message.channel.send(
              new MessageEmbed() //
                .setTitle(`❌ Unable to suspend user!`)
                .setDescription(`The player you are trying to perform this action on cannot be suspended.`)
                .setColor('#f94343')
                .setFooter(`Unable to suspend user.`)
            );
          }

          message.channel.send(
            new MessageEmbed() //
              .setTitle('✅ Success!')
              .setDescription(`You successfully suspended **${RobloxName}**.`)
              .setFooter('Successful Suspension')
              .setTimestamp()
              .setColor('#2ED85F')
          );
        } else return message.channel.send('This player is already suspended.');

        const robloxAvatar = await rbx.getPlayerThumbnail(RobloxID, 250, 'png', false);

        await bot.channels.cache.get(process.env.MODERATION).send(
          new MessageEmbed() //
            .setAuthor(`Saikou Group | ${ms(ms(Duration))} Suspension`, `${Object.values(robloxAvatar)[0].imageUrl}`)
            .addField('User:', `${RobloxName}`, true)
            .addField('Moderator:', `<@${message.author.id}>`, true)
            .addField('Reason:', `${Reason}`)
            .setThumbnail(`${Object.values(robloxAvatar)[0].imageUrl}`)
            .setColor('#2ED85F')
            .setFooter(`${ms(ms(Duration))} Suspension`)
            .setTimestamp()
        );
      } else return message.channel.send('Cancelled Suspension.');
    } catch (e) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('⏱ Out of time!')
          .setDescription('You ran out of time to input the prompt answer!')
          .setColor('#f94343')
          .setThumbnail(message.author.displayAvatarURL())
      );
    }
  },
};
