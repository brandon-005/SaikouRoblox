import { User } from 'discord.js';
import verified from '../../models/verification';
import banFlags from '../../models/banned';
import { VerifyTypes } from '../../types/verification';

export = async (bot: any, server: any, member: User) => {
  const verifiedUser = await verified.find({ DiscordID: member.id });

  if (verifiedUser) {
    verifiedUser.forEach(async (user: VerifyTypes) => {
      await banFlags.create({ RobloxUsername: user.RobloxName, RobloxID: user.RobloxID });
    });
  }
};
