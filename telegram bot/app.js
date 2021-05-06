const telegramBot = require('node-telegram-bot-api');
const natural = require('natural');
const apostToLexForm = require('apos-to-lex-form');
const stopWord = require('stopword');
const SpellCorrector = require('spelling-corrector');
const spellCorrector = new SpellCorrector()
spellCorrector.loadDictionary();


require('dotenv').config();
const token = process.env.TOKEN

const api = new telegramBot(token, {
    polling: true
});

// api.on("polling error", err => console.log(err));

api.onText(/\/help/, (msg, match) => {
    const fromId = msg.from.id;
    api.sendMessage(fromId, "I can help you in getting the sentiments of any text you send to me.");
});

api.onText(/\/start/, (msg, match) => {
    const fromId = msg.from.id;
    api.sendMessage(fromId, "They call me UwU. " +
        "I can help you in getting the sentiments of any text you send to me." +
        "To help you i just have few commands.\n/help\n/start\n/sentiments");
});

console.log('Bot started')

const options = {
    reply_markup: JSON.stringify({
        force_reply: true
    })
};

api.onText(/\/sentiments/, (msg, match) => {
    const fromId = msg.from.id;
    api.sendMessage(fromId, "Alright! So you need sentiments of a text from me. " +
            "I can help you in that. Just send me the text.", options)
        .then((sended) => {
            const chatId = sended.chat.id;
            const messageId = sended.message_id;
            api.onReplyToMessage(chatId, messageId, (message) => {

                const text = apostToLexForm(message.text).toLowerCase();
                const alphaOnlyText = text.replace(/[^a-zA-Z\s]+/g, '');

                const tokenizer = new natural.WordTokenizer();
                const tokenizedText = tokenizer.tokenize(alphaOnlyText);

                const Analyzer = natural.SentimentAnalyzer;
                const stemmer = natural.PorterStemmer;
                const analyzer = new Analyzer("English", stemmer, "afinn");
                const analysis = analyzer.getSentiment(tokenizedText);

                let emoji = "";
                if (analysis < 0) {
                    emoji = "🙁"

                } else if (analysis === 0) {
                    emoji = "😐"

                } else if (analysis > 0) {
                    emoji = "😀"

                } else {
                    emoji = "🥺"
                }
                api.sendMessage(fromId, "So sentiments for your text are, " + emoji);

            });
        });
});