export = async (bot: any, message: any) => {
  const prefix = process.env.PREFIX!;
  console.log('made it 1');
  if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

  console.log('made it 2');
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  console.log(`cmd: ${cmd}`);

  if (!message.content.startsWith(prefix)) return;
  console.log('made it 3');
  const commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
  console.log(commandfile);

  if (commandfile === undefined) return;

  try {
    commandfile.run(bot, message, args);
  } catch (err) {
    console.error(err);
    message.reply('There was an error running the command.');
  }
  console.log('ran command');
};
