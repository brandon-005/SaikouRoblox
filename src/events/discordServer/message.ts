import { Message, MessageEmbed } from 'discord.js';
import moment from 'moment';

export = async (bot: any, message: Message) => {
	if (message.content.toLowerCase().includes('web.roblox.com')) {
		if (message.member?.hasPermission('MANAGE_MESSAGES')) return;

		await message.author
			.send(
				new MessageEmbed() //
					.setTitle('Under 13 Account!')
					.setDescription('You have received a **Kick** in Saikou due to your account being flagged as under 13. You may rejoin again when you are 13 or older.')
					.addField('Kicked By', 'Saikou')
					.addField('Reason', "Your account has been flagged as being under 13 automatically by SaikouRoblox. Due to this, you have been removed from our server to be inline with Discord's terms of service which prevents users under 13 from accessing their platform.")
					.setColor('#f94343')
					.setFooter('THIS IS AN AUTOMATED MESSAGE')
					.setTimestamp()
			)
			.catch(() => undefined);

		message.member?.kick('User posted "web.roblox.com" which is associated with a <13 account');

		console.log(`**${moment(message.createdTimestamp).format('MMMM Do YYYY, h:mm a')} | ${message.member?.user.username}**\nContent: ${message.content}`);

		bot.channels.cache
			.get(process.env.MODERATION)
			.send(
				new MessageEmbed() //
					.setAuthor('Saikou Discord | Server Kick', message.member!.user.displayAvatarURL())
					.addField('User:', message.member?.user.username, true)
					.addField('Moderator:', 'Saikou', true)
					.addField('Reason:', 'Account has been flagged as being under 13 due to posting the "web.roblox.com" link.')
					.setThumbnail(message.member!.user.displayAvatarURL())
					.setColor('#2ED85F')
					.setFooter('Server Kick')
					.setTimestamp()
			)
			.then(() => bot.channels.cache.get(process.env.MODERATION).send(`**${moment(message.createdTimestamp).format('MMMM Do YYYY, h:mm a')} | ${message.author.username}**\nContent: ${message.content}`));
	}
};
