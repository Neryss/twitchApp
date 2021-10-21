const axios = require('axios').default;
const sha256 = require('sha256');

module.exports = {
	subRegister: (userId, type) => {
		return new Promise(async (resolve, reject) => {
			axios({
				method: "POST",
				url: "https://api.twitch.tv/helix/eventsub/subscriptions",
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.app_token.access_token,
				},
				data: {
					type: type,
					version: "1",
					condition: {broadcaster_user_id: userId},
					transport: {
						method: "webhook",
						callback: `https://${process.env["HOSTNAME"]}/notification`,
						secret: sha256(process.env["HOSTNAME"]),
					},
				},
			})
			.then((res) => {
				console.info(`EVENT : ${type} registed for user ${userId}`);
				resolve();
			})
			.catch((error) => {
				if (error.response.data.message == "subscription already exists")
				{
					console.info(`${type} already registered for ${userId}`);
					resolve();
				}
				else
				{
					console.error(error);
					reject(error);
				}
			});
		});
	}
}
