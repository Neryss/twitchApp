const fs = require("fs");
const { resolve } = require("path");

module.exports = {
	sendPic: () => {
		parse = 1;
		tested  = [];
		return new Promise (async (resolve) => {
			fs.readFile("./resources/nox.json", async function getPic(err, data) {
				try {
					if (parse)
						data = JSON.parse(data);
					selected = data[[Math.floor(Math.random() * (Object.keys(data).length))]]
					console.log("selected : ");
					console.log(selected);
					if (!selected.sent)
					{
						console.log(selected.sent);
						selected.sent = true;
						console.log(selected.sent);
						await require("../chat_bot").say(`Meow chef !\nhttps://neryss.pw/Nox_stream/${selected.url}`);
						fs.writeFileSync("./resources/nox.json", JSON.stringify(data, null, 4));
						resolve(0);
					}
					else if (tested.length < Object.keys(data).length)
					{
						console.log(tested.length);
						console.log(Object.keys(data).length);
						console.log("Tested.leng < obj len");
						if (!tested.includes(selected.id))
							tested.push(selected.id);
						console.log("None found");
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