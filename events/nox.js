const fs = require("fs");
const { resolve } = require("path");
const discord = require('discord.js');
const fetch = require('node-fetch');
const formData = require('form-data');
const res = require("express/lib/response");

async function	countStats(files) {
	var res = {
		total: 0,
		sent: 0
	};
	return new Promise (async (resolve) => {
		for (var i = 0; i < Object.keys(files).length; i++)
		{
			res.total++;
			if (files[i].sent)
				res.sent++;
			i++;
		}
		resolve(res);
	})
}

module.exports = {
	sendPic: (user_name) => {
		parse = 1;
		tested  = [];
		return new Promise (async (resolve) => {
			fs.readFile("./resources/nox.json", async function getPic(err, data) {
				try {
					if (parse)
						data = JSON.parse(data);
					selected = data[[Math.floor(Math.random() * (Object.keys(data).length))]]
					stats = await countStats(data);
					if (!selected.sent)
					{
						selected.sent = true;
						await require("../chat_bot").say(`Une photo de Nox a été claim par ${user_name}, disponible sur le Discord: discord.neryss.pw`);

						const attachment = new discord.MessageAttachment(`./resources/photos/${selected.name}`, 'pic.png');
						const webhook = new discord.WebhookClient({url: process.env["DISCORD_WEBHOOK_NOX"]});
						let embed = new discord.MessageEmbed();
						embed.setColor("PURPLE");
						embed.setTitle(`${user_name} a claim une photo de Nox!`);
						embed.setTimestamp(Date.now());
						embed.setImage(`attachment://pic.png`);
						embed.addFields(
							{ name: "photos disponibles :", value: `${stats.total - stats.sent + 1}`}
						);
						await webhook.send({ embeds: [embed], files: [attachment] });
						fs.writeFileSync("./resources/nox.json", JSON.stringify(data, null, 4));
						resolve(0);
					}
					else if (tested.length < Object.keys(data).length)
					{
						if (!tested.includes(selected.id))
							tested.push(selected.id);
						console.log("Debug: no picture found");
						parse = 0;
						resolve (await getPic(err, data, 0));
					}
					else
					{
						await require("../chat_bot").say(`Oh no, on a plus de photos de Nox :(!`);
						resolve(1);
					}
				}
				catch (error) {
					console.log(error);
				}
			})
		})
	}
}