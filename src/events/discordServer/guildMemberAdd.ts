import verified from '../../models/verification';

export = async (bot: any, member: any) => {
  const verifiedPlayer = await verified.findOne({ DiscordID: member.user.id, Primary: true });

  if (!verifiedPlayer) return;

  member?.roles.add(member!.guild.roles.cache.find((discordRole: { name: string }) => discordRole.name === verifiedPlayer.Role)!, 'Verified Player role');
  member?.setNickname(verifiedPlayer.RobloxName);
};
