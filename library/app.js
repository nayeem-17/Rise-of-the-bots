const Telegraf = require('telegraf').Telegraf;
const { menuCallback } = require('./callbacks')
require('dotenv').config();

const bot = new Telegraf(process.env.TOKEN);

bot.start(ctx => {
    ctx.reply("Hello there!!! This is UwU library! \nWhich book do you need?\nSee our menu /\show \nFor help, /\help")
})

bot.command('show', menuCallback);
bot.action('menu', menuCallback);

bot.on('callback_query', ctx => {
    ctx.deleteMessage();
    const data = ctx.callbackQuery.data;
    if (data == 'show-pictures') {
        ctx.telegram.sendMessage(ctx.chat.id, "Options", {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "image3",
                        callback_data: "image3.png"
                    }, {
                        text: "image2",
                        callback_data: "image2.png"
                    }]
                ],
                remove_keyboard: true
            }
        });
    } else if (data == "node-book") {
        ctx.telegram.sendChatAction(ctx.chat.id, "upload_document");
        ctx.telegram.sendDocument(ctx.chat.id, {
            source: "resources/BotsWithNodejs.pdf",
            filename: 'doc.pdf'
        }).catch(err => {
            console.log(err);
        }).then(res => {
            console.log(res);
        });
    } else {
        ctx.telegram.sendMessage(ctx.chat.id, "Sending " + data + "....")
        ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
        ctx.telegram.sendPhoto(ctx.chat.id, {
            source: 'resources/' + data,
            filename: data
        }).then(res => {
            ctx.telegram.sendMessage(ctx.chat.id, "The document has been successfully sent!!! ");
        });
    }

});

bot.launch().then(data => {
    console.log('Bot successfully started!!!')
});