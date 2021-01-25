import { Client, Message, MessageEmbed } from 'discord.js';

export = {
  config: {
    name: 'robloxHelp',
    description: 'Help',
    usage: '.robloxHelp',
    accessableby: 'MANAGE_MESSAGES',
    aliases: ['rbxhelp', 'robloxhelp'],
  },
  run: async (bot: Client, message: Message) => {
    if (!message.member!.hasPermission('MANAGE_MESSAGES')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** robloxHelp\n**Permissions Needed:** <MANAGE_MESSAGES>')
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
        .addField('General - 2', '`shout`, `rankup`')
        .addField('Moderation - 3', '`suspend`, `permexile` `unexile`')
        .setFooter("Keep up your hard work, it's much appreciated!")
    );
  },
};
