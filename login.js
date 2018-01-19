const fs = require("fs")
const login = require("facebook-chat-api")
login({email: process.env.LOGIN, password: process.env.PASSWORD}, (err, api) => {
    if(err) return console.error(err)
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()))
})
