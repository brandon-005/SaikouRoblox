import { Client, Message, MessageEmbed } from 'discord.js';

export = {
  config: {
    name: 'robloxHelp',
    description: 'Help',
    usage: '.robloxHelp',
    accessableby: 'KICK_MEMBERS',
    aliases: ['rbxhelp', 'robloxhelp'],
  },
  run: async (bot: Client, message: Message) => {
    if (!message.member!.hasPermission('KICK_MEMBERS')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** robloxHelp\n**Permissions Needed:** <KICK_MEMBERS>')
          .setColor('#f94343')
          .setFooter('<> - Staff Perms ● Public Perms - [] ')
      );
    }

    message.channel.send(
      new MessageEmbed()
        .setColor('#7289DA')
        .setTitle('📖 SaikouRoblox Documentation')
        .setDescription(
          `The prefix for SaikouRoblox is \`.\`
			Throwback to SaikouBot v1, entering the nostalgia zone`
        )
        .addField('General - 1', '`shout`, `rankup`')
        .addField('Moderation - 2', '`suspend`, `permexile`')
        .setFooter("Keep up your hard work, it's much appreciated!")
    );
  },
};
