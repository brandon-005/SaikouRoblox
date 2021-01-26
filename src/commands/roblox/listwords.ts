import { Client, Message, MessageEmbed } from 'discord.js';
import words from '../../models/wordOrPhrase';

export = {
  config: {
    name: 'listwords',
    description: 'List the current blacklisted words.',
    usage: '.listwords',
    accessableby: 'KICK_MEMBERS',
    aliases: ['listblacklisted'],
  },
  run: async (bot: Client, message: Message) => {
    const allWords = await words.find({}).select('content');

    let listWords: any = [];

    allWords.forEach((word: any) => {
      listWords += `\`${word.content}\`\n`;
    });

    message.channel.send(
      new MessageEmbed() //
        .setTitle('📃 Blacklisted Words:')
        .setDescription(`Posts containing these words will be auto deleted.\n${listWords}`)
        .setFooter('All current blacklisted words.')
        .setColor('7289DA')
    );
  },
};
