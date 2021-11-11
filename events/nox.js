const fs = require("fs");

module.exports = {
	sendPic: () => {
		return new Promise (async (resolve) => {
			fs.readFile("./resources/nox.json", async function(err, data) {
				try {
					data = JSON.parse(data);
					console.log(Object.keys(data).length);
					selected = data[[Math.floor(Math.random() * (Object.keys(data).length))]]
					console.log(selected);
					force = 0;
					if (!selected.sent && force)
					{
						console.log("Done");
						selected.sent = true;
						await require("../chat_bot").say(`Hop cadeau chef !\nhttps://neryss.pw/Nox_stream/${selected.url}`);
						fs.writeFileSync("./resources/nox.json", JSON.stringify(data, null, 4));
						resolve(0);
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