const Messenger = require('facebook-chat-api')
const log = require('npmlog')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

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
    Messenger(obj, options, async (err, api) => {
      if (err) {
        if (err.error !== 'login-approval') return reject(err)
        log.info('login', 'Login approval pending...')
        let loginApprovalChannel = discord.commandChannel || discord.client.channels.find(channel => channel.name === 'login-approval')
        if (!loginApprovalChannel) {
          loginApprovalChannel = await discord.guilds[0].createChannel('login-approval', 'text')
          await loginApprovalChannel.overwritePermissions(discord.guilds[0].roles.find(role => role.name === '@everyone').id, { VIEW_CHANNEL: false })
        }
        loginApprovalChannel.send('Enter code:')

        const codeListener = message => {
          if (loggedin ||
            message.channel.id !== loginApprovalChannel.id ||
            message.author.username === discord.client.user.username) return
          log.verbose('login', 'Got FB approval code: %s', message.content)
          err.continue(message.content)
          message.channel.send('Code received.')
          loggedin = true
          discord.client.removeListener('message', codeListener)
        }
        discord.client.on('message', codeListener)
        return
      }
      global.messenger = { client: api }
      const threads = await promisify(api.getThreadList)(20, null, [])
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
}
