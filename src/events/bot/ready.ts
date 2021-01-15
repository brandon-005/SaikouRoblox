import mongoDatabase from '../database/connectDatabase';

export = async (bot: any) => {
  console.log(`\n${bot.user.username} has loaded successfully and is online.`);

  bot.user.setActivity('Bloxxing Players', {
    type: 'STREAMING',
    url: 'https://twitch.tv/doingthisforthestatuslol',
  });

  await mongoDatabase().then(() => console.log('[SUCCESS]: Connected to MongoDB database!'));
};
