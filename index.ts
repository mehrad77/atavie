import Datastore from 'nedb-promises';
import Telegraf from 'telegraf';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';
import session from 'telegraf/session';

const Users = new Datastore({
    autoload: true,
    filename: 'data/User.db',
});
Users.ensureIndex({
    fieldName: 'id',
    unique: true,
});

import { TOKEN } from './config';

export const bot = new Telegraf(TOKEN);

// // Register session middleware
bot.use(session());

console.log('app runnded');

bot.telegram.getMe().then((botInfo) => {
    console.log(botInfo);
    bot.options.username = botInfo.username;
    // bot.context.botInfo = botInfo;
}).then(() => {
    bot.startPolling();
});

bot.start((ctx) => {
    Users.findOne({id: ctx.from.id}).then((val) => {
        if (!val) {
            const user = {
                id: ctx.from.id,
                first_name: ctx.from.first_name,
                last_name: ctx.from.last_name,
                status: 'to_send_name',
            };
            Users.insert(user).then((theuser) => {
                console.log({theuser});
            }).then( () => {
                ctx.reply(`سلام ${ctx.from.first_name}!`);
                ctx.reply(`من اتابات‌ام.
                از اونجایی که یه سری از برنامه‌نویس‌های زاویه یادشون می‌رفت برای روزهای تعطتیل اسمشون رو بدن به من تا به نگهبانی پاس بدم، تصمیم گرفتند این بات رو بسازند تا به جاشون این کارو بکنه!`);
                ctx.reply('برای شروع اسمت رو بهم بگو');
            });
        } else {
            console.log({val});
        }
    })
    .catch((err) => {
        console.error({err});
    });
});

bot.hears('آره', ctx => {
    let realNameVar;
    Users.findOne({id: ctx.from.id}).then((user) => {
        console.log({user});
        if ((user as any).status === 'to_send_name' && (user as any).tempName) {
            Users.update({id: ctx.from.id},{realName: (user as any).tempName , status: 'active'}).then((theuser) => {
                console.log({theuser});
                realNameVar = (theuser as any).realName;
            }).then( () => {
                ctx.reply(
                    `خب ${realNameVar} جان، من از این به بعد هر موقع روزی تعطیل بود بهت پیام می‌دم که می‌آیی یا نه. اگه بگی میایی، منم به اتابک می‌گم ^_^`, 
                    Markup.keyboard([
                        ['حله!'],
                    ])
                    .oneTime()
                    .resize()
                    .extra()
                );
            });
        }
    })
    .catch((err) => {
        console.error({err});
    });
});

bot.hears('نه، دوباره می‌نویسم', ctx => {
    Users.findOne({id: ctx.from.id}).then((user) => {
        console.log({user});
        // if ((user as any).status === 'to_send_name' && (user as any).tempName) {
        //     Users.update({id: ctx.from.id},{tempName: undefined}).then((theuser) => {
        //         console.log({theuser});
        //     }).then( () => {
        //         ctx.reply('اوکی، دوباره بنویس');
        //     });
        // }
    })
    .catch((err) => {
        console.error({err});
    });
});

bot.hears('حله!', ctx => {
    ctx.reply('😉');        
});

bot.on('message', (ctx) => {
    console.log({id: ctx.from.id})
    Users.findOne({id: ctx.from.id}).then((user) => {
        console.log({user});
        if ((user as any).status === 'to_send_name') {
            Users.update({id: ctx.from.id},{tempName: ctx.message.text}).then((theuser) => {
                console.log({theuser});
            }).then( () => {
                ctx.reply(
                    `پس نامت «${ctx.message.text}» هست، آره؟`, 
                    Markup.keyboard([
                        ['نه، دوباره می‌نویسم', 'آره'],
                    ])
                    .oneTime()
                    .resize()
                    .extra()
                );
            });
        }
    })
    .catch((err) => {
        console.error({err});
    });
});

bot.launch();
