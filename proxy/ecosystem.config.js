module.exports = {
	apps : [{
		name : "proxy",
		script : "./proxy.js",
		cron_restart : "0 2 * * *"
	}]
}