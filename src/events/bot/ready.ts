import mongoDatabase from '../database/connectDatabase';

export = async (bot: any) => {
  console.log(`\n[SUCCESS]: Logged into the "${bot.user.username}" Discord account!`);

  bot.user.setActivity('Bloxxing Players', {
    type: 'STREAMING',
    url: 'https://twitch.tv/doingthisforthestatuslol',
  });

  await mongoDatabase().then(() => console.log('[SUCCESS]: Connected to MongoDB database!'));
};
