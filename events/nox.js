module.exports = {
	sendPic: () => {
		return new Promise (async (resolve) => {
			pics = ["IMG-20200411-WA0000.jpg",  "IMG_20200416_021650.jpg",  "IMG_20210103_151851.jpg",  "IMG_20210802_040343.jpg",
				"IMG-20200629-WA0000.jpg",  "IMG_20200417_125017.jpg",  "IMG_20210202_194336.jpg",  "IMG_20210827_153645_1.jpg",
				"IMG-20200818-WA0005.jpg",  "IMG_20200610_193446.jpg",  "IMG_20210504_182157.jpg",  "IMG_20210920_191056.jpg",
				"IMG-20200909-WA0009.jpg",  "IMG_20200611_235256.jpg",  "IMG_20210507_221125.jpg",  "IMG_20211025_210523.jpg",
				"IMG-20201123-WA0009.jpg",  "IMG_20200723_200925.jpg",  "IMG_20210622_011216.jpg",
				"IMG-20201203-WA0005.jpg",  "IMG_20200822_213751.jpg",  "IMG_20210717_215008.jpg",
				"IMG-20201203-WA0006.jpg",  "IMG_20201124_212937.jpg",  "IMG_20210723_222153.jpg"]
			//I'll find something else eventually don't worry
			await require("../chat_bot").say(`Hop cadeau chef !\nhttps://neryss.pw/Nox_stream/${pics[Math.floor(Math.random() * (pics.length))]}`);
			resolve();
		})
	}
}