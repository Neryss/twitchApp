require('dotenv').config();
const axios = require('axios').default;

module.exports = {
	getAppToken: () => {
		return new Promise(async (resolve, reject) => {
			const client_id = process.env["CLIENT_ID"];
			const client_secret = process.env["CLIENT_SECRET"];
			console.log("Waiting for token...");
			axios({
				method: "POST",
				url: "https://id.twitch.tv/oauth2/token",
				data: {
					client_id: client_id,
					client_secret: client_secret,
					grant_type: "client_credentials",
					scopes: ""
				}
			}).then((res) => {
				console.log("token generated : " + JSON.stringify(res.data, null, 4));
				resolve(res.data);
			}).catch((err) => {
				console.error(err);
				reject(err);
			});
		});
	},
	test: () => {
		return new Promise(async (resolve, reject) => {
			axios({
				method: "GET",
				url: "https://api.twitch.tv/helix/users?login=neryss002",
				headers: {
					"Client-ID": process.env["CLIENT_ID"],
					"Content-Type": "application/json",
					Authorization: "Bearer " + global.app_token.access_token
				}
			})
			.then((res) => {
				console.log(res.data);
				resolve(res.data);
			})
			.catch((err) => {
				console.error(err);
				reject(err);
			})
		})
	}
}

async function main() {
	const getAppToken = await require("./index").getAppToken();
	console.log("cool");
	console.log(getAppToken);
	global.app_token = getAppToken;
	await require("./index").test();
}

main();