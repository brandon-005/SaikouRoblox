import { Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';

export = {
  config: {
    name: 'suspend',
    description: 'Suspend a Roblox user.',
    usage: '.suspend <RobloxUserID> <reason>',
    accessableby: 'MANAGE_MESSAGES',
    aliases: ['usersuspend', 'robloxsuspend'],
  },
  run: async (bot: any, message: Message) => {
    if (!message.member!.hasPermission('MANAGE_MESSAGES')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** suspend\n**Permissions Needed:** <MANAGE_MESSAGES>')
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
        .setTitle('Prompt [1/2]') //
        .setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to suspend a user.\n\n❓ **What is the Roblox username of the person you would like to suspend?**\n\nInput **cancel** to cancel the suspend prompt.`)
        .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
        .setColor('#7289DA')
        .setThumbnail(bot.user!.displayAvatarURL())
    );

    const collectingRobloxName = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
    const RobloxName: any = collectingRobloxName.first()?.toString();

    if (cancel(collectingRobloxName.first())) return;

    let RobloxID;
    try {
      RobloxID = await rbx.getIdFromUsername(RobloxName);
    } catch (e) {
      return message.channel.send('Username was never inputted in time or you put in an incorrect user.');
    }

    try {
      message.channel.send(
        new MessageEmbed()
          .setTitle('Prompt [2/2]') //
          .setDescription(`Please follow the instructions provided to suspend a user.\n\n❓ **What is the reason for suspending this user?**\n\nInput **cancel** to cancel the suspend prompt.`)
          .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
          .setColor('#7289DA')
          .setThumbnail(bot.user!.displayAvatarURL())
      );

      const collectingReason = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const Reason = collectingReason.first();

      if (cancel(Reason)) return;

      const confirm = await message.channel.send(
        new MessageEmbed() //
          .setTitle('Are you sure?') //
          .setDescription(`Please confirm this final prompt to suspend the user.\n\n❓ **Are the following fields correct for the suspension?**\n\n• \`Roblox username\` - **${RobloxName}**\n• \`Reason\` - **${Reason}**\n\nIf the fields above look correct you can suspend this user by reacting with a ✅ or cancel the suspension with ❌ if these fields don't look right.`)
          .setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
          .setColor('#f94343')
      );
      confirm.react('✅');
      confirm.react('❌');

      const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

      if (ConfirmationResult === '✅') {
        // @ts-ignore
        const rankName = await rbx.getRankNameInGroup(process.env.GROUP, RobloxID);

        if (rankName === 'Guest') {
          return message.channel.send('Please input a user who is still in the group.');
        }

        if (rankName === `${process.env.SUSPENDED_RANK}`) {
          return message.channel.send('User is already suspended.');
        }

        // @ts-ignore
        rbx.setRank(process.env.GROUP, RobloxID, 2);

        message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Success!')
            .setDescription(`You successfully suspended **${RobloxName}**.`)
            .setFooter('Successful Shout')
            .setTimestamp()
            .setColor('#2ED85F')
        );

        await bot.channels.cache.get(process.env.MODERATION).send(
          new MessageEmbed() //
            .setAuthor(`Saikou Group | Suspension`, bot.user.displayAvatarURL())
            .addField('User:', `${RobloxName}`, true)
            .addField('Moderator:', `<@${message.author.id}>`, true)
            .addField('Reason:', `${Reason}`)
            .setThumbnail(bot.user.displayAvatarURL())
            .setColor('#2ED85F')
            .setFooter('Suspension')
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
