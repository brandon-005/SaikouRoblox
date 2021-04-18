import { setCookie, getCurrentUser } from 'noblox.js';

import mongoDatabase from '../database/connectDatabase';
import wallPosts from '../roblox/onWallPost';
import auditLog from '../roblox/onAuditLog';

export = async (bot: any) => {
	console.log(`\n[DISCORD_BOT]: ${bot.user!.username} has loaded successfully and is online.`);

	const statuses: Array<string> = [`🎮 Bloxxing Players`, `✨ .rbxhelp`];

	setInterval((): void => {
		bot.user!.setActivity(statuses[Math.floor(Math.random() * statuses.length)], {
			type: 'STREAMING',
			url: 'https://www.twitch.tv/doingthisforthestatuslol',
		});
	}, 15000);

	// -- Login to MongoDB database
	await mongoDatabase().then((): void => console.log(`[MONGO_DATABASE]: Connected to MongoDB successfully.`));

	// -- Login to Roblox bot
	await setCookie(String(process.env.ROBLOX_TESTING === 'true' ? process.env.ROBLOX_TEST : process.env.ROBLOX_PRODUCTION))
		.then(
			async (): Promise<void> => {
				console.log(`[ROBLOX_BOT]: Logged into the ${(await getCurrentUser()).UserName} account.`);
			}
		)
		.catch((err: Error) => bot.channels.cache.get(process.env.GEN_STAFF).send(`Hello there!\n\nIt appears I'm currently experiencing issues logging into the **Roblox Account** at the moment. Due to this, I won't be able to run any of your commands, and my features will be non-functional. <:mascotsad:658685980273803274>\n\nHowever don't fret, in the meantime, I'll be automatically restarting at random intervals with the hope of logging in successfully. You may see me head offline too, this is intended, don't worry! I'll be back up and running soon!\n\n\`\`\`\nCaught Error:\n\n${err.message}\`\`\``));

	// -- Events
	await wallPosts(bot);
	await auditLog(bot);
};
