const TelegramBot = require('node-telegram-bot-api'); 
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const express = require("express");

const app = express();

// load the environment variable
require('dotenv').load();

// replace this with the tokenDaily channelid
const channel_id = "-1001261617017";
const url = "https://www.tokendaily.co/?o=new-posts";

// might need to change this
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// holds the latest article
let latest = {} ;

// helper functions
const generateArticleLink = function(raw) {
	return `https://www.tokendaily.co/p/${raw}`
}

const scraper = async function() {
	const data = await fetch(url)
	const markup = await data.text()
	const $ = cheerio.load(markup)

	// "document.location.href = '/p/forbes-fintech-50-2018-the-future-of-blockchain-and-cryptocurrency';"
	const _latest = $(".feed").children().first()[0].attribs.onclick;

	// trim and then remove filty stuff
	const _link = _latest.split("/p/")[1].replace(";", "").replace("'", "");

	return {
		title: _link.split("-").join(" "),
		link: generateArticleLink(_link)
	}
}

const postMessageToChannel = function(channel_id, data) {
	bot.sendMessage(channel_id, 
		`${data.title.replace(/\b\w/g, l => l.toUpperCase())}

		${data.link}`)
}

// main program logic

setInterval(async () => {
	_latest = await scraper();
	if (latest.title !== _latest.title ) {
		latest = _latest;
		console.log(latest);
		postMessageToChannel(channel_id, latest)
	}
}, 10000);


app.listen(3456, () => {
	console.log('app is running on port 3456');
})