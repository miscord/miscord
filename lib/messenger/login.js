const Messenger = require('facebook-chat-api')
const log = require('npmlog')
const fs = require('fs')
const path = require('path')

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
        channels.getChannel('0', 'login-approval').then(channel => {
          if (!channel) throw new Error('Could not create login-approval channel.')
          return channel
        }).then(channel => channel.send('Enter code:')).catch(reject)
        discord.client.on('message', message => {
          if (loggedin ||
            message.channel.name !== 'login-approval' ||
            message.author.username === discord.client.user.username ||
            (discord.category && message.channel.parent.name !== discord.category.name)) return
          log.verbose('login', 'Got FB approval code: %s', message.content)
          err.continue(message.content)
          message.channel.send('Code accepted.')
          loggedin = true
        })
        return
      }
      global.messenger = { client: api }
      api.getThreadList(20, null, [], (err, threads) => {
        if (err) return reject(err)
        messenger.senders = new Map()
        messenger.threads = new Map()
        threads.forEach(thread => {
          var nicknames = {}
          thread.nicknames.forEach(nick => { nicknames[nick.userID] = nick.nickname })
          thread.participants.forEach(user => {
            messenger.senders.set(user.userID, {
              name: user.name,
              userID: user.userID
            })
          })
          messenger.threads.set(thread.threadID, {
            threadID: thread.threadID,
            name: thread.name,
            isGroup: thread.isGroup,
            nicknames,
            imageSrc: thread.imageSrc
          })
        })
        log.silly('login: messenger threads', messenger.threads)
        log.silly('login: messenger senders', messenger.senders)
        fs.writeFile(path.join(config.path, 'appstate.json'), JSON.stringify(api.getAppState()), e => resolve(api))
      })
    })
  })
}
