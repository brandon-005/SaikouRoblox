import { onAuditLog } from 'noblox.js';
import { MessageEmbed } from 'discord.js';

import Exile from '../../models/userExile';

export = async (bot: any) => {
	const auditLog = onAuditLog(Number(process.env.GROUP));

	auditLog.on('connect', (): void => {
		console.log('[EVENTS]: Listening for new audit logs!');
	});

	auditLog.on('error', (): void => undefined);

	auditLog.on('data', async (data) => {
		if (data.actionType === 'Change Rank') {
			if (data.actor.user.username === 'SaikouGroup' || data.actor.user.username === 'briitishhh') return;
			bot.channels.cache.get(process.env.ADMIN_LOG).send(
				new MessageEmbed() //
					.setTitle(`:warning: Updated Role!`)
					.setColor('#FFD62F')
					.setDescription(`**${Object.values(data.description)[3]}'s role was updated by ${data.actor.user.username}**`)
					.addField('Old Role:', Object.values(data.description)[4])
					.addField('New Role:', Object.values(data.description)[5])
					.setFooter(`Updated User ID: ${Object.values(data.description)[0]} `)
					.setTimestamp()
			);
		}

		if (data.actionType === 'Remove Member') {
			const user = await Exile.findOne({ RobloxUsername: Object.values(data.description)[1] });
			if (user) {
				bot.channels.cache.get(process.env.ADMIN_LOG).send(
					new MessageEmbed() //
						.setTitle(`:warning: Automatic Exile!`)
						.setColor('#FFD62F')
						.setDescription(`**${Object.values(data.description)[1]} was exiled automatically by ${data.actor.user.username}**`)
						.addField('Exile Giver:', `${user.Moderator}`)
						.addField('Exile Reason:', `${user.Reason}`)
						.setFooter(`Exiled User ID: ${Object.values(data.description)[0]} `)
						.setTimestamp()
				);
			} else {
				bot.channels.cache.get(process.env.ADMIN_LOG).send(
					new MessageEmbed() //
						.setTitle(`:warning: Exiled User!`)
						.setColor('#FFD62F')
						.setDescription(`**${Object.values(data.description)[1]}'s was exiled by ${data.actor.user.username}**`)
						.setFooter(`Exiled User ID: ${Object.values(data.description)[0]} `)
						.setTimestamp()
				);
			}
		}
	});
};
