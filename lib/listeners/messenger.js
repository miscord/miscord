const log = require('npmlog')
const url = require('url')

const sendError = require('../error')

const { createMessage, getChannel, handleMentions } = require('../discord')
const { createMessage: createFBMessage, filter, getChannelName, getSender, getThread } = require('../messenger')
const handleEvent = require('../messenger/handleEvent')
var reconnecting

module.exports = async opts => {
  try {
    var { config, message, error } = opts
    if (error) return log.error('messengerListener', error)

    if (!message) {
      log.error('messengerListener', 'Message is undefined/null, internet connection may be unavailable')
      log.info('messengerListener', 'Reconnecting in 10s...')
      if (reconnecting) return
      reconnecting = true
      setTimeout(() => {
        log.info('messengerListener', 'Reconnecting...')
        config.messenger.stopListening()
        return require('../login/messenger')(config).then(api => {
          log.info('messengerListener', 'Reconnected to Facebook')
          config.messenger.client = api
          config.messenger.stopListening = api.listen((err, message) => module.exports({config, err, message}))
          reconnecting = false
        })
      }, 10000)
      return
    }

    log.verbose('messengerListener', 'Got Messenger event, type:', message.type)
    if (message.type !== 'event' && message.type !== 'message') return
    if (message.type === 'event') return handleEvent(opts)
    log.info('messengerListener', 'Got a Messenger message')
    log.silly('messengerListener: message', message)

    // get thread info to know if it's a group conversation
    var thread = await getThread(config, message.threadID)
    log.verbose('messengerListener', 'Got Messenger thread')
    log.silly('messengerListener: thread', thread)

    // also get sender info
    var sender = await getSender(config, message.senderID)
    log.verbose('messengerListener', 'Got user info')
    log.silly('messengerListener: sender', sender)

    // check if it needs resending (linked channels)
    let link = Object.entries(config.messenger.link).find(entry => entry.reduce((acc, val) => acc.concat(val), []).includes(message.threadID))
    if (link) {
      let nickname = thread.nicknames[message.senderID]
      let authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name
      let msg = {
        body: createFBMessage(config, authorName, message.body, getChannelName(thread, sender, message, false))
      }
      link.reduce((acc, val) => acc.concat(val), []).filter(id => id !== message.threadID).forEach(threadID => {
        config.messenger.client.sendMessage(msg, threadID)
        message.attachments.map(attachment => {
          var baseURL = attachment.image || attachment.url
          return baseURL ? url.parse(baseURL, true).pathname === '/safe_image.php' ? url.parse(baseURL, true).query.url : baseURL : undefined
        }).filter(el => el).forEach(url => {
          config.messenger.client.sendMessage({ url }, threadID)
        })
      })
    }

    var cleanname = getChannelName(thread, sender, message)

    // handle white/blacklist
    if (!filter(config, cleanname, message.threadID)) return

    // build message from template
    var m = createMessage(thread, sender, message, config.discord.showFullNames)
    m[0] = handleMentions(config, m[0])
    log.silly('messengerListener: pending message', m)

    // get channel and send the message
    getChannel({
      config,
      name: cleanname,
      topic: message.threadID,
      isLinked: Boolean(link)
    }).then(async channel => {
      log.verbose('messengerListener', 'Got Discord channel')

      // find / create a webhook
      var webhook = config.discord.webhooks.find('channelID', channel.id)
      if (!webhook) {
        webhook = await channel.createWebhook(`Miscord #${cleanname}`.substr(0, 32), thread.imageSrc || 'https://miscord.js.org/img/icon.png')
        config.discord.webhooks.set(webhook.id, webhook)
      }
      log.silly('messengerListener: webhook', webhook)

      log.verbose('messengerListener', 'Sending the message')
      webhook.send(...m).then(message => log.silly('messengerListener: sent message', message))
    })
  } catch (e) {
    sendError(e)
  }
}
