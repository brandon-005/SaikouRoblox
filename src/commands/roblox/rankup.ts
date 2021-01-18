import { Client, Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';

export = {
  config: {
    name: 'rankup',
    description: 'Rank a player up to the next rank in the group.',
    usage: '.rankup',
    accessableby: 'KICK_MEMBERSS',
    aliases: ['promote'],
  },
  run: async (bot: Client, message: Message) => {
    if (!message.member!.hasPermission('KICK_MEMBERS')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** rankup\n**Permissions Needed:** <KICK_MEMBERS>')
          .setColor('#f94343')
          .setFooter('<> - Staff Perms ● Public Perms - [] ')
      );
    }

    message.channel.send(
      new MessageEmbed()
        .setTitle('Prompt [1/1]') //
        .setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to rank up a player.\n\n❓ **What is the Roblox username of the player you would like to rank up?**\n\nInput **cancel** to cancel the rankup prompt.`)
        .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
        .setColor('#7289DA')
        .setThumbnail(bot.user!.displayAvatarURL())
    );

    const collectingRobloxName = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
    const RobloxName: any = collectingRobloxName.first()?.toString();

    let RobloxID: number;
    try {
      RobloxID = await rbx.getIdFromUsername(RobloxName);
    } catch (e) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔍 Unable to find Roblox user!')
          .setDescription(`Please provide a valid Roblox username to **rankup**!`)
          .setColor('#f94343')
          .setFooter('Ensure the capitalisation is correct!')
          .setTimestamp()
      );
    }

    if (collectingRobloxName.first()!.content.toLowerCase() === 'cancel') {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('✅ Rankup Cancelled!') //
          .setDescription(`The rankup has been cancelled successfully.`)
          .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
          .setColor('#2ED85F')
      );
    }

    try {
      const confirm = await message.channel.send(
        new MessageEmbed() //
          .setTitle('Are you sure?') //
          .setDescription(`Please confirm this final prompt to rankup the user.\n\n❓ **Are the following fields correct for the rankup?**\n\n• \`Roblox username\` - **${RobloxName}**\n\nIf the fields above look correct you can rankup this user by reacting with a ✅ or cancel the rankup with ❌ if these fields don't look right.`)
          .setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
          .setColor('#f94343')
      );
      confirm.react('✅');
      confirm.react('❌');

      const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

      if (ConfirmationResult === '✅') {
        try {
          // @ts-ignore
          await rbx.changeRank(process.env.GROUP, RobloxID, 1).then(
            async (): Promise<void> => {
              message.channel.send(
                new MessageEmbed() //
                  .setTitle('✅ Success!')
                  .setColor('#2ED85F') // @ts-ignore
                  .setDescription(`You successfully ranked up **${RobloxName}** to **${await rbx.getRankNameInGroup(process.env.GROUP, RobloxID)}**`)
                  .setTimestamp()
              );
            }
          );
        } catch (err) {
          return message.channel.send(
            new MessageEmbed() //
              .setTitle('🔍 Unable to find Roblox player!')
              .setDescription(`Please provide a valid Roblox username who is still in the group!`)
              .setColor('#f94343')
              .setFooter('Unable to find player')
              .setTimestamp()
          );
        }
      } else {
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Rankup Cancelled!')
            .setDescription(`The rankup has been cancelled successfully.`)
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
          .setThumbnail(message.author.displayAvatarURL())
      );
    }
  },
};
