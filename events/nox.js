const fs = require("fs");
const { resolve } = require("path");

module.exports = {
	sendPic: () => {
		times = 0;
		parse = 1;
		return new Promise (async (resolve) => {
			fs.readFile("./resources/nox.json", async function getPic(err, data) {
				try {
					console.log(data);
					if (parse)
					{
						console.log("Parsing inc");
						data = JSON.parse(data);
					}
					// console.log(Object.keys(data).length);
					selected = data[[Math.floor(Math.random() * (Object.keys(data).length))]]
					console.log("selected : ");
					console.log(selected);
					if (!selected.sent)
					{
						console.log("Done");
						selected.sent = true;
						await require("../chat_bot").say(`Hop cadeau chef !\nhttps://neryss.pw/Nox_stream/${selected.url}`);
						if (parse)
							fs.writeFileSync("./resources/nox.json", JSON.stringify(data, null, 4));
						// else
						// 	fs.writeFileSync("./resources/nox.json", data);
						resolve(0);
					}
					else if (times < Object.keys(data).length)
					{
						times++;
						console.log("None found");
						parse = 0;
						resolve (getPic(err, data, 0));
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