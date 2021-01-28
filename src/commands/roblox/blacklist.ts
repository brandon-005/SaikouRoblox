import { Message, MessageEmbed } from 'discord.js';
import word from '../../models/wordOrPhrase';

export = {
  config: {
    name: 'blacklist',
    description: 'Permanently exile a Roblox user.',
    usage: '.exile <RobloxUserID> <reason>',
    accessableby: 'ADMINISTRATOR',
    aliases: ['blacklistword', 'addword'],
  },
  run: async (bot: any, message: Message) => {
    if (!message.member!.hasPermission('ADMINISTRATOR')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** blacklist\n**Permissions Needed:** <ADMINISTRATOR>')
          .setColor('#f94343')
          .setFooter('<> - Staff Perms ● Public Perms - [] ')
      );
    }

    message.channel.send(
      new MessageEmbed()
        .setTitle('Prompt [1/1]') //
        .setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to blacklist a new word/phrase.\n\n❓ **What is the word/phrase you would like to blacklist?**\n\nInput **cancel** to cancel the blacklist prompt.`)
        .setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
        .setColor('#7289DA')
        .setThumbnail(bot.user!.displayAvatarURL())
    );

    const collectingWordOrPhrase = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
    const wordOrPhrase: any = collectingWordOrPhrase.first()?.toString();

    const foundWord = await word.findOne({ content: wordOrPhrase });

    if (foundWord) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle(`❌ Unable to add word!`)
          .setDescription(`The word or phrase you are trying to add has already been added.`)
          .setColor('#f94343')
          .setFooter(`Unable to add word.`)
      );
    }

    if (collectingWordOrPhrase.first()!.content.toLowerCase() === 'cancel') {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('✅ Blacklist Cancelled!') //
          .setDescription(`The blacklist has been cancelled successfully.`)
          .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
          .setColor('#2ED85F')
      );
    }

    try {
      const confirm = await message.channel.send(
        new MessageEmbed() //
          .setTitle('Are you sure?') //
          .setDescription(`Please confirm this final prompt to blacklist the word/phrase.\n\n❓ **Are the following fields correct for the blacklist?**\n\n• \`Word/Phrase\` - **${wordOrPhrase}**\n\nIf the fields above look correct you can blacklist this word/phrase by reacting with a ✅ or cancel the blacklist with ❌ if these fields don't look right.`)
          .setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
          .setColor('#f94343')
      );
      confirm.react('✅');
      confirm.react('❌');

      const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
      const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

      if (ConfirmationResult === '✅') {
        const newSettings = await word.create({
          content: wordOrPhrase,
        });

        await newSettings.save();
        message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Success!')
            .setColor('#2ED85F')
            .setDescription(`You successfully added **${wordOrPhrase}** to the blacklist!`)
            .setTimestamp()
        );
      } else {
        return message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Blacklist Cancelled!')
            .setDescription(`The blacklist has been cancelled successfully.`)
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
      );
    }
  },
};
