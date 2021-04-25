import { MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';

export = async (bot: any, oldMember: any, newMember: any) => {
	const allUserRoles: string[] = [];
	let discordRole;
	let RobloxName = newMember.nickname;
	let RobloxID;

	if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
		newMember.roles.cache.forEach((role: any) => {
			allUserRoles.push(role.name);
			if (!oldMember.roles.cache.has(role.id)) {
				discordRole = role.name;
			}
		});
	}

	if (!discordRole) return;

	try {
		RobloxID = await rbx.getIdFromUsername(RobloxName);
	} catch (err) {
		try {
			RobloxName = newMember.user.username;
			RobloxID = await rbx.getIdFromUsername(RobloxName);
		} catch (error) {
			return;
		}
	}

	if (allUserRoles.includes('Staff')) return;
	if (discordRole === (await rbx.getRankNameInGroup(Number(process.env.GROUP), RobloxID))) return;

	const logEmbed = new MessageEmbed() //
		.setTitle(`:warning: Automatic Rankup!`)
		.setColor('#FFD62F')
		.setDescription(`**${RobloxName} was ranked up automatically by SaikouGroup**`)
		.setFooter(`Ranked Player ID: ${RobloxID}`)
		.setTimestamp();

	switch (discordRole) {
		case 'Dedicated Follower':
			await rbx
				.setRank(Number(process.env.GROUP), RobloxID, 'Dedicated Follower')
				.then(() => {
					logEmbed.addField('Ranked To:', 'Dedicated Follower');
					logEmbed.addField('Rankup Reason:', 'User hit the "Dedicated Follower" role in Discord.');
				})
				.catch(() => undefined);
			break;

		case 'Ultimate Follower':
			await rbx
				.setRank(Number(process.env.GROUP), RobloxID, 'Ultimate Follower')
				.then(() => {
					logEmbed.addField('Ranked To:', 'Ultimate Follower');
					logEmbed.addField('Rankup Reason:', 'User hit the "Ultimate Follower" role in Discord.');
				})
				.catch(() => undefined);
			break;

		case 'Supreme Follower':
			await rbx
				.setRank(Number(process.env.GROUP), RobloxID, 'Supreme Follower')
				.then(() => {
					logEmbed.addField('Ranked To:', 'Supreme Follower');
					logEmbed.addField('Rankup Reason:', 'User hit the "Supreme Follower" role in Discord.');
				})
				.catch(() => undefined);
			break;

		case 'Legendary Follower':
			await rbx
				.setRank(Number(process.env.GROUP), RobloxID, 'Legendary Follower')
				.then(() => {
					logEmbed.addField('Ranked To:', 'Legendary Follower');
					logEmbed.addField('Rankup Reason:', 'User hit the "Legendary Follower" role in Discord.');
				})
				.catch(() => undefined);
			break;

		case 'Omega Follower':
			await rbx
				.setRank(Number(process.env.GROUP), RobloxID, 'Omega Follower')
				.then(() => {
					logEmbed.addField('Ranked To:', 'Omega Follower');
					logEmbed.addField('Rankup Reason:', 'User hit the "Omega Follower" role in Discord.');
				})
				.catch(() => undefined);
			break;

		default:
			return;
	}

	bot.channels.cache.get(process.env.ADMIN_LOG).send(logEmbed);
};
