const discord = require('discord.js');

module.exports = {
	streamRegister: (userId) => {
		return new Promise(async (resolve, reject) => {
			try {
				await require("./subscriptions").register(userId, "stream.online");
				resolve();
			}
			catch (error) {
				console.error(error);
				reject(error);
			}
		});
	},
	streamOnHandle: (data) => {
		return new Promise(async (resolve, reject) => {
			const webhook = new discord.WebhookClient({url: process.env["DISCORD_WEBHOOK_ANNOUNCES"]});
			let fetched = await Promise.all([
				require("./getters").getChannel(data.broadcaster_user_id),
				require("./getters").getUserById(data.broadcaster_user_id),
			]);
			let channel = fetched[0].data[0];
			let user = fetched[1].data[0];
			let embed = new discord.MessageEmbed();
			embed.setColor("PURPLE");
			embed.setTitle(channel.title);
			embed.setURL(`https://twitch.tv/${channel.broadcaster_login}`);
			embed.setDescription(`${channel.broadcaster_name} est en live sur ${channel.game_name}`);
			embed.setThumbnail(user.profile_image_url);
			embed.setTimestamp(Date.now());
			await webhook.send({ embeds: [embed] });
			// await webhook.send(`<@&${process.env["DISCORD_ROLE_NOTIF_LIVE"]}>`);
			resolve();
		});
	},
}