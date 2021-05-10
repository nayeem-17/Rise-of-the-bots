const Telegraf = require('telegraf').Telegraf;
const { menuCallback, query_callback } = require('./callbacks')
require('dotenv').config();
const bot = new Telegraf(process.env.TOKEN);

bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.use((ctx, next) => {
    console.log(`user-> ${ctx.chat.first_name} ${ctx.chat.last_name} , Processing update ${ctx.update.update_id}`);
    next();
});

bot.start(ctx => {
    ctx.reply("Hello there!!! This is library bot! \nWhich book do you need?\nSee the menu /\show \nFor help, /\help")
});

bot.command('show', menuCallback);
bot.action('menu', menuCallback);
bot.help(ctx => {
    ctx.telegram.sendMessage(ctx.chat.id, "Don't be a baby! Help yourself !!")
})
bot.on('callback_query', query_callback);

bot.on('text', (ctx) => {
    ctx.reply(`Hello ${ctx.chat.first_name} ${ctx.chat.last_name} ! Please select any of these commands!!\nSee the menu /\show \nFor help, /\help `);
})

bot.launch().then(async(data) => {
    console.log('Bot successfully started!!! ')
});