import { Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';
import Exile from '../../models/userExile';

export = {
  config: {
    name: 'permexile',
    description: 'Permanently exile a Roblox user.',
    usage: '.exile <RobloxUserID> <reason>',
    accessableby: 'MANAGE_MESSAGES',
    aliases: ['permremove', 'robloxban', 'exile'],
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
        .setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to permanently exile a user.\n\n❓ **What is the Roblox username of the person you would like to permanently remove?**\n\nInput **cancel** to cancel the exile prompt.`)
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
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔍 Unable to find Roblox user!')
          .setDescription(`Please provide a valid Roblox username to **permexile**!`)
          .setColor('#f94343')
          .setFooter('Ensure the capitalisation is correct!')
          .setTimestamp()
      );
    }

    const Player = await Exile.findOne({ RobloxID });

    if (Player) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle(`❌ Unable to exile user`)
          .setDescription(`The user you are trying to perform this action on is already exiled.`)
          .setColor('#f94343')
          .setFooter(`Unable to exile user.`)
      );
    }

    try {
      message.channel.send(
        new MessageEmbed()
          .setTitle('Prompt [2/2]') //
          .setDescription(`Please follow the instructions provided to permanently exile a user.\n\n❓ **What is the reason for exiling this user?**\n\nInput **cancel** to cancel the exile prompt.`)
          .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
          .setColor('#7289DA')
          .setThumbnail(bot.user!.displayAvatarURL())
      );

      const collectingReason = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const Reason = collectingReason.first();

      if (cancel(collectingReason.first())) return;

      const confirm = await message.channel.send(
        new MessageEmbed() //
          .setTitle('Are you sure?') //
          .setDescription(`Please confirm this final prompt to permanently suspend the user.\n\n❓ **Are the following fields correct for the exile?**\n\n• \`Roblox username\` - **${RobloxName}**\n• \`Reason\` - **${Reason}**\n\nIf the fields above look correct you can suspend this user by reacting with a ✅ or cancel the suspension with ❌ if these fields don't look right.`)
          .setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
          .setColor('#f94343')
      );
      confirm.react('✅');
      confirm.react('❌');

      const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

      if (ConfirmationResult === '✅') {
        if (!Player) {
          const newSettings = await Exile.create({
            Moderator: message.author.username,
            Reason: `${Reason}`,
            RobloxUsername: `${RobloxName}`,
            RobloxID,
          });

          await newSettings.save();
          message.channel.send(
            new MessageEmbed() //
              .setTitle('✅ Success!')
              .setColor('#2ED85F')
              .setDescription(`You successfully permanently exiled **${RobloxName}**`)
              .setTimestamp()
          );

          // @ts-ignore
          const thumbnail = await rbx.getPlayerThumbnail({ userIds: RobloxID, size: 250, format: 'png', isCircular: false });

          await bot.channels.cache.get(process.env.MODERATION).send(
            new MessageEmbed() //
              .setAuthor(`Saikou Group | Permanent Exile`, `${Object.values(thumbnail)[0].imageUrl}`)
              .addField('User:', `${RobloxName}`, true)
              .addField('Moderator:', `<@${message.author.id}>`, true)
              .addField('Reason:', `${Reason}`)
              .setThumbnail(`${Object.values(thumbnail)[0].imageUrl}`)
              .setColor('#2ED85F')
              .setFooter('Exile')
              .setTimestamp()
          );
        }
      } else
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('Exile Cancelled!')
            .setDescription(`The exile has been cancelled successfully.`)
            .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('#2ED85F')
            .setThumbnail(bot.user!.displayAvatarURL())
        );
    } catch (e) {
      console.error(e);
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
