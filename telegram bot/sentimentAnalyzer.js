const natural = require('natural');
const apostToLexForm = require('apos-to-lex-form');
const stopWord = require('stopword');
const SpellCorrector = require('spelling-corrector');
const spellCorrector = new SpellCorrector()
spellCorrector.loadDictionary();

exports.analyzer = (message) => {
    const text = apostToLexForm(message.text).toLowerCase();
    const alphaOnlyText = text.replace(/[^a-zA-Z\s]+/g, '');

    const tokenizer = new natural.WordTokenizer();
    const tokenizedText = tokenizer.tokenize(alphaOnlyText);

    console.log(tokenizedText)
    const Analyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new Analyzer("English", stemmer, "afinn");
    const analysis = analyzer.getSentiment(tokenizedText);
    return analysis;
}