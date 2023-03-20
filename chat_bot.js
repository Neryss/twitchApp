const	tmi = require("tmi.js");
require("dotenv").config();

const opts = {
	identity: {
		username: process.env.USERNAME,
		password: process.env.PASSWORD
	},
	channels: [
		process.env.CHANNEL_NAME
	]
};

const client = new tmi.client(opts);

function ft_owo(target, context, msg, self)
{
	const owos = [`uwu je suis d'accord ${context["display-name"]}`,
		"owo",
		"iwi",
		"TwT",
		"OwO",
		"òwó",
		"ówò",
		"¯\\_(ツ)_/¯"];
	client.say(target, owos[Math.floor(Math.random() * (8))]);
}

function onMessageHandler(target, context, msg, self) {
	if (self)
		return ;
	const commandName = msg.trim();
	if (commandName == "!discord")
		client.say(target, "Le discord : discord.neryss.pw");
	else if (commandName == "!gogo")
		client.say(target, "https://www.twitch.tv/gogolegamerzz");
	else if (commandName == "!nono")
		client.say(target, "https://www.instagram.com/stitchosaurus/");
	else if (commandName == "!erios")
		client.say(target, "https://www.instagram.com/eri0sluna/");
	else if (commandName == "owo")
		ft_owo(target, context, msg, self);
	else if (commandName == "!reseaux")
		client.say(target, "https://twitter.com/Neryss002\nhttps://www.tiktok.com/@neryss002");
	else if (commandName == "!modpack")
		client.say(target, "Enigmatica6 :\nhttps://www.curseforge.com/minecraft/modpacks/enigmatica6");
		// client.say(target, "ATM6 :\nhttps://www.curseforge.com/minecraft/modpacks/all-the-mods-6");
		// client.say(target, "RagnamodVI : \n https://www.curseforge.com/minecraft/modpacks/ragnamod-vi");
	else if (commandName == "!squad")
		client.say(target, "https://kadgar.net/live/neryss002/gogolegamerzz");
	else if (commandName.includes("quoi") || commandName.includes("koi"))
		client.say(target, "feur")
}

function	onConnectedHandler(addr, port) {
	console.log(`Connected to ${addr}:${port}`);
}

module.exports = {
	say: (msg) => {
		return new Promise(async (resolve) => {
			resolve(await client.say(process.env["CHANNEL_NAME"], msg));
		});
	},
	setup: () => {
		return new Promise((resolve, reject) => {
			client.on("connected", (addr, port) => {
				console.info(`Connected to ${addr}:${port}`);
			});
			client.on("join", (channel, username, self) => {
				if (self) {
					resolve();
				}
			});
			client.on("message", onMessageHandler);
			client.connect();
		});
	},
}
