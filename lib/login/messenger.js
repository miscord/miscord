const Messenger = require('facebook-chat-api')
const log = require('npmlog')
const fs = require('fs')

const sendError = require('../error.js')
const getChannel = require('../discord/getChannel.js')

var loggedin = false

module.exports = config => {
  log.level = config.logLevel
  return new Promise((resolve, reject) => {
    var obj
    try {
      obj = {appState: require('../appstate.json')}
    } catch (err) {
      obj = {email: config.messenger.username, password: config.messenger.password}
    }
    var options = {forceLogin: config.facebook.forceLogin, logLevel: 'warn'}
    log.info('login', 'Logging in to Facebook...')
    Messenger(obj, options, (err, api) => {
      if (err) {
        if (err.error !== 'login-approval') return reject(err)
        log.info('login', 'Login approval pending...')
        getChannel({
          name: 'login-approval',
          config: config,
          topic: 'channel made for codes from login approval'
        }).then(channel => channel.send('Enter code:')).catch(sendError)
        config.discord.client.on('message', message => {
          if (loggedin || message.channel.name !== 'login-approval' || message.author.username === config.discord.client.user.username || message.channel.parent.name !== config.discord.category.name) return
          log.verbose('login', 'Got FB approval code: %s', message.content)
          err.continue(message.content)
          message.channel.send('Code accepted.')
          loggedin = true
        })
        return
      }
      api.getThreadList(0, 9, (err, threads) => {
        if (err) return reject(err)
        config.messenger.senders = new Map()
        config.messenger.threads = new Map()
        threads.forEach(thread => {
          config.messenger.threads.set(thread.threadID, {
            threadID: thread.threadID,
            threadName: thread.name,
            isGroup: !thread.isCanonical,
            nicknames: thread.nicknames
          })
        })
        log.silly('login: messenger threads', config.messenger.threads)
        fs.writeFile('appstate.json', JSON.stringify(api.getAppState()), e => resolve(api))
      })
    })
  })
}
