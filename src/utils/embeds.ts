import { Message, MessageEmbed } from 'discord.js';
import colours from './colours.json';

export = {
  confirmation(message: Message, action: string, actionName: string, fields: string) {
    const embed = new MessageEmbed() //
      .setTitle('Are you sure?') //
      .setDescription(`Please confirm this final prompt to ${action}.\n\n❓ **Are the following fields correct for the ${actionName}?**\n\n${fields}`)
      .setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
      .setColor(colours.red);

    message.channel.send(embed);
  },
};
