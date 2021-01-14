export = async (bot: any, message: any) => {
  if (message.author.bot || message.channel.type === 'dm') return;

  const prefix = process.env.PREFIX;
  const args = message.content.slice(prefix!.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (!message.content.startsWith(prefix)) return;
  const commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
  console.log(commandfile);
  if (commandfile) commandfile.run(bot, message, args);
};
