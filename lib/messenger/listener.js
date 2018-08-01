const log = require('npmlog')
const url = require('url')
const sendError = require('../error')

const { createMessage, handleMentions } = require('../discord')
const { createMessage: createFBMessage, filter, getChannelName, getSender, getThread } = require('./')
const handleEvent = require('../messenger/handleEvent')
var reconnecting

module.exports = async (error, message) => {
  if (error || !message) {
    log.error('messengerListener', 'Error occured, internet connection may be unavailable')
    log.info('messengerListener', 'Reconnecting in 5s...')
    if (reconnecting) return
    reconnecting = true
    setTimeout(() => {
      log.info('messengerListener', 'Reconnecting...')
      config.messenger.stopListening()
      return require('./login')().then(api => {
        log.info('messengerListener', 'Reconnected to Facebook')
        config.messenger.client = api
        config.messenger.stopListening = api.listen((err, message) => module.exports({config, err, message}))
        reconnecting = false
      })
    }, 5000)
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

  if (message.body.startsWith('m!keep')) return

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

  // get channel
  const channel = await config.channels.getChannel(message.threadID, cleanname)
  if (!channel) return
  log.verbose('messengerListener', 'Got Discord channel')

  const link = config.channels.getThreadIDs(channel.id)

  // find / create a webhook
  var webhook = config.discord.webhooks.find('channelID', channel.id)
  if (!webhook) {
    webhook = await channel.createWebhook(`Miscord #${cleanname}`.substr(0, 32), thread.imageSrc || 'https://miscord.net/img/icon.png')
    config.discord.webhooks.set(webhook.id, webhook)
  }
  log.silly('messengerListener: webhook', webhook)

  log.verbose('messengerListener', 'Sending the message')
  const sentMessage = await webhook.send(...m)

  log.verbose('messengerListener', 'Sent message on Discord')
  log.silly('messengerListener: sent message', sentMessage)

  // check if it needs resending (linked channels)
  if (link.length > 1) {
    let nickname = thread.nicknames[message.senderID]
    let authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name
    let msg = {
      body: createFBMessage(authorName, sentMessage.content, getChannelName(thread, sender, message, false)),
      attachment: await Promise.all(sentMessage.attachments.map(attach => attach.url).filter(el => el).map(getStreamFromURL))
    }
    link
      .filter(id => id !== message.threadID)
      .forEach(threadID => config.messenger.client.sendMessage(msg, threadID, (err, info) => sentMessageCallback(err, info, threadID, msg)))
  }
}

function getStreamFromURL (attachURL) {
  return new Promise((resolve, reject) => require(url.parse(attachURL).protocol.replace(':', '')).get(attachURL, res => resolve(res)))
}

function sentMessageCallback (err, info, threadID, message) {
  log.verbose('messengerListener', 'Sent message on Messenger')
  if (err) {
    if (err.code === 'ESOCKETTIMEDOUT') {
      return config.messenger.client.sendMessage(message, threadID, (err, info) => sentMessageCallback(err, info, threadID, message))
    } else sendError(err)
  }
  if (info) log.silly('messengerListener: sent message info', info)
}
