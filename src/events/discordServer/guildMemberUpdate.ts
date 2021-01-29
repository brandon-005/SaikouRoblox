import { MessageEmbed } from 'discord.js';
import rbx from 'noblox.js';

export = async (bot: any, oldMember: any, newMember: any) => {
  const guild = bot.guilds.cache.get(process.env.GUILD);
  console.log(guild.members.fetch());

  const allUserRoles: string[] = [];
  let discordRole;
  const RobloxName = newMember.nickname;
  let RobloxID;

  console.log(RobloxName);

  if (!newMember.nickname) return;

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
    return;
  }

  if (allUserRoles.includes('Staff')) return;

  const logEmbed = new MessageEmbed() //
    .setTitle(`:warning: Automatic Rankup!`)
    .setColor('#FFD62F')
    .setDescription(`**${RobloxName} was ranked up automatically by SaikouGroup**`)
    .setFooter(`Ranked Player ID: ${RobloxID}`)
    .setTimestamp();

  if (discordRole === 'Dedicated Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Dedicated Follower').then(() => {
        logEmbed.addField('Ranked To:', 'Dedicated Follower');
        logEmbed.addField('Rankup Reason:', 'User hit the "Dedicated Follower" role in Discord.');
      });
    } catch (err) {
      return;
    }
  } else if (discordRole === 'Ultimate Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Ultimate Follower').then(() => {
        logEmbed.addField('Ranked To:', 'Ultimate Follower');
        logEmbed.addField('Rankup Reason:', 'User hit the "Ultimate Follower" role in Discord.');
      });
    } catch (err) {
      return;
    }
  } else if (discordRole === 'Supreme Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Supreme Follower').then(() => {
        logEmbed.addField('Ranked To:', 'Supreme Follower');
        logEmbed.addField('Rankup Reason:', 'User hit the "Supreme Follower" role in Discord.');
      });
    } catch (err) {
      return;
    }
  } else if (discordRole === 'Legendary Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Legendary Follower').then(() => {
        logEmbed.addField('Ranked To:', 'Legendary Follower');
        logEmbed.addField('Rankup Reason:', 'User hit the "Legendary Follower" role in Discord.');
      });
    } catch (err) {
      return;
    }
  } else if (discordRole === 'Omega Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Omega Follower').then(() => {
        logEmbed.addField('Ranked To:', 'Omega Follower');
        logEmbed.addField('Rankup Reason:', 'User hit the "Omega Follower" role in Discord.');
      });
    } catch (err) {
      return;
    }
  } else return;

  bot.channels.cache.get(process.env.ADMIN_LOG).send(logEmbed);
};
