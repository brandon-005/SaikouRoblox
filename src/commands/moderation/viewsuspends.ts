import { Message, MessageEmbed } from 'discord.js';
import duration from 'humanize-duration';
import ms from 'ms';
import moment from 'moment';
import timeData from '../../models/suspendTimes';

export = {
  config: {
    name: 'viewsuspends',
    description: 'View suspensions for all players currently suspended or a specific one.',
    usage: '.suspend',
    accessableby: 'KICK_MEMBERS',
    aliases: ['listsuspends', 'viewsuspensions'],
  },
  run: async (bot: any, message: Message) => {
    if (!message.member!.hasPermission('KICK_MEMBERS')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** viewsuspensions\n**Permissions Needed:** <KICK_MEMBERS>')
          .setColor('#f94343')
          .setFooter('<> - Staff Perms ● Public Perms - [] ')
      );
    }

    try {
      const option = await message.channel.send(
        new MessageEmbed()
          .setTitle('Selection') //
          .setDescription(`Please follow the instructions provided to view suspensions.\n\n❓ **Would you like to view a specifc users suspenion?**\n\nReact with a ✅ to view a specific user's suspension or react with ❌ to list them all.`)
          .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
          .setColor('#7289DA')
          .setThumbnail(bot.user!.displayAvatarURL())
      );

      option.react('✅');
      option.react('❌');

      const optionCollected = await option.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const optionResult = optionCollected.first()?.emoji.name;

      if (optionResult === '✅') {
        message.channel.send(
          new MessageEmbed()
            .setTitle('Prompt [1/1]') //
            .setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to view a specific user's suspension.\n\n❓ **What is the Roblox username of the suspended player?**\n\nInput **cancel** to cancel the view prompt.`)
            .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
            .setColor('#7289DA')
            .setThumbnail(bot.user!.displayAvatarURL())
        );

        const collectingRobloxName: any = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
        const RobloxName: string = collectingRobloxName.first()?.toString();

        if (collectingRobloxName.first()!.content.toLowerCase() === 'cancel') {
          return message.channel.send(
            new MessageEmbed() //
              .setTitle('✅ View suspends Cancelled!') //
              .setDescription(`The viewing has been cancelled successfully.`)
              .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
              .setColor('#2ED85F')
          );
        }

        const player = await timeData.findOne({ RobloxName });

        if (!player) {
          return message.channel.send(
            new MessageEmbed() //
              .setTitle('🔍 Unable to find Roblox Player!')
              .setDescription(`Please provide a valid player to view suspensions on!`)
              .setColor('#f94343')
              .setFooter('Ensure the spelling is correct!')
              .setTimestamp()
          );
        }

        return message.channel.send(
          new MessageEmbed() //
            .setTitle('📂 Suspension Information')
            .setDescription(`**${player.RobloxName} was suspended on ${moment(player.timestamp, 'DD-MM-YYYY').format('Do MMMM YYYY')} for ${ms(player.Duration)}.**`)
            .addField('Suspended By:', player.Moderator, true)
            .addField('Duration Remaining:', duration(player.timestamp.getTime() + player.Duration - Date.now(), { units: ['d', 'h', 'm'], round: true }), true)
            .addField('Suspension Reason:', player.Reason)
            .setColor('#7289DA')
            .setFooter(`Suspended Player ID: ${player.RobloxID}`)
        );
      }
      const data = await timeData.find({}).select('RobloxName Duration Reason');
      let text = '';

      data.forEach((player) => {
        text += `**${player.RobloxName}** - ${ms(player.Duration)}\n${player.Reason}\n\n`;
      });

      const suspendEmbed = new MessageEmbed() //
        .setTitle('📂 Current Suspensions')
        .setColor('#7289DA');

      if (data.length === 0) {
        suspendEmbed.setDescription("Oops! It doesn't appear anyone is suspended at the moment.");
        suspendEmbed.setFooter('No suspended players.');
      } else {
        suspendEmbed.setDescription(`All the currently suspended players will show up here displaying their name, reason for suspension and duration.\n\n**Look at a players suspension more in depth by choosing to view a specific one.**\n\n${text}`);
        suspendEmbed.setFooter(`All suspended players.`);
      }

      return message.channel.send(suspendEmbed).catch(() => message.channel.send('There is too many suspensions to list at the moment.'));
    } catch (err) {
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
