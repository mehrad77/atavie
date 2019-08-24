import Telegraf from 'telegraf';
import { TOKEN } from './config';

export const bot = new Telegraf(TOKEN);
console.log('app runnded');
bot.telegram.getMe().then((botInfo) => {
    console.log(botInfo);
    bot.options.username = botInfo.username;
    // bot.context.botInfo = botInfo;
}).then(() => {
    bot.startPolling();
});

bot.launch();