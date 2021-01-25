import rbx from 'noblox.js';

export = async (_bot: any, oldMember: any, newMember: any) => {
  console.log(oldMember.roles.cache.size);
  console.log('Nickname:', newMember.nickname);
  console.log('UserID:', newMember.user.id);

  const oldRolesSize = oldMember.roles.cache.size;
  const newRolesSize = newMember.roles.cache.size;
  const allUserRoles: string[] = [];
  let discordRole;
  let RobloxID;

  if (!newMember.nickname) return;

  if (oldRolesSize !== newRolesSize) {
    newMember.roles.cache.forEach((role: any) => {
      if (!oldMember.roles.cache.has(role.id)) {
        discordRole = role.name;
      }
    });
  }

  if (oldRolesSize !== newRolesSize) {
    newMember.roles.cache.forEach((role: any) => {
      allUserRoles.push(role.name);
    });
  }

  if (!discordRole) return;

  console.log(`Name: ${newMember.nickname}\nRole: ${discordRole}`);

  try {
    RobloxID = await rbx.getIdFromUsername(`${newMember.nickname}`);
  } catch (err) {
    return;
  }

  console.log(RobloxID);

  if (allUserRoles.includes('Staff')) return;

  if (discordRole === 'Dedicated Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Dedicated Follower').then(() => {
        console.log(`Ranked up ${newMember.nickname} to "Dedicated Follower."`);
      });
    } catch (err) {
      return;
    }
  }

  if (discordRole === 'Ultimate Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Ultimate Follower').then(() => {
        console.log(`Ranked up ${newMember.nickname} to "Ultimate Follower."`);
      });
    } catch (err) {
      return;
    }
  }

  if (discordRole === 'Supreme Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Supreme Follower').then(() => {
        console.log(`Ranked up ${newMember.nickname} to "Supreme Follower."`);
      });
    } catch (err) {
      return;
    }
  }

  if (discordRole === 'Legendary Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Legendary Follower').then(() => {
        console.log(`Ranked up ${newMember.nickname} to "Legendary Follower."`);
      });
    } catch (err) {
      return;
    }
  }

  if (discordRole === 'Omega Follower') {
    try {
      await rbx.setRank(Number(process.env.GROUP), RobloxID, 'Omega Follower').then(() => {
        console.log(`Ranked up ${newMember.nickname} to "Omega Follower."`);
      });
    } catch (err) {
      return;
    }
  }
};
