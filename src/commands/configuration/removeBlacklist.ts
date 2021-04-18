import { Message, MessageEmbed } from 'discord.js';
import Word from '../../models/wordOrPhrase';

export = {
	config: {
		name: 'removeBlacklist',
		description: 'Remove a blacklisted word.',
		usage: '.removeBlacklist',
		accessableby: 'ADMINISTRATOR',
		aliases: ['removeword', 'deleteword', 'unlist', 'removeblacklist', 'unblacklist'],
	},
	run: async (bot: any, message: Message) => {
		if (!message.member!.hasPermission('ADMINISTRATOR')) {
			return message.channel.send(
				new MessageEmbed() //
					.setTitle('🔐 Incorrect Permissions')
					.setDescription('**Command Name:** removeBlacklist\n**Permissions Needed:** <ADMINISTRATOR>')
					.setColor('#f94343')
					.setFooter('<> - Staff Perms ● Public Perms - [] ')
			);
		}

		try {
			message.channel.send(
				new MessageEmbed()
					.setTitle('Prompt [1/1]') //
					.setDescription(`Hello **${message.author.username}**,\n\nPlease follow the instructions provided to remove a word.\n\n❓ **What is the word you would like to remove?**\n\nInput **cancel** to cancel the deletion prompt.`)
					.setFooter(`Setup by ${message.author.tag} | Prompt will timeout in 2 mins`, message.author.displayAvatarURL())
					.setColor('#7289DA')
					.setThumbnail(bot.user!.displayAvatarURL())
			);

			const collectingWord = await message.channel.awaitMessages((userMessage: any) => userMessage.author.id === message.author.id, { time: 120000, max: 1 });
			const wordContent: any = collectingWord.first()?.toString();

			if (collectingWord.first()!.content.toLowerCase() === 'cancel') {
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Deletion Cancelled!') //
						.setDescription(`The deletion has been cancelled successfully.`)
						.setFooter(`Setup by ${message.author.tag}`, message.author.displayAvatarURL())
						.setColor('#2ED85F')
				);
			}

			const foundWord = await Word.findOne({ content: wordContent });

			if (!foundWord) {
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('🔍 Unable to find word!')
						.setDescription(`Please provide a valid word/phrase to remove!`)
						.setColor('#f94343')
						.setFooter('Invalid word')
						.setTimestamp()
				);
			}

			const confirm = await message.channel.send(
				new MessageEmbed() //
					.setTitle('Are you sure?') //
					.setDescription(`Please confirm this final prompt to remove the word.\n\n❓ **Are the following fields correct for the deletion of the word?**\n\n• \`Word/Phrase\` - **${wordContent}**\n\nIf the fields above look correct you can unexile this user by reacting with a ✅ or cancel the unexile with ❌ if these fields don't look right.`)
					.setFooter(`Requested by ${message.author.tag} | Add reaction`, message.author.displayAvatarURL())
					.setColor('#f94343')
			);
			confirm.react('✅');
			confirm.react('❌');

			const collectingConfirmation = await confirm.awaitReactions((reaction: any, user: any) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 120000, max: 1, errors: ['time'] });
			const ConfirmationResult = collectingConfirmation.first()?.emoji.name;

			if (ConfirmationResult === '✅') {
				Word.deleteOne({ content: wordContent }).then(() => {
					message.channel.send(
						new MessageEmbed() //
							.setTitle('✅ Word Removed!')
							.setDescription(`The content: **${wordContent}** has been removed successfully!`)
							.setColor('#2ED85F')
							.setFooter('Success!')
					);
				});
			} else {
				return message.channel.send(
					new MessageEmbed() //
						.setTitle('✅ Deletion Cancelled!')
						.setDescription(`The deletion has been cancelled successfully.`)
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
