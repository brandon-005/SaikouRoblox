import { Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';
import Exile from '../../models/userExile';

export = {
  config: {
    name: 'permexile',
    description: 'Permanently exile a Roblox user.',
    usage: '.exile <RobloxUserID> <reason>',
    accessableby: 'KICK_MEMBERS',
    aliases: ['permremove', 'robloxban', 'exile'],
  },
  run: async (bot: any, message: Message) => {
    let modName = message.guild!.member(message.author)?.nickname;

    if (modName === null) modName = message.author.username;

    if (!message.member!.hasPermission('KICK_MEMBERS')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** permexile\n**Permissions Needed:** <KICK_MEMBERS>')
          .setColor('#f94343')
          .setFooter('<> - Staff Perms ● Public Perms - [] ')
      );
    }

    function cancel(msg: any) {
      if (msg.content.toLowerCase() === 'cancel')
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Exile Cancelled!') //
            .setDescription(`The exile has been cancelled successfully.`)
            .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('#2ED85F')
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

    const RobloxRank = await rbx.getRankInGroup(Number(process.env.GROUP), RobloxID);
    const Player = await Exile.findOne({ RobloxID });

    if (RobloxRank >= 50) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle(`❌ Unable to exile user!`)
          .setDescription(`The player you are trying to perform this action on cannot be exiled.`)
          .setColor('#f94343')
          .setFooter(`Unable to exile user.`)
      );
    }

    if (Player) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle(`🚫 Already Exiled!`)
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
          .setDescription(`Please confirm this final prompt to permanently suspend the user.\n\n❓ **Are the following fields correct for the exile?**\n\n• \`Roblox Player\` - **[${RobloxName}](https://www.roblox.com/users/${RobloxID}/profile)**\n• \`Reason\` - **${Reason}**\n\nIf the fields above look correct you can suspend this user by reacting with a ✅ or cancel the suspension with ❌ if these fields don't look right.`)
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
            Moderator: modName,
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

          const robloxAvatar = await rbx.getPlayerThumbnail(RobloxID, 250, 'png', false);

          await bot.channels.cache.get(process.env.MODERATION).send(
            new MessageEmbed() //
              .setAuthor(`Saikou Group | Permanent Exile`, `${Object.values(robloxAvatar)[0].imageUrl}`)
              .addField('User:', `${RobloxName}`, true)
              .addField('Moderator:', `<@${message.author.id}>`, true)
              .addField('Reason:', `${Reason}`)
              .setThumbnail(`${Object.values(robloxAvatar)[0].imageUrl}`)
              .setColor('#2ED85F')
              .setFooter('Exile')
              .setTimestamp()
          );
        }
      } else
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Exile Cancelled!')
            .setDescription(`The exile has been cancelled successfully.`)
            .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('#2ED85F')
        );
    } catch (e) {
      console.error(e);
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('⏱ Out of time!')
          .setDescription('You ran out of time to input the prompt answer!')
          .setColor('#f94343')
      );
    }
  },
};
