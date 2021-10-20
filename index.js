require('dotenv').config();
const axios = require('axios').default;
const express = require('express');
const discord = require('discord.js');
const sha256 = require("sha256");

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
	},
	getChannel: (channelId) => {
		return new Promise(async (resolve, reject) => {
			axios({
				method: "GET",
				url: `https://api.twitch.tv/helix/channels?broadcaster_id=${channelId}`,
				headers: {
					"Content-Type": "application/json",
					"Client-ID": process.env["CLIENT_ID"],
					Authorization: "Bearer " + global.appToken.access_token,
				},
			})
		})
		.then((res) => {
			resolve(res.data);
		}).catch((error) => {
			console.error(error);
			reject(error);
		});
	},
	verifySignature: (messageSignature, messageID, messageTimestamp, body) => {
		let message = messageID + messageTimestamp + body;
		let signature = crypto
		.createHmac("sha256", sha256(process.env["HOSTNAME"]))
		.update(message);
		let expectedSignatureHeader = "sha256=" + signature.digest("hex");
		return expectedSignatureHeader === messageSignature;
	},
	streamOnHandle: (data) => {
		return new Promise(async (resolve, reject) => {
			const webhook = new discord.WebhookClient({url: proccess.env["DISCORD_WEBHOOK_ANNOUNCES"]});
			let fetched = await Promise.all([
				require("./index").getChannel(data.broadcaster_user_id)
			]);
			let channel = fetched[0].data[0];
			
			let embed = new discord.MessageEmbed();
			embed.setColor("PURPLE");
			embed.setTitle(channel.title);
			embed.setURL(`https://twitch.tv/${channel.broadcaster_login}`);
			embed.setDescription(
				`${channel.broadcaster_name} est en live sur ${channel.game_name}`
				);
				embed.setThumbnail(user.profile_image_url);
				embed.setTimestamp(Date.now());
				await webhook.send({ embeds: [embed] });
				await webhook.send(`<@&${process.env["DISCORD_ROLE_NOTIF_LIVE"]}>`);
				resolve();
			});
		},
		subRegister: (userId, type) => {
			return new Promise(async (resolve, reject) => {
				axios({
					method: "POST",
					url: "https://api.twitch.tv/helix/eventsub/subscriptions",
					headers: {
						"Content-Type": "application/json",
						"Client-ID": process.env["CLIENT_ID"],
						Authorization: "Bearer " + global.appToken.access_token,
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
		},
		streamRegister: (userId) => {
			return new Promise(async (resolve, reject) => {
				try {
					await require("./index").subRegister(userId, "stream.online");
					resolve();
				}
				catch (error) {
					console.error(error);
					reject(error);
				}
			});
		}
	}
	
	async function main() {
		const getAppToken = await require("./index").getAppToken();
		console.log("cool");
		console.log(getAppToken);
		global.app_token = getAppToken;
		await require("./index").getUserInfos();
		const app = express();
		
		app.use(
			express.json({
				verify: (req, res, buf) => {
					req.rawBody = buf;
				},
			})
			);
			app.get("/notification", async (req, res) => {
				if (process.env["DEBUG"] == "true" || require("./index").verifySignature(
					req.header("Twitch-Eventsub-Message-Signature"),
					req.header("Twitch-Eventsub-Message-Id"),
					req.header("Twitch-Eventsub-Message-Timestamp"),
					req.rawBody
					)) {
						if (req.header("Twitch-Eventsub-Message-Type") ===
						"webhook_callback_verification") {
							res.send(req.body.challenge);
						}
						else if (req.header("Twitch-Eventsub-Message-Type") === "notification")
						{
							try {
								switch (req.body.subscription.type) {
									case "stream.online":
									await require("./index").streamOnHandle(req.body.event);
									default:
									console.warn(`Unhandled error : ${req.body.subscription.type}`);
									break;
								}
								res.send("ok");
							} catch (error) {
								console.error(error);
								res.status(500).send("Internal error");
							}
						}
					}
					else {
						res.status(403).send("Forbidden");
					}
				});
				app.listen(process.env["ENV"], () => {
					console.info(`Event server listening on port : ${process.env["PORT"]}`);
				});
			}
			
			main();