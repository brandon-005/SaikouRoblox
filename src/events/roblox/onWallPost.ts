/* eslint-disable no-await-in-loop */
import { MessageEmbed } from 'discord.js';
import { deleteWallPost, onWallPost, getRankNameInGroup, getGeneralToken } from 'noblox.js';
import axios from 'axios';

import blacklistedWords from '../../models/wordOrPhrase';
import postDeletions from '../../models/deletions';
import timedata from '../../models/suspendTimes';
import Exile from '../../models/userExile';
import { DeletionTypes } from '../../types/schemas';

export = async (bot: any) => {
	const wallPost = onWallPost(Number(process.env.GROUP));

	wallPost.on('connect', (): void => {
		console.log('[EVENTS]: Listening for new wall posts!');
	});

	wallPost.on('error', (): void => undefined);

	wallPost.on('data', async (post) => {
		for (const word of await blacklistedWords.find({}).select('content Warnable').lean()) {
			if (post.body.toLowerCase().includes(word.content.toLowerCase())) {
				if (word.Warnable === true) {
					const robloxName: string = Object.values(post.poster)[0].username;
					const robloxID: number = Object.values(post.poster)[0].userId;

					const log = new MessageEmbed() //
						.setTitle(`:warning: Post deleted!`)
						.setColor('#FFD62F')
						.setDescription(`**${robloxName}'s post was deleted automatically by SaikouGroup**`)
						.addField('Deleted Message:', post.body)
						.addField('Deletion Reason:', `Post included the word/phrase **${word.content.toLowerCase()}** which is blacklisted.`)
						.setFooter(`Deleted Post Player ID: ${robloxID} `)
						.setTimestamp();

					const suspension = new MessageEmbed() //
						.setTitle(`:warning: Automatic Suspension!`)
						.setColor('#FFD62F')
						.setDescription(`**${robloxName}'s was suspended automatically by SaikouGroup**`)
						.addField('Deleted Message:', post.body)
						.setFooter(`Suspended Player ID: ${robloxID} `)
						.setTimestamp();

					const creation = {
						RobloxName: robloxName,
						RobloxID: robloxID,
						timestamp: new Date(),
						Role: await getRankNameInGroup(Number(process.env.GROUP), robloxID),
						Moderator: 'SaikouGroup',
					};

					await postDeletions.findOne({ RobloxName: robloxName }, async (err: Error, postDeleted: DeletionTypes) => {
						if (err) return console.error(err);

						if (!postDeleted) {
							const newData = await postDeletions.create({ RobloxName: robloxName, RobloxID: robloxID, Triggers: 1 });
							await newData.save();

							return bot.channels.cache.get(process.env.ADMIN_LOG).send(log);
						}

						// eslint-disable-next-line no-param-reassign
						postDeleted.Triggers += 1;
						await postDeleted.save();

						switch (postDeleted.Triggers) {
							case 3:
								Object.assign(creation, { Duration: 259200000, Reason: '**[Automated]** Player posted 3 blacklisted posts.' });
								(await timedata.create(creation)).save();

								suspension.addField('Suspension Duration:', '3 days');
								suspension.addField('Suspension Reason:', 'Player posted 3 blacklisted posts.');

								bot.channels.cache.get(process.env.ADMIN_LOG).send(suspension);
								break;

							case 5:
								Object.assign(creation, { Duration: 604800000, Reason: '**[Automated]** Player posted 5 blacklisted posts.' });
								(await timedata.create(creation)).save();

								suspension.addField('Suspension Duration:', '7 days');
								suspension.addField('Suspension Reason:', 'Player posted 5 blacklisted posts.');

								bot.channels.cache.get(process.env.ADMIN_LOG).send(suspension);
								break;

							case 7:
								(
									await Exile.create({
										Moderator: 'SaikouGroup',
										Reason: '**[Automated]** Player posted 7 blacklisted posts before/after suspensions.',
										RobloxUsername: robloxName,
										RobloxID: robloxID,
									})
								).save();

								await axios({
									url: `https://groups.roblox.com/v1/groups/${process.env.GROUP}/wall/users/${robloxID}/posts`,
									method: 'DELETE',
									headers: {
										'Content-Type': 'application/json',
										'X-CSRF-TOKEN': await getGeneralToken(),
										Cookie: `.ROBLOSECURITY=${process.env.ROBLOX_TESTING === 'true' ? process.env.ROBLOX_TEST : process.env.ROBLOX_PRODUCTION}`,
									},
								});
								bot.channels.cache.get(process.env.ADMIN_LOG).send(log);
								break;

							default:
								bot.channels.cache.get(process.env.ADMIN_LOG).send(log);
						}
					});
				}
				return deleteWallPost(Number(process.env.GROUP), post.id).catch(() => undefined);
			}
		}
	});
};
