const axios = require('axios').default;
const sha256 = require('sha256');

module.exports = {
	register: (userId, type) => {
		return new Promise(async (resolve, reject) => {

			// console.log("owo : " + `https://${process.env["TWITCH_HOSTNAME"]}/notification`);
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
						callback: `https://${process.env["TWITCH_HOSTNAME"]}/notification`,
						secret: sha256(process.env["TWITCH_HOSTNAME"]),
					},
				},
			})
			.then((res) => {
				// console.info(`EVENT : ${type} registed for user ${userId}`);
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
	},
	list: (all = false) => {
		return new Promise((resolve, reject) => {
			axios({
				method: "GET",
				url: `https://api.twitch.tv/helix/eventsub/subscriptions${
					all ? "" : "?status=enabled"
				}`,
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.app_token.access_token,
				},
			})
				.then((res) => {
					resolve(res.data);
				})
				.catch((error) => {
					console.error(error);
					reject(error);
				});
		});
	},
	delete: (subId) => {
		return new Promise((resolve, reject) => {
			axios({
				method: "DELETE",
				url: `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subId}`,
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.app_token.access_token,
				},
			})
				.then((res) => {
					console.info(`subsribtion ${subId} deleted`);
					resolve();
				})
				.catch((error) => {
					console.error(error);
					reject(error);
				});
		});
	},
	deleteAll: () => {
		return new Promise(async (resolve, reject) => {
			const list = (await module.exports.list(true)).data;
			for (let index = 0; index < list.length; index++) {
				const sub = list[index];
				try {
					await module.exports.delete(sub.id);
				} catch (error) {
					console.error(error);
					reject(error);
				}
			}
			console.info(`all subsribtions are deleted`);
			resolve();
		});
	},
}
