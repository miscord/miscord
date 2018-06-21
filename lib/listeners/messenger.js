const log = require('npmlog')

const { createMessage, handleMentions } = require('../discord')
const { createMessage: createFBMessage, filter, getChannelName, getSender, getThread } = require('../messenger')
const handleEvent = require('../messenger/handleEvent')
var reconnecting

module.exports = async (error, message) => {
  if (error) throw error

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

  if (!config.messenger.alreadyHandled) config.messenger.alreadyHandled = []
  if (config.messenger.alreadyHandled.includes(message.messageID)) return log.verbose('messengerListener', 'Possible duplicate message, ignoring')
  if (config.messenger.alreadyHandled.length > 100) config.messenger.alreadyHandled.splice(100)
  config.messenger.alreadyHandled.push(message.messageID)

  log.verbose('messengerListener', 'Got Messenger event, type:', message.type)
  if (message.type !== 'event' && message.type !== 'message') return
  if (message.type === 'event') return handleEvent(message)
  log.info('messengerListener', 'Got a Messenger message')
  log.silly('messengerListener: message', message)

  // get thread info to know if it's a group conversation
  var thread = await getThread(message.threadID)
  log.verbose('messengerListener', 'Got Messenger thread')
  log.silly('messengerListener: thread', thread)

  // also get sender info
  var sender = await getSender(message.senderID)
  log.verbose('messengerListener', 'Got user info')
  log.silly('messengerListener: sender', sender)

  var cleanname = getChannelName(thread, sender, message)

  // handle white/blacklist
  if (!filter(cleanname, message.threadID)) return

  // build message from template
  var m = createMessage(thread, sender, message, config.discord.showFullNames)
  m[0] = handleMentions(m[0])
  log.silly('messengerListener: pending message', m)

  var link = Object.entries(config.messenger.link).find(entry => entry.reduce((acc, val) => acc.concat(val), []).includes(message.threadID))

  // get channel and send the message
  config.channels.getChannel(message.threadID, cleanname, Boolean(link)).then(async channel => {
    log.verbose('messengerListener', 'Got Discord channel')

    // find / create a webhook
    var webhook = config.discord.webhooks.find('channelID', channel.id)
    if (!webhook) {
      webhook = await channel.createWebhook(`Miscord #${cleanname}`.substr(0, 32), thread.imageSrc || 'https://miscord.net/img/icon.png')
      config.discord.webhooks.set(webhook.id, webhook)
    }
    log.silly('messengerListener: webhook', webhook)

    log.verbose('messengerListener', 'Sending the message')
    webhook.send(...m).then(async sentMessage => {
      log.verbose('messengerListener', 'Sent message on Discord')
      log.silly('messengerListener: sent message', sentMessage)
      // check if it needs resending (linked channels)
      if (link) {
        let nickname = thread.nicknames[message.senderID]
        let authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name
        let msg = {
          body: createFBMessage(authorName, message.body, getChannelName(thread, sender, message, false)),
          attachment: await Promise.all(sentMessage.attachments.map(attach => attach.url).filter(el => el).map(getStreamFromURL))
        }
        link.reduce((acc, val) => acc.concat(val), []).filter(id => id !== message.threadID).forEach(threadID => config.messenger.client.sendMessage(msg, threadID))
      }
    })
  })
}

function getStreamFromURL (url) {
  return new Promise((resolve, reject) => require('https').get(url, res => resolve(res)))
}
