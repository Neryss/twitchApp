require('dotenv').config();
const express = require("express");
const res = require('express/lib/response');
const schedule = require("node-schedule");
const crypto = require('node:crypto');
const { LOADIPHLPAPI } = require('node:dns');

const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature'.toLowerCase();
const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification';
const MESSAGE_TYPE_NOTIFICATION = 'notification';
const MESSAGE_TYPE_REVOCATION = 'revocation';

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = 'sha256=';


function getSecret() {
    // Get secret from secure storage. This is the secret you pass 
    // when you subscribed to the event.
    return process.env["TWITCH_HOSTNAME"];
}

// Build the message used to get the HMAC.
function getHmacMessage(request) {
    return (request.headers[TWITCH_MESSAGE_ID] + 
        request.headers[TWITCH_MESSAGE_TIMESTAMP] + 
        request.body);
}

// Get the HMAC.
function getHmac(secret, message) {
    return crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}

// Verify whether our hash matches the hash that Twitch passed in the header.
function verifyMessage(hmac, verifySignature) {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}


async function main() {
	console.log(process.env);
	// return
	global.app_token = await require("./events/getters").getAppToken();
	global.userToken = await require("./events/twitch_security").getUserToken();
	await require("./chat_bot").setup();
	console.log("done");
	// await require("./events/channel_points").createReward("alt_tab", 1);

	schedule.scheduleJob("0 */2 * * *", async () => {
		console.log("Cron going one");
		global.appToken = await require("./events/getters").getAppToken();
		console.log("App token done");
		global.userToken = await require("./events/twitch_security").refreshToken(
			global.userToken
			);
	});

	const app = express();
	app.use(express.raw({
		type: 'application/json'
	})) 

	await require("./events/subscriptions").deleteAll();
	await require("./events/stream_on").streamRegister(process.env["CHANNEL_ID"]);
	await require("./events/follows").register(process.env["CHANNEL_ID"]);
	await require("./events/channel_points").register(process.env["CHANNEL_ID"]);
	console.log(await require("./events/subscriptions").list(true));

	app.post("/notification", async (req, res) => {

		console.log("Headers :");
		console.log(req.headers);
		console.log("DEBUG = " + process.env['DEBUG']);
		if (process.env["DEBUG"] == "true" || require("./events/twitch_security").verifySignature(
			req.header("Twitch-Eventsub-Message-Signature"),
			req.header("Twitch-Eventsub-Message-Id"),
			req.header("Twitch-Eventsub-Message-Timestamp"),
			req.body
		)) {
			console.info("notification received");

			let notification = JSON.parse(req.body);
			if (MESSAGE_TYPE_VERIFICATION === req.headers[MESSAGE_TYPE]) {
				console.log("pouet");
				res.status(200).send(notification.challenge);
				// console.log(await require("./events/subscriptions").list());
			}
			else if (MESSAGE_TYPE_REVOCATION === req.headers[MESSAGE_TYPE]) {
				res.sendStatus(204);
				console.log(`${notification.subscription.type} notifications revoked!`);
				console.log(`reason: ${notification.subscription.status}`);
				console.log(`condition: ${JSON.stringify(notification.subscription.condition, null, 4)}`);
			}
			else if (MESSAGE_TYPE_NOTIFICATION === req.headers[MESSAGE_TYPE]) {
				console.log(`Event type: ${notification.subscription.type}`);
				
				res.sendStatus(204);
				try {
					console.log(notification);
					switch (notification.subscription.type) {
						case "stream.online":
							await require("./events/stream_on").handle(notification.event);
							break;
						case "channel.follow":
							console.log("Follow!");
							await require("./events/follows").getFollowersGoals(process.env["CHANNEL_ID"]);
							await require("./events/follows").getLastFollower(process.env["CHANNEL_ID"]);
							break;
						case "channel.channel_points_custom_reward_redemption.add":
							await require("./events/channel_points").handle(notification.event);
							break;
						default:
							console.warn(`Unhandled error : ${notification.subscription.type}`);
							break;
					}
					// res.send("ok");
				}
				catch (error) {
					console.error(error);
					// res.status(500).send("Internal error");
				}
			}
			else
			{
				console.log("undefined event");
			}
		}
		else {
			console.log("signature check failed");
			res.status(403).send("Forbidden");
		}
	});
	app.get("/test", async (request, response) => {
		console.log("salut");
		let goal = await require("./events/follows").getFollowersGoals(process.env["CHANNEL_ID"]);
		let goalExt = goal ? `${goal.current_amount}/${goal.target_amount}` : "";
		response.send(goalExt);
	})
	app.get("/latest", async (request, response) => {
		let latest = await require("./events/follows").getLastFollower(process.env["CHANNEL_ID"]);
		response.send(latest);
	})
	app.get("/game", async (request, response) => {
		let game = await require("./events/getters").getChannel(process.env["CHANNEL_ID"]);
		console.log(game.data[0].game_name);
		response.send(game.data[0].game_name);
	})
	app.listen(process.env["PORT"], () => {
		console.info(`Event server listening on port : ${process.env["PORT"]}`);
	});
};

main();