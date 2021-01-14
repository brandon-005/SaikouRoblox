export = async (bot: any, message: any) => {
  console.log('made it 1');
  if (message.author.bot || message.channel.type === 'dm') return;

  console.log('made it 2');
  const prefix = process.env.PREFIX!;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  console.log(`cmd: ${cmd}`);

  if (!message.content.startsWith(prefix)) return;
  console.log('made it 3');
  const commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
  console.log(commandfile);
  if (commandfile) commandfile.run(bot, message, args);
  console.log('ran command');
};
