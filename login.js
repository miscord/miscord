const fs = require("fs")
const login = require("facebook-chat-api")
const readline = require('readline')

var rl = readline.createInterface({input: process.stdin, output: process.stdout})

login({email: process.env.LOGIN, password: process.env.PASSWORD}, (err, api) => {
    if(err) {
		// if login approval is needed, enter authenticator code
		if (err.error !== 'login-approval') return console.error(err)
		console.log('Enter code: ')
		rl.on('line', line => {
			err.continue(line)
			rl.close()
		})
		return
	}
    fs.writeFile('appstate.json', JSON.stringify(api.getAppState()), e => process.exit(0))
})
