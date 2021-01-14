export = async (bot: any, message: any) => {
  const prefix = process.env.PREFIX;
  if (message.author.bot || message.channel.type === 'dm' || !message.content.startsWith(prefix)) return;

  console.log('made it');

  const args = message.content.slice(prefix!.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  const commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));

  if (commandfile === undefined) return;
  console.log(commandfile);
  commandfile.run(bot, message, args);
};
