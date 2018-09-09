const log = require('npmlog')
const url = require('url')

const { createMessage, sendMessage } = require('../discord')
const { createMessage: createFBMessage, filter, getChannelName, getSender, getThread } = require('./')
const handleEvent = require('./handleEvent')
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
      messenger.stopListening()
      return require('../login/messenger')(config).then(api => {
        log.info('messengerListener', 'Reconnected to Facebook')
        messenger.client = api
        messenger.stopListening = api.listen((err, message) => module.exports({config, err, message}))
        reconnecting = false
      })
    }, 10000)
    return
  }

  log.silly('messengerListener: message', message)

  if (!messenger.alreadyHandled) messenger.alreadyHandled = []
  if (messenger.alreadyHandled.includes(message.messageID)) return log.verbose('messengerListener', 'Possible duplicate message, ignoring')
  if (messenger.alreadyHandled.length > 20) messenger.alreadyHandled.splice(20)
  messenger.alreadyHandled.push(message.messageID)

  log.verbose('messengerListener', 'Got Messenger event, type:', message.type)
  if (message.type !== 'event' && message.type !== 'message') return
  if (message.type === 'event') return handleEvent(message)
  log.info('messengerListener', 'Got a Messenger message')

  if (message.body.toLowerCase().startsWith('m!keep')) return

  // get thread info to know if it's a group conversation
  var thread = await getThread(message.threadID)
  log.verbose('messengerListener', 'Got Messenger thread')
  log.silly('messengerListener: thread', thread)

  // also get sender info
  var sender = await getSender(message.senderID)
  log.verbose('messengerListener', 'Got user info')
  log.silly('messengerListener: sender', sender)

  var cleanname = await getChannelName(thread)

  // handle white/blacklist
  if (!filter(cleanname, message.threadID)) return

  // build message from template
  var m = createMessage(thread, sender, message)
  log.silly('messengerListener: pending message', m)

  // get channel
  const channels = await connections.getChannels(message.threadID, cleanname)
  if (!channels || !channels.length) return
  log.verbose('messengerListener', 'Got Discord channels')

  const sentMessages = await Promise.all(channels.map(channel => sendMessage(channel, cleanname, m, thread.imageSrc)))

  // check if it needs resending (linked channels)
  const threads = connections.getThreads(message.threadID).filter(id => id !== message.threadID)
  if (threads.length) {
    const nickname = thread.nicknames[message.senderID]
    const authorName = nickname ? (config.discord.showFullNames ? `${nickname} (${sender.name})` : nickname) : sender.name
    const msg = {
      body: createFBMessage(sentMessages[0].content, authorName, await getChannelName(thread, false)),
      attachment: await Promise.all(sentMessages[0].attachments.map(attach => attach.url).filter(el => el).map(getStreamFromURL))
    }
    threads.forEach(threadID => messenger.client.sendMessage(msg, threadID, sentMessageCallback))
  }
}

function getStreamFromURL (attachURL) {
  return new Promise((resolve, reject) => require(url.parse(attachURL).protocol.replace(':', '')).get(attachURL, res => resolve(res)))
}

function sentMessageCallback (err, info) {
  log.verbose('discordListener', 'Sent message on Messenger')
  if (err) return require('../error')(err)
  if (info) log.silly('discordListener: sent message info', info)
}
