require('dotenv').config();
const express = require("express");
const cron = require("node-cron");
const schedule = require("node-schedule");
	
async function main() {
	global.app_token = await require("./events/getters").getAppToken();
	global.userToken = await require("./events/twitch_security").getUserToken();
	await require("./chat_bot").setup();

	// await require("./events/channel_points").createReward("channel_test", 1);

	schedule.scheduleJob("0 */2 * * *", async () => {
		console.log("Cron going one");
		global.appToken = await require("./events/getters").getAppToken();
		console.log("App token done");
		global.userToken = await require("./events/twitch_security").refreshToken(
			global.userToken
			);
	});

	const app = express();
	app.use(
		express.json({
			verify: (req, res, buf) => {
				req.rawBody = buf;
			},
		})
	);
	await require("./events/stream_on").streamRegister(process.env["CHANNEL_ID"]);
	await require("./events/follows").register(process.env["CHANNEL_ID"]);
	await require("./events/channel_points").register(process.env["CHANNEL_ID"]);
	// console.log(await require("./events/subscriptions").list(true));
	app.post("/notification", async (req, res) => {
		console.log("Salut !");
		if (process.env["DEBUG"] == "true" || require("./events/twitch_security").verifySignature(
			req.header("Twitch-Eventsub-Message-Signature"),
			req.header("Twitch-Eventsub-Message-Id"),
			req.header("Twitch-Eventsub-Message-Timestamp"),
			req.rawBody
		)) {
			console.info("notification received");
			if (req.header("Twitch-Eventsub-Message-Type") === "webhook_callback_verification") {
				res.send(req.body.challenge);
			}
			else if (req.header("Twitch-Eventsub-Message-Type") === "notification") {
				try {
					switch (req.body.subscription.type) {
						case "stream.online":
							await require("./events/stream_on").handle(req.body.event);
							break;
						case "channel.follow":
							console.log("Follow!");
							break;
						case "channel.channel_points_custom_reward_redemption.add":
							console.log("Hihi je suis là");
							await require("./events/channel_points").handle(req.body.event);
							break;
						default:
							console.warn(`Unhandled error : ${req.body.subscription.type}`);
							break;
					}
					res.send("ok");
				}
				catch (error) {
					console.error(error);
					res.status(500).send("Internal error");
				}
			}
		}
		else {
			res.status(403).send("Forbidden");
		}
	});
	app.listen(process.env["PORT"], () => {
		console.info(`Event server listening on port : ${process.env["PORT"]}`);
	});
};

main();