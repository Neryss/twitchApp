const sha256 = require('sha256');
const crypto = require('node:crypto');
const express = require("express");
const fs = require("fs");

module.exports = {
	verifySignature: (messageSignature, messageID, messageTimestamp, body) => {
		let message = messageID + messageTimestamp + body;
		let signature = crypto
		.createHmac("sha256", sha256(process.env["HOSTNAME"]))
		.update(message);
		let expectedSignatureHeader = "sha256=" + signature.digest("hex");
		return expectedSignatureHeader === messageSignature;
	},
	getUserToken: () => {
		return new Promise(async (resolve, reject) => {
			const app = express();
			const scopes = ["channel.channel_points_custom_reward_redemption.add"];
			var server;

			if (fs.existsSync("./.token.json")) {
				let content = JSON.parse(
					fs.readFileSync("./.token.json", {
						encoding: "utf-8",
					})
				);
				function checkScopes() {
					if (scopes.length == content.scope.length) {
						for (let index = 0; index < scopes.length; index++) {
							if (scopes[index] != content.scope[index])
								return false;
						}
						return true;
					} else return false;
				}

				if (checkScopes()) {
					try {
						await module.exports.userTokenValidate(content);
						resolve(await module.exports.refreshToken(content));
					} catch (error) {
						console.error(error);
						newToken();
					}
				} else {
					newToken();
				}
			} else newToken();
			function newToken() {
				function getAuthUrl() {
					return `https://id.twitch.tv/oauth2/authorize?client_id=${
						process.env["TWITCH_CLIENT_ID"]
					}&redirect_uri=${
						process.env["TWITCH_OAUTH_REDIRECT"]
					}&response_type=code&scope=${encodeURI(scopes.join(" "))}`;
				}
				app.get("/auth", async (req, res) => {
					axios({
						method: "POST",
						url: "https://id.twitch.tv/oauth2/token",
						data: {
							client_id: process.env["CLIENT_ID"],
							client_secret: process.env["CLIENT_SECRET"],
							code: req.query.code,
							grant_type: "authorization_code",
							redirect_uri: process.env["TWITCH_OAUTH_REDIRECT"],
						},
					})
						.then((data) => {
							res.send("ok");
							fs.writeFileSync(
								"./.token.json",
								JSON.stringify(data.data),
								{ encoding: "utf-8" }
							);
							server.close(() => {
								console.info(`auth server killed gracefully`);
								resolve(data.data);
							});
						})
						.catch((error) => {
							res.status(500).send("internal error");
							console.error(error);
							reject(error);
						});
				});
				server = app.listen(process.env["PORT"], () => {
					console.info(
						`auth server up on port: ${process.env["PORT"]}`
					);
				});
				console.info(getAuthUrl());
			}
		});
	},
	userTokenValidate: (token) => {
		return new Promise((resolve, reject) => {
			console.info("validating token...");
			try {
				axios({
					method: "GET",
					url: "https://id.twitch.tv/oauth2/validate",
					headers: {
						Authorization: "Bearer " + token.access_token,
					},
				})
					.then((res) => {
						console.info("token validated");
						resolve(res.data);
					})
					.catch((err) => {
						console.error(err);
						reject(err);
					});
			} catch (error) {
				console.error(error);
				reject(error);
			}
		});
	},
	refreshToken: (token) => {
		return new Promise((resolve, reject) => {
			console.info("refreshing token...");
			try {
				axios({
					method: "POST",
					url: "https://id.twitch.tv/oauth2/token",
					data: {
						client_id: process.env["CLIENT_ID"],
						client_secret: process.env["CLIENT_SECRET"],
						grant_type: "refresh_token",
						refresh_token: token.refresh_token,
					},
				})
					.then((res) => {
						console.info("token refreshed");
						fs.writeFileSync(
							"./.token.json",
							JSON.stringify(res.data),
							{ encoding: "utf-8" }
						);
						resolve(res.data);
					})
					.catch((err) => {
						console.error(err);
						reject(err);
					});
			} catch (error) {
				console.error(error);
				reject(error);
			}
		});
	},
}