exports.menuCallback = ctx => {
    ctx.deleteMessage();
    ctx.telegram.sendMessage(ctx.chat.id, " *The menu of files* ", {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "Book",
                    callback_data: "node-book"
                }, {
                    text: 'Picture',
                    callback_data: 'show-pictures'
                }]
            ]
        }
    });
}