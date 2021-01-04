import { Client, Message } from 'discord.js';
import rbx from 'noblox.js';

export = {
  config: {
    name: 'shout',
    description: 'Roblox Shout',
    usage: '.prefix <prefix>',
    accessableby: 'MANAGE_MESSAGES',
    aliases: ['announce'],
  },
  run: async (bot: Client, message: Message, args: string[]) => {
    const Shout = args.join(' ');

    if (!message.member!.hasPermission('MANAGE_MESSAGES')) {
      return message.channel.send('No permission to run this command.');
    }

    if (!Shout) {
      return message.channel.send('You must input a message to shout.');
    }

    rbx.shout(5447155, Shout);

    message.channel.send('Shout posted.');
  },
};
