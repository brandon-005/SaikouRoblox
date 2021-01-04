import rbx from 'noblox.js';
import dotenv from 'dotenv';

dotenv.config();

async function startApp() {
  await rbx.setCookie(`${process.env.TOKEN}`);
  // Do everything else, calling functions and the like.
  const currentUser = await rbx.getCurrentUser();
  console.log(currentUser);
}

startApp();
