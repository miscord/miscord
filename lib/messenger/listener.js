const log = logger.withScope('messenger:listener')

const createMessage = require('../createMessage').fromMessenger
const { sendMessage } = require('../discord')
const { filter, getChannelName, getSender, getThread } = require('./')
const handleEvent = require('./handleEvent')
const handlePlan = require('./handlePlan')
let reconnecting

module.exports = async (error, message) => {
  if (error) throw error

  if (!message) {
    log.error('Message is undefined/null, internet connection may be unavailable')
    log.info('Reconnecting in 10s...')
    if (reconnecting) return
    reconnecting = true
    setTimeout(() => {
      log.info('Reconnecting...')
      messenger.stopListening()
      return require('../login/messenger')(config).then(api => {
        log.info('Reconnected to Facebook')
        messenger.client = api
        messenger.stopListening = api.listen((err, message) => module.exports({config, err, message}))
        reconnecting = false
      })
    }, 10000)
    return
  }

  log.trace('message', toStr(message))

  if (!messenger.alreadyHandled) messenger.alreadyHandled = []
  if (messenger.alreadyHandled.includes(message.messageID)) return log.debug('Possible duplicate message, ignoring')
  if (messenger.alreadyHandled.length > 20) messenger.alreadyHandled.splice(20)
  messenger.alreadyHandled.push(message.messageID)

  log.debug(`Got Messenger event, type: ${message.type}`)
  if (message.type === 'event') return handleEvent(message)
  if (message.type.startsWith('lightweight_event')) return handlePlan(message)
  if (message.type !== 'message') return
  log.info('Got a Messenger message')

  if (message.body.toLowerCase().startsWith('m!keep')) return

  // get thread info to know if it's a group conversation
  var thread = await getThread(message.threadID)
  log.debug('Got Messenger thread')
  log.trace('thread', toStr(thread))

  // also get sender info
  var sender = await getSender(message.senderID)
  log.debug('Got user info')
  log.trace('sender', toStr(sender))

  const cleanname = await getChannelName(thread)

  // handle whitelist
  if (!filter(cleanname, message.threadID)) return

  // get channel
  const channels = await connections.getChannels(message.threadID, cleanname)
  if (!channels || !channels.length) return
  log.debug('Got Discord channels')

  await Promise.all(channels.map(channel => sendMessage(channel, cleanname, createMessage.discord(thread, sender, message), thread.imageSrc)))

  // check if it needs resending (linked channels)
  const threads = connections.getThreads(message.threadID).filter(thread => thread.id !== message.threadID).filter(el => !el.readonly)
  if (threads.length) {
    threads.forEach(async _thread => messenger.client.sendMessage(await createMessage.messenger(thread, sender, message, cleanname), _thread.id, sentMessageCallback))
  }
}

function sentMessageCallback (err, info) {
  log.debug('Sent message on Messenger')
  if (err) return require('../error')(err)
  if (info) log.trace('sent message info', toStr(info))
}
