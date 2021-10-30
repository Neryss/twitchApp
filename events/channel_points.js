
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
			console.log(data);
			resolve();
		})
	}
}