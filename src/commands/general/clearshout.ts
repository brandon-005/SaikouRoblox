import { Client, Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';

export = {
  config: {
    name: 'clearshout',
    description: 'Clears a Roblox shout',
    usage: '.clearshout',
    accessableby: 'KICK_MEMBERS',
    aliases: ['removeshout'],
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

    if (!shout.body) {
      return message.channel.send(
        new MessageEmbed() //
          .setTitle(`❌ Unable to clear shout!`)
          .setDescription(`There is no shout to clear.`)
          .setColor('#f94343')
          .setFooter(`Unable to clear shout.`)
      );
    }

    const confirm = await message.channel.send(
      new MessageEmbed() //
        .setTitle('Are you sure?') //
        .setDescription(`Please confirm this final prompt to sclear the shout.\n\n❓ **Are the following fields correct for the shout clear?**\n\n• \`Shout\` - **${shout.body}**\n\nIf the fields above look correct you can clear the shout by reacting with a ✅ or cancel the shout clear with ❌ if these fields don't look right.`)
        .setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
        .setColor('#f94343')
    );
    confirm.react('✅');
    confirm.react('❌');

    const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
    const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

    if (ConfirmationResult === '✅') {
      return rbx.shout(Number(process.env.GROUP), '').then(() => {
        message.channel.send(
          new MessageEmbed() //
            .setTitle('✅ Shout Cleared!')
            .setDescription(`The shout has been cleared successfully.`)
            .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('#2ED85F')
        );
      });
    }

    return message.channel.send(
      new MessageEmbed() //
        .setTitle('✅ Clear Cancelled!')
        .setDescription(`The clear has been cancelled successfully.`)
        .setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
        .setColor('#2ED85F')
    );
  },
};
