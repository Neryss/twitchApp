const express = require("express");
const app = express();

const config = {
	port = 80,
}

app.get('/', (req, res) => {
	res.send("Hello world!");
})

app.listen(port, () => {
	console.log(`Listening to port : ${config.port}`);
})
