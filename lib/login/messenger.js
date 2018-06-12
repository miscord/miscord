const Messenger = require('facebook-chat-api')
const log = require('npmlog')
const fs = require('fs')
const path = require('path')

const { getChannel } = require('../discord')

var loggedin = false

module.exports = () => {
  return new Promise((resolve, reject) => {
    var obj
    try {
      obj = {appState: require(path.join(config.path, 'appstate.json'))}
    } catch (err) {
      obj = {email: config.messenger.username, password: config.messenger.password}
    }
    var options = {forceLogin: config.messenger.forceLogin, logLevel: 'warn', listenEvents: config.discord.showEvents}
    log.info('login', 'Logging in to Facebook...')
    Messenger(obj, options, (err, api) => {
      if (err) {
        if (err.error !== 'login-approval') return reject(err)
        log.info('login', 'Login approval pending...')
        getChannel({
          name: 'login-approval',
          topic: 'channel made for codes from login approval'
        }).then(channel => channel.send('Enter code:')).catch(reject)
        config.discord.client.on('message', message => {
          if (loggedin ||
            message.channel.name !== 'login-approval' ||
            message.author.username === config.discord.client.user.username ||
            (config.discord.category && message.channel.parent.name !== config.discord.category.name)) return
          log.verbose('login', 'Got FB approval code: %s', message.content)
          err.continue(message.content)
          message.channel.send('Code accepted.')
          loggedin = true
        })
        return
      }
      api.getThreadList(20, null, [], (err, threads) => {
        if (err) return reject(err)
        config.messenger.senders = new Map()
        config.messenger.threads = new Map()
        threads.forEach(thread => {
          var nicknames = {}
          thread.nicknames.forEach(nick => { nicknames[nick.userID] = nick.nickname })
          thread.participants.forEach(user => {
            config.messenger.senders.set(user.userID, {
              name: user.name,
              userID: user.userID
            })
          })
          config.messenger.threads.set(thread.threadID, {
            threadID: thread.threadID,
            threadName: thread.name,
            isGroup: thread.isGroup,
            nicknames
          })
        })
        log.silly('login: messenger threads', config.messenger.threads)
        log.silly('login: messenger senders', config.messenger.senders)
        fs.writeFile(path.join(config.path, 'appstate.json'), JSON.stringify(api.getAppState()), e => resolve(api))
      })
    })
  })
}
