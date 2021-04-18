import { Client, Collection, MessageEmbed } from 'discord.js';
import { config } from 'dotenv';
import { exile, getRankInGroup, setRank } from 'noblox.js';

import timedata from './models/suspendTimes';
import Exile from './models/userExile';

config();

const bot: any = new Client({
	ws: { intents: ['GUILD_MESSAGES', 'GUILDS', 'GUILD_MESSAGE_REACTIONS'] },
	disableMentions: 'everyone',
});

bot.commands = new Collection();
bot.aliases = new Collection();

['commands', 'aliases'].forEach((collection: string): any => {
	bot[collection] = new Collection();
});
['loadCommands', 'loadEvents'].forEach((handlerFile: string): string => require(`./handlers/${handlerFile}.js`)(bot));

// --- Suspending and Exile checks
async function SuspendAndExile(): Promise<void> {
	const data = timedata.find({}).select('RobloxName RobloxID timestamp Role Duration');
	const user = Exile.find({}).select('RobloxUsername RobloxID Moderator Reason');
	let rank: number;

	// --- Suspending
	(await data).forEach(async (player) => {
		rank = await getRankInGroup(Number(process.env.GROUP), player.RobloxID);

		if (player.timestamp.getTime() + player.Duration > Date.now()) {
			if (rank !== 0 && rank !== 8) await setRank(Number(process.env.GROUP), player.RobloxID, 8).catch((): void => undefined);
		} else {
			// -- Reranking player and removing document ---
			bot.channels.cache.get(process.env.ADMIN_LOG).send(
				new MessageEmbed() //
					.setTitle(`✅ Suspension Expired!`)
					.setColor('#7289DA')
					.setDescription(`**${player.RobloxName}'s suspension has concluded.**`)
					.setFooter(`Suspended Player ID: ${player.RobloxID} `)
					.setTimestamp()
			);

			if (rank !== 0) await setRank(Number(process.env.GROUP), player.RobloxID, player.Role).catch((): void => undefined);

			await timedata.deleteOne({ RobloxID: player.RobloxID });
		}
	});

	// --- Exiling
	(await user).forEach(async (player: { RobloxID: any; RobloxUsername: String; Moderator: String; Reason: String }) => {
		if (rank !== 0) await exile(Number(process.env.GROUP), player.RobloxID).catch((): void => undefined);
	});
}

setInterval(SuspendAndExile, 7000);

bot.login(process.env.TESTING === 'true' ? process.env.DISCORD_TEST : process.env.DISCORD_PRODUCTION);
