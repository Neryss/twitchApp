module.exports = {
	apps : [{
		name : "proxy",
		script : "./proxy.js",
		cron_restart : "0 2 * * *",
		log_date_format: "YYYY-MM-DD HH:mm Z"
	}]
}