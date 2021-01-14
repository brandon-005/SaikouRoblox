export = async (bot: any, message: any) => {
  console.log('made it1');
  const prefix = process.env.PREFIX;
  if (message.author.bot || message.channel.type === 'dm' || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix!.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  const commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));

  console.log('made it2');

  console.log(`cmd: ${cmd}`);

  console.log(commandfile);

  if (commandfile === undefined) return;
  console.log(commandfile);
  console.log('made it3');
  commandfile.run(bot, message, args);
  console.log('should of executed');
};
