import axios from 'axios';
import { Message, MessageEmbed } from 'discord.js';
import { getRankInGroup, getIdFromUsername, getPlayerThumbnail } from 'noblox.js';

export = {
	config: {
		name: 'robloxban',
		description: 'Permanently ban a Roblox user.',
		usage: '.robloxban',
		accessableby: 'KICK_MEMBERS',
		aliases: ['rbxban'],
	},
	run: async (bot: any, message: Message) => {
		let modName = message.guild!.member(message.author)?.nickname;
		let errorMsg;

		if (modName === null) modName = message.author.username;

		if (!message.member!.hasPermission('KICK_MEMBERS')) {
			return message.channel.send(
				new MessageEmbed() //
					.setTitle('🔐 Incorrect Permissions')
					.setDescription('**Command Name:** robloxban\n**Permissions Needed:** <KICK_MEMBERS>')
					.setColor('#f94343')
					.setFooter('<> - Staff Perms ● Public Perms - [] ')
			);
		}

		function cancel(msg: any) {
			if (msg.content.toLowerCase() === 'cancel')
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Ban Cancelled!') //
						.setDescription(`The ban has been cancelled successfully.`)
						.setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
						.setColor('#2ED85F')
				);
		}

		message.channel.send(
			new MessageEmbed()
				.setTitle('Prompt [1/2]') //
				.setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to permanently ban a user.\n\n❓ **What is the Roblox username of the person you would like to permanently ban?**\n\nInput **cancel** to cancel the ban prompt.`)
				.setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
				.setColor('#7289DA')
				.setThumbnail(bot.user!.displayAvatarURL())
		);

		const collectingRobloxName = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
		let RobloxName: any = collectingRobloxName.first()?.toString();

		if (cancel(collectingRobloxName.first())) return;

		if (RobloxName.startsWith('<@') || RobloxName.startsWith('<@!')) {
			RobloxName = message.guild!.member(RobloxName.replace(/[\\<>@#&!]/g, ''))?.nickname;
		}

		let RobloxID;
		try {
			RobloxID = await getIdFromUsername(RobloxName);
		} catch (e) {
			return message.channel.send(
				new MessageEmbed() //
					.setTitle('🔍 Unable to find Roblox user!')
					.setDescription(`Please provide a valid Roblox username to **permexile**!`)
					.setColor('#f94343')
					.setFooter('Ensure the capitalisation is correct!')
					.setTimestamp()
			);
		}

		let banned;
		axios({
			url: `https://bans.saikouapi.xyz/v1/users/${RobloxID}/banned`,
			method: 'GET',
			headers: {
				token: process.env.API_TOKEN,
			},
		}).then((res) => {
			if (res.data.banned === true) banned = true;
		});

		if ((await getRankInGroup(Number(process.env.GROUP), RobloxID)) >= 20) {
			return message.channel.send(
				new MessageEmbed() //
					.setTitle(`❌ Unable to ban user!`)
					.setDescription(`The player you are trying to perform this action on cannot be banned.`)
					.setColor('#f94343')
					.setFooter(`Unable to exile user.`)
			);
		}

		if (banned === true) {
			return message.channel.send(
				new MessageEmbed() //
					.setTitle(`🚫 Already Banned!`)
					.setDescription(`The user you are trying to perform this action on is already banned.`)
					.setColor('#f94343')
					.setFooter(`Unable to ban user.`)
			);
		}

		try {
			message.channel.send(
				new MessageEmbed()
					.setTitle('Prompt [2/2]') //
					.setDescription(`Please follow the instructions provided to permanently ban a user.\n\n❓ **What is the reason for banning this user?**\n\nInput **cancel** to cancel the ban prompt.`)
					.setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
					.setColor('#7289DA')
					.setThumbnail(bot.user!.displayAvatarURL())
			);

			const collectingReason = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
			const Reason = collectingReason.first();

			if (cancel(collectingReason.first())) return;

			const confirm = await message.channel.send(
				new MessageEmbed() //
					.setTitle('Are you sure?') //
					.setDescription(`Please confirm this final prompt to permanently ban the user.\n\n❓ **Are the following fields correct for the ban?**\n\n• \`Roblox Player\` - **[${RobloxName}](https://www.roblox.com/users/${RobloxID}/profile)**\n• \`Reason\` - **${Reason}**\n\nIf the fields above look correct you can ban this user by reacting with a ✅ or cancel the ban with ❌ if these fields don't look right.`)
					.setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
					.setColor('#f94343')
			);
			confirm.react('✅');
			confirm.react('❌');

			const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
			const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

			if (ConfirmationResult === '✅') {
				await axios({
					url: `https://bans.saikouapi.xyz/v1/bans/create-new`,
					method: 'POST',
					data: {
						RobloxUsername: RobloxName,
						RobloxID,
						Moderator: modName,
						Reason: Reason!.content,
					},
					headers: {
						"X-API-KEY": process.env.API_TOKEN,
					},
				}).then((res) => console.log(res.data))
				.catch((err) => {
					if (err.response.data.errorCode) errorMsg = err.response.data.message;
				});
				
				if (errorMsg) return message.channel.send(`${errorMsg}`);

				const robloxAvatar = await getPlayerThumbnail(RobloxID, 250, 'png', false);

				await bot.channels.cache.get(process.env.MODERATION).send(
					new MessageEmbed() //
						.setAuthor(`MWT | Permanent Ban`, `${Object.values(robloxAvatar)[0].imageUrl}`)
						.addField('User:', `[${RobloxName}](https://www.roblox.com/users/${RobloxID}/profile)`, true)
						.addField('Moderator:', modName, true)
						.addField('Reason:', Reason!.content)
						.setThumbnail('https://t7.rbxcdn.com/da559f4079c9173b45639f278d683846')
						.setColor('#2ED85F')
						.setFooter('MWT • Permanent Ban')
						.setTimestamp()
				);
			} else
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Roblox Ban Cancelled!')
						.setDescription(`The ban has been cancelled successfully.`)
						.setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
						.setColor('#2ED85F')
				);
		} catch (e) {
			console.error(e);
			return message.channel.send(
				new MessageEmbed() //
					.setTitle('⏱ Out of time!')
					.setDescription('You ran out of time to input the prompt answer!')
					.setColor('#f94343')
			);
		}
	},
};
