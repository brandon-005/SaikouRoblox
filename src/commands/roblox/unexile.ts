import { Message, MessageEmbed } from 'discord.js';
import Exile from '../../models/userExile';

export = {
  config: {
    name: 'unexile',
    description: 'Permanently exile a Roblox user.',
    usage: '.unexile <RobloxUserID> <reason>',
    accessableby: 'KICK_MEMBERS',
    aliases: ['removeexile'],
  },
  run: async (bot: any, message: Message) => {
    if (!message.member!.hasPermission('KICK_MEMBERS')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** suspend\n**Permissions Needed:** <KICK_MEMBERS>')
          .setColor('#f94343')
          .setFooter('<> - Staff Perms ● Public Perms - [] ')
      );
    }

    try {
      message.channel.send(
        new MessageEmbed()
          .setTitle('Prompt [1/1]') //
          .setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to remove an exiled user.\n\n❓ **What is the Roblox username of the person you would like to remove from the exile?**\n\nInput **cancel** to cancel the unexile prompt.`)
          .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
          .setColor('#7289DA')
          .setThumbnail(bot.user!.displayAvatarURL())
      );

      const collectingRobloxName = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
      const RobloxName: any = collectingRobloxName.first()?.toString();

      if (collectingRobloxName.first()!.content.toLowerCase() === 'cancel') {
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Unexile Cancelled!') //
            .setDescription(`The unexile has been cancelled successfully.`)
            .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('#2ED85F')
        );
      }

      const player = await Exile.findOne({ RobloxUsername: RobloxName });

      if (!player) {
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('🔍 Unable to find Roblox Player!')
            .setDescription(`Please provide a valid player to **unexile**!`)
            .setColor('#f94343')
            .setFooter('Ensure the capitalisation is correct!')
            .setTimestamp()
        );
      }

      const confirm = await message.channel.send(
        new MessageEmbed() //
          .setTitle('Are you sure?') //
          .setDescription(`Please confirm this final prompt to unexile the user.\n\n❓ **Are the following fields correct for the unexile?**\n\n• \`Roblox Player\` - **[${RobloxName}](https://www.roblox.com/users/${player.RobloxID}/profile)**\n\nIf the fields above look correct you can unexile this user by reacting with a ✅ or cancel the unexile with ❌ if these fields don't look right.`)
          .setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
          .setColor('#f94343')
      );
      confirm.react('✅');
      confirm.react('❌');

      const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

      if (ConfirmationResult === '✅') {
        Exile.deleteOne({ RobloxUsername: RobloxName }).then(() => {
          message.channel.send(
            new MessageEmbed() //
              .setTitle('✅ User Removed!')
              .setDescription(`**${RobloxName}** has been removed from the exile list, they will no longer get exiled.`)
              .setColor('#2ED85F')
              .setFooter('Success!')
          );
        });
      } else {
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Unexile Cancelled!')
            .setDescription(`The unexile has been cancelled successfully.`)
            .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('#2ED85F')
        );
      }
    } catch (e) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('⏱ Out of time!')
          .setDescription('You ran out of time to input the prompt answer!')
          .setColor('#f94343')
          .setFooter("Prompt wasn't filled in within 2 mins", message.author.displayAvatarURL())
      );
    }
  },
};
