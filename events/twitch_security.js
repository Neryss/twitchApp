const sha256 = require('sha256');

module.exports = {
	verifySignature: (messageSignature, messageID, messageTimestamp, body) => {
		let message = messageID + messageTimestamp + body;
		let signature = crypto
		.createHmac("sha256", sha256(process.env["HOSTNAME"]))
		.update(message);
		let expectedSignatureHeader = "sha256=" + signature.digest("hex");
		return expectedSignatureHeader === messageSignature;
	},
}