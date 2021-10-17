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
	getUserInfos: () => {
		return new Promise(async (resolve, reject) => {
			axios({
				method: "GET",
				url: `https://api.twitch.tv/helix/users?login=${process.env["CHANNEL_NAME"]}`,
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
	},
	testSub: () => {
		return new Promise(async (resolve, reject) => {
			axios({
				method: "POST",
				url: `https://api.twitch.tv/helix/eventsub/subscriptions`,
				headers: {
					"Client-ID": process.env["CLIENT_ID"],
					"Content-type": "application/json",
					Authorization: "Bearer " + global.app_token.access_token
				},
				data: {
					type: "stream.online",
					version: "1",
					condition: {
						broadcaster_user_id: provess.env["CHANNEL_NAME"]
					},
					transport: {
						method: "webhook"
					}
				}
			}).then((res) => {
				console.log(res.data);
				resolve(res.data);
			}).catch ((err) => {
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
	await require("./index").getUserInfos();
	// await require("./index").testSub();
}

main();