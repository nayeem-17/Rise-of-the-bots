const Telegraf = require('telegraf').Telegraf;
const { menuCallback, query_callback } = require('./callbacks')
require('dotenv').config();
const bot = new Telegraf(process.env.TOKEN);
const { getList } = require('./drive')
const bookFolderId = process.env.FOLDER_ID;
let mainList = {};
bot.start(ctx => {
    ctx.reply("Hello there!!! This is UwU library! \nWhich book do you need?\nSee our menu /\show \nFor help, /\help")
})

bot.command('show', menuCallback);
bot.action('menu', menuCallback);

bot.on('callback_query', query_callback);

bot.launch().then(async(data) => {
    console.log('Bot successfully started!!! ')
});