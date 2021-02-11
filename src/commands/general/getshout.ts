import { Client, Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';

export = {
  config: {
    name: 'getshout',
    description: 'Get the current shout on the group.',
    accessableby: 'KICK_MEMBERS',
    aliases: ['currentshout'],
  },
  run: async (bot: Client, message: Message) => {
    const shout = await rbx.getShout(Number(process.env.GROUP));

    if (!message.member?.hasPermission('KICK_MEMBERS')) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle('🔐 Incorrect Permissions')
          .setDescription('**Command Name:** permexile\n**Permissions Needed:** <KICK_MEMBERS>')
          .setColor('#f94343')
          .setFooter('<> - Staff Perms ● Public Perms - [] ')
      );
    }

    const shoutEmbed = new MessageEmbed() //
      .setTitle('📢 Current Shout')
      .setColor('#7289DA');

    if (!shout.body) {
      shoutEmbed.setDescription('**There is no shout currently posted.**');
      shoutEmbed.setFooter('No shout posted');
    } else {
      shoutEmbed.setDescription(`**${shout.poster.username} posted a new shout on ${new Date(shout.updated).toLocaleDateString('en-gb', { year: 'numeric', month: 'long', day: 'numeric' })}.**\n\n__**Shout Content**__\n${shout.body}`);
      shoutEmbed.setFooter(`Poster Player ID: ${shout.poster.userId} `);
    }

    message.channel.send(shoutEmbed);
  },
};
