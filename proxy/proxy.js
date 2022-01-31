require("dotenv").config();
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");
const fs = require("fs");

const domainName = "neryss.pw";

const server = http.createServer((req, res) => {
	res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
	res.end();
});

server.listen(80, () => {
	console.info("listen http");
});

function internalError(res, error) {
	console.error(error);
	res.writeHead(500, {
		"Content-Type": "application/json",
	});
	res.write("500: interal error");
	res.end();
}

var proxy = httpProxy.createProxyServer();
https
	.createServer(
		{
			key: fs.readFileSync(
				`/etc/letsencrypt/live/${domainName}/privkey.pem`
			),
			cert: fs.readFileSync(
				`/etc/letsencrypt/live/${domainName}/fullchain.pem`
			),
		},
		function (req, res) {
			try {
				var target;
				var domain = req.headers.host;
				var host = domain.split(":")[0];
				if (host == `api.${domainName}`)
					target = { host: "localhost", port: "3000" };
				else if (host == `discord.${domainName}`)
				{
					res.writeHead(301, { Location: "https://discord.gg/vyyucAsEr8"} );
					res.end();
					return ;
				}
				else if (host == `twitch.${domainName}`)
					target = {
						host: "localhost",
						port: "4000",
					};
				else if (host == domainName)
					target = { host: "localhost", port: "3000" };
				else if (host == `files.${domainName}`) {
					target = { host: "localhost", port: "3001"};
					console.log("La je suis dedans");
				}
				else {
					throw "unknown domain";
				}
				proxy.web(
					req,
					res,
					{
						target: target,
					},
					function (e) {
						internalError(res, e);
					}
				);
			} catch (error) {
				internalError(res, error);
			}
		}
	)
	.listen(443, () => {
		console.info("listen https");
	});
