const log = require('npmlog')

const sendError = require('../error')

const { createMessage, getChannel, handleMentions } = require('../discord')
const { filter, getChannelName, getSender, getThread } = require('../messenger')
const handleEvent = require('../messenger/handleEvent')
var reconnecting

module.exports = async opts => {
  try {
    var { config, message, error } = opts
    if (error) return log.error('messengerListener', error)

    if (!message) {
      log.error('messengerListener', 'Message is undefined/null, internet connection may be unavailable')
      log.info('messengerListener', 'Reconnecting...')
      if (reconnecting) return
      reconnecting = true
      return require('../login/messenger')(config).then(api => {
        log.info('messengerListener', 'Reconnected to Facebook')
        config.messenger.client = api
        api.listen((err, message) => module.exports({config, err, message}))
        reconnecting = false
      })
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

    var cleanname = getChannelName(thread, sender, message)

    // handle white/blacklist
    if (!filter(config, cleanname, message.threadID)) return

    // build message from template
    var m = createMessage(thread, sender, message, config.discord.showFullNames)
    m[0] = handleMentions(config, m[0])
    log.silly('messengerListener: pending message', m)

    // get channel and send the message
    getChannel({
      name: cleanname,
      config: config,
      topic: message.threadID
    }).then(async channel => {
      log.verbose('messengerListener', 'Got Discord channel')

      // find / create a webhook
      var webhook = config.discord.webhooks.find('name', `Miscord #${cleanname}`)
      if (!webhook) {
        webhook = await channel.createWebhook(`Miscord #${cleanname}`, thread.imageSrc || 'https://miscord.js.org/img/icon.png')
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
