const Messenger = require('@miscord/facebook')
const log = logger.withScope('messenger:login')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

module.exports = () => {
  return new Promise((resolve, reject) => {
    let obj
    try {
      obj = {appState: require(path.join(config.path, 'appstate.json'))}
    } catch (err) {
      obj = {email: config.messenger.username, password: config.messenger.password}
    }
    const options = {forceLogin: config.messenger.forceLogin, logLevel: 'warn', listenEvents: config.discord.showEvents}
    log.start('Logging in to Facebook...')
    Messenger(obj, options, async (err, api) => {
      if (err) {
        if (err.error !== 'login-approval') return reject(err)
        log.warn('Login approval pending...')
        let loginApprovalChannel = discord.commandChannel || discord.client.channels.find(channel => channel.name === 'login-approval')
        if (!loginApprovalChannel) {
          loginApprovalChannel = await discord.guilds[0].createChannel('login-approval', 'text')
          await loginApprovalChannel.overwritePermissions(discord.guilds[0].roles.find(role => role.name === '@everyone').id, { VIEW_CHANNEL: false })
        }
        loginApprovalChannel.send('Enter code:')

        const codeListener = message => {
          if (message.channel.id !== loginApprovalChannel.id ||
            message.author.username === discord.client.user.username) return
          log.debug('Got FB approval code', message.content)
          err.continue(message.content)
          message.channel.send('Code received.')
          discord.client.removeListener('message', codeListener)
        }
        discord.client.on('message', codeListener)
        return
      }
      global.messenger = { client: api }
      log.success('Logged in to Facebook')
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
      log.trace('threads', toStr(messenger.threads))
      log.trace('senders', toStr(messenger.senders))
      fs.writeFile(path.join(config.path, 'appstate.json'), JSON.stringify(api.getAppState()), e => resolve(api))
    })
  })
}
