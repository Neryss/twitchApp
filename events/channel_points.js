const axios = require('axios').default;

module.exports = {
	register : (userId) => {
		return new Promise(async (resolve, reject) => {
			try {
				await require("./subscriptions").register(userId, "channel.channel_points_custom_reward_redemption.add");
				resolve();
			}
			catch (error) {
				console.error(error);
				reject(error);
			}
		});
	},
	handle : (data) => {
		return new Promise(async (resolve, reject) => {
			function completed(status, user_name) {
				return new Promise(async (resolve) => {
					if (status)
						await require("./channel_points").validateRedemption(data.id, data.reward.id);
					else {
						await require("./channel_points").cancelRedemption(data.id, data.reward.id);
						await require("../chat_bot").say(`${user_name} Oh oh petit problème, tu es remboursé t'en fais pas !`);
					}
					resolve();
				});
			}
			switch (data.reward.title) {
				case "Photo de Nox uwu" :
					try {
						// await require("../chat_bot").say(`C'est trop bien hihi bravo!`);
						if (!await require("./nox").sendPic(data.user_name))
						{
							console.log("Complete!")
							await completed(true, data.user_name);
						}
						else
						{
							console.log("Nope");
							await completed(false, data.user_name);
							resolve();
						}
					} catch (error) {
						console.error("ERROR");
						await completed(false, data.user_name);
						reject(error);
					}
					break;
				case "alt_tab" :
					try {
						if (await require("./keyboard").altTab())
						{
							console.log(`Alt tab complete!`);
							await completed(true, data.user_name);
						}
						else
						{
							console.log(`Alt tab failed`);
							await completed(false, data.user_name);
							resolve()
						}
					}
					catch (error) {
						console.log("ERROR during alt tab")
						await completed(false, data.user_name)
						reject(error)
					}
					break;
				case "Drop son arme" :
					try {
						if (await require("./keyboard").dropWeapon())
						{
							console.log(`Weapon dropped!`);
							await completed(true, data.user_name);
						}
						else
						{
							console.log(`Weapon drop failed!`);
							await completed(false, data.user_name);
							resolve();
						}
						break;
					}
					catch (error) {
						console.log(`Error during weapon: ${error}`);
						await completed(false, data.user_name);
						reject(error);
					}
					break;
				default:
					break;
			}
			resolve();
		})
	},
	createReward: (title, cost) => {
		return new Promise((resolve, reject) => {
			axios({
				method: "POST",
				url: `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${process.env["CHANNEL_ID"]}`,
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.userToken.access_token,
				},
				data: {
					title: title,
					cost: cost,
					is_enabled: false,
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
	validateRedemption: (id, reward_id) => {
		return new Promise((resolve, reject) => {
			axios({
				method: "PATCH",
				url: `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${process.env["CHANNEL_ID"]}&reward_id=${reward_id}&id=${id}`,
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.userToken.access_token,
				},
				data: {
					status: "FULFILLED",
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
	cancelRedemption: (id, reward_id) => {
		return new Promise((resolve, reject) => {
			axios({
				method: "PATCH",
				url: `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${process.env["CHANNEL_ID"]}&reward_id=${reward_id}&id=${id}`,
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.userToken.access_token,
				},
				data: {
					status: "CANCELED",
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
	}
}