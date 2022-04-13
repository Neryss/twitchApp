const axios = require('axios').default

module.exports = {
	altTab: () => {
		return new Promise(async (resolve, reject) => {
			console.log("Entering alt tab promise")
			axios({
				method: "GET",
				url: "http://192.168.1.85:8080/example",
				data: {
					field: "test"
				}
			}).then((res) => {
				console.log('it worked!')
				resolve(1);
			}).catch((err) => {
				console.log(`Didn't work ${err}`)
				reject(0)
			})
		})
	}
}