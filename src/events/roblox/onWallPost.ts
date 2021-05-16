/* eslint-disable no-await-in-loop */
import { MessageEmbed } from 'discord.js';
import { deleteWallPost, getRankInGroup, getWall, WallPost } from 'noblox.js';

import blacklistedWords from '../../models/wordOrPhrase';

export = async (bot: any) => {
	setInterval(async () => {
		await getWall(Number(process.env.GROUP), 'Desc', 10).then((allPosts) => {
			allPosts.data.forEach(async (post: WallPost) => {
				// -- Deleting content that is just hashtags/one letter spam
				if (/^(.)\1+$/.test(post.body.replace(/\s+/g, '')) === true) {
					try {
						return await deleteWallPost(Number(process.env.GROUP), post.id);
					} catch (err) {
						return;
					}
				}

				for (const word of await blacklistedWords.find({}, '-__v -_id').lean()) {
					if (post.body.toLowerCase().includes(word.content.toLowerCase())) {
						const robloxName: string = Object.values(post.poster)[0].username;
						const robloxID: number = Object.values(post.poster)[0].userId;

						// -- If Staff
						if ((await getRankInGroup(Number(process.env.GROUP), robloxID)) >= 20) return;

						if (word.Warnable) {
							deleteWallPost(Number(process.env.GROUP), post.id).catch((): void => undefined);
							return bot.channels.cache.get(process.env.ADMIN_LOG).send(
								new MessageEmbed() //
									.setTitle(':warning: Post Deleted!')
									.setColor('#FFD62F')
									.setDescription(`**${robloxName}'s post was deleted automatically by SaikouGroup**`)
									.addField('Deleted Message:', post.body)
									.addField('Deleted Reason:', `Post included the word/phrase **${word.content.toLowerCase()}** which is blacklisted.`)
									.setFooter(`Deleted Post Player ID: ${robloxID}`)
									.setTimestamp()
							);
						}
						return deleteWallPost(Number(process.env.GROUP), post.id).catch((): void => undefined);
					}
				}
			});
		});
	}, 60000);
};
