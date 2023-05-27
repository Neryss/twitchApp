const { resolve } = require("discord.js/src/util/Intents");
const axios = require('axios').default;

module.exports = {
	register: (userId) => {
		return new Promise(async (resolve, reject) => {
			try {
				await require("./subscriptions").register(
					userId,
					"channel.follow"
				);
				resolve();
			} catch (error) {
				console.error(error);
				reject(error);
			}
		});
	},
	getFollowersGoals: (userId) => {
		return new Promise((resolve, reject) => {
			axios({
				method: "GET",
				url: `https://api.twitch.tv/helix/goals?broadcaster_id=${userId}`,
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.userToken.access_token,
				},
			})
				.then((res) => {
					let list = res.data.data;
					for (let index = 0; index < list.length; index++) {
						const element = list[index];
						if (element.type == "follower") resolve(element);
					}
					resolve(undefined);
				})
				.catch((error) => {
					console.error(error);
					reject(error);
				});
		});
	},
	getLastFollower: (userId) => {
		return new Promise((resolve, reject) => {
			axios({
				method: "GET",
				url: `https://api.twitch.tv/helix/users/follows?to_id=${userId}`,
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.userToken.access_token,
				},
			})
				.then((res) => {
					console.log(res.data.data[0].from_name);
					resolve(res.data.data[0].from_name);
				})
				.catch((err) => {
					console.error(err);
					reject(err);
				});
		});
	},
	testNotif: (user_name) => {
		return new Promise((resolve, reject) => {
			
		})
	}
}
