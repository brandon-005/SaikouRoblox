import { Client, Message, MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';
import suspendData from '../../models/suspendTimes';

export = {
	config: {
		name: 'unsuspend',
		description: 'Unsuspend a player who is currently suspended.',
		aliases: ['removesuspension'],
		accessableby: 'KICK_MEMBERS',
	},
	run: async (bot: Client, message: Message) => {
		if (!message.member!.hasPermission('KICK_MEMBERS')) {
			return message.channel.send(
				new MessageEmbed() //
					.setTitle('🔐 Incorrect Permissions')
					.setDescription('**Command Name:** unsuspend\n**Permissions Needed:** <KICK_MEMBERS>')
					.setColor('#f94343')
					.setFooter('<> - Staff Perms ● Public Perms - [] ')
			);
		}

		try {
			message.channel.send(
				new MessageEmbed()
					.setTitle('Prompt [1/1]') //
					.setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to remove a suspended player.\n\n❓ **What is the Roblox username of the person you would like to remove from the suspension?**\n\nInput **cancel** to cancel the unsuspend prompt.`)
					.setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
					.setColor('#7289DA')
					.setThumbnail(bot.user!.displayAvatarURL())
			);

			const collectingRobloxName: any = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
			const RobloxName: string = collectingRobloxName.first()?.toString();

			if (collectingRobloxName.first()!.content.toLowerCase() === 'cancel') {
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Unsuspend Cancelled!') //
						.setDescription(`The unsuspend has been cancelled successfully.`)
						.setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
						.setColor('#2ED85F')
						.setThumbnail(bot.user!.displayAvatarURL())
				);
			}

			const player = await suspendData.findOne({ RobloxName: new RegExp(RobloxName, 'i') });

			if (!player) {
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('🔍 Unable to find Roblox Player!')
						.setDescription(`Please provide a valid player to **unsuspend**!`)
						.setColor('#f94343')
						.setFooter('Ensure the spelling is correct!')
						.setTimestamp()
				);
			}

			const confirm = await message.channel.send(
				new MessageEmbed() //
					.setTitle('Are you sure?') //
					.setDescription(`Please confirm this final prompt to unsuspend the user.\n\n❓ **Are the following fields correct for the unsuspension?**\n\n• \`Roblox Player\` - **[${RobloxName}](https://www.roblox.com/users/${player.RobloxID}/profile)**\n\nIf the fields above look correct you can unsuspend this user by reacting with a ✅ or cancel the unsuspend with ❌ if these fields don't look right.`)
					.setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
					.setColor('#f94343')
			);
			confirm.react('✅');
			confirm.react('❌');

			const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
			const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

			if (ConfirmationResult === '✅') {
				try {
					rbx.setRank(Number(process.env.GROUP), player.RobloxID, player.Role);
				} catch (err) {
					console.error(err);
					return;
				}

				suspendData.deleteOne({ RobloxName: new RegExp(RobloxName, 'i') }).then(() => {
					message.channel.send(
						new MessageEmbed() //
							.setTitle('✅ Player Removed!')
							.setDescription(`**${RobloxName}** has been removed from the suspension.`)
							.setColor('#2ED85F')
							.setFooter('Success!')
					);
				});
			} else {
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Unsuspend Cancelled!')
						.setDescription(`The unsuspend has been cancelled successfully.`)
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
