export = async (bot: any, message: any) => {
  const prefix = '.';
  if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (!message.content.startsWith(prefix)) return;
  const commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
  console.log(commandfile);

  if (commandfile === undefined) return;

  try {
    commandfile.run(bot, message, args);
  } catch (err) {
    console.error(err);
    message.reply('There was an error running the command.');
  }
};
