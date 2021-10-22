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
}