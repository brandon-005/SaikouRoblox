import { Client, Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';

export = {
	config: {
		name: 'shout',
		description: 'Roblox Shout',
		usage: '.prefix <prefix>',
		accessableby: 'KICK_MEMBERS',
		aliases: ['announce'],
	},
	run: async (bot: Client, message: Message) => {
		if (!message.member!.hasPermission('KICK_MEMBERS')) {
			return message.channel.send(
				new MessageEmbed() //
					.setTitle('🔐 Incorrect Permissions')
					.setDescription('**Command Name:** shout\n**Permissions Needed:** <KICK_MEMBERS>')
					.setColor('#f94343')
					.setFooter('<> - Staff Perms ● Public Perms - [] ')
			);
		}

		try {
			message.channel.send(
				new MessageEmbed()
					.setTitle('Prompt [1/1]') //
					.setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to post a new shout.\n\n❓ **What message would you like to shout?**\n\nInput **cancel** to cancel the shout setup.`)
					.setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
					.setColor('#7289DA')
					.setThumbnail(bot.user!.displayAvatarURL())
			);

			const collectingShoutMsg = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
			const ShoutMessage = collectingShoutMsg.first();

			if (ShoutMessage!.content.toLowerCase() === 'cancel')
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Shout Cancelled!')
						.setDescription(`The shout has been cancelled successfully.`)
						.setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
						.setColor('#2ED85F')
				);

			if (ShoutMessage!.content.length >= 255) {
				return message.channel.send(
					new MessageEmbed() //
						.setTitle(`❌ Unable to post shout!`)
						.setDescription(`Your shout went over the character limit of \`255\` characters.`)
						.setColor('#f94343')
						.setFooter(`Please try again, cut down on the characters!`)
				);
			}

			let previousShout = (await rbx.getShout(Number(process.env.GROUP))).body;

			if (ShoutMessage!.content === previousShout) {
				return message.channel.send(
					new MessageEmbed() //
						.setTitle(`❌ Unable to post shout!`)
						.setDescription(`The shout content is the same as the current posted shout.`)
						.setColor('#f94343')
						.setFooter(`Same shout`)
				);
			}

			if (!previousShout) {
				previousShout = 'No shout currently posted.';
			}

			const confirm = await message.channel.send(
				new MessageEmbed() //
					.setTitle('Are you sure?') //
					.setDescription(`Please confirm this final prompt to post the shout.\n\n❓ **Are the following fields correct for the shout?**\n\n• \`Shout Message\` - **${ShoutMessage}**\n\nThis shout will replace the following shout posted: \n**${previousShout}**\n\nIf the fields above look correct you can post this shout by reacting with a ✅ or cancel the post with ❌ if these fields don't look right.`)
					.setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
					.setColor('#f94343')
			);
			confirm.react('✅');
			confirm.react('❌');

			const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
			const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

			if (ConfirmationResult === '✅') {
				rbx.shout(Number(process.env.GROUP), `${ShoutMessage}`);

				message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Success!')
						.setDescription(`You successfully posted the shout:\n**${ShoutMessage}**`)
						.setFooter('Successful Shout')
						.setTimestamp()
						.setColor('#2ED85F')
				);
			} else
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Shout Cancelled!')
						.setDescription(`The shout has been cancelled successfully.`)
						.setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
						.setColor('#2ED85F')
				);
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
