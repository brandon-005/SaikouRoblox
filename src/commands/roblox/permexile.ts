import { Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';
import Exile from '../../models/userExile';

export = {
  config: {
    name: 'permexile',
    description: 'Permanently exile a Roblox user.',
    usage: '.exile <RobloxUserID> <reason>',
    accessableby: 'MANAGE_MESSAGES',
    aliases: ['permremove', 'robloxban'],
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

    message.channel.send(
      new MessageEmbed()
        .setTitle('Prompt [1/2]') //
        .setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to permanently exile a user.\n\n❓ **What is the Roblox username of the person you would like to permanently remove?**\n\nInput **cancel** to cancel the suspend prompt.`)
        .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
        .setColor('#7289DA')
        .setThumbnail(bot.user!.displayAvatarURL())
    );

    const collectingRobloxName = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
    const RobloxName: any = collectingRobloxName.first()?.toString();

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
          .setDescription(`Please follow the instructions provided to permanently exile a user.\n\n❓ **What is the reason for exiling this user?**\n\nInput **cancel** to cancel the suspend prompt.`)
          .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
          .setColor('#7289DA')
          .setThumbnail(bot.user!.displayAvatarURL())
      );

      const collectingReason = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const Reason = collectingReason.first();

      if (Reason!.content.toLowerCase() === 'cancel') return message.channel.send('Cancelled');

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
        const Player = await Exile.findOne({ RobloxID });

        if (Player) {
          return message.channel.send('lol noob already exiled');
        }

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

          bot.channels.cache.get('795648415958302731').send(
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
        }
      } else return message.channel.send('Cancelled Suspension.');
    } catch (e) {
      return message.channel.send('Prompt was not filled within the time limit.');
    }
  },
};
