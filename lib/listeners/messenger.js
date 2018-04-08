const log = require('npmlog')

const sendError = require('../error')

const { createEmbed, createMessage, getChannel, isMergeable, recreateEmbed } = require('../discord')
const { filter, getCleanName, getSender, getThread, handleEvent } = require('../messenger')

module.exports = async opts => {
  try {
    var { config, message, error } = opts
    if (error) return log.error('messengerListener', error)
    if (!message) return log.error('messengerListener', 'Message is undefined/null, internet connection may be unavailable')
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

    var cleanname = getCleanName(thread, sender, message)

    // handle white/blacklist
    if (!filter(config, cleanname, message)) return

    // set options for creating message
    var mopts = {thread, sender, message}

    // build message from template
    var m = config.discord.noEmbeds ? createMessage(mopts) : createEmbed(mopts)
    log.silly('messengerListener: message', m)

    // get channel and send the message
    getChannel({
      name: cleanname,
      config: config,
      topic: message.threadID
    }).then(async channel => {
      log.verbose('messengerListener', 'Got Discord channel')

      // if it's a new channel, just send it already
      if (!channel.lastMessageID) return channel.send(...m)

      // fetch the last message
      var messages = await channel.fetchMessages({limit: 1})
      var lastMessage = messages.first()
      log.silly('messengerListener: last message', lastMessage)

      if (isMergeable(config, m, lastMessage, opts)) {
        log.verbose('messengerListener', 'Editing existing message')
        if (config.discord.sendNotifications) channel.send(...m).then(mess => mess.delete()) // ugly workaround to send notification

        // get the last embed
        var lastEmbed = lastMessage.embeds[0]
        log.silly('messengerListener: last embed', lastEmbed)

        // recreate last embed to add new text due to discord.js
        var recreatedEmbed = recreateEmbed(lastEmbed).setDescription(lastEmbed.description + '\n' + m[0].embed.description)
        log.silly('messengerListener: recreated embed', recreatedEmbed)

        // update message body with the new text
        lastMessage.edit(recreatedEmbed)
      } else {
        log.verbose('messengerListener', 'Sending new message')
        channel.send(...m)
      }
    })
  } catch (e) {
    sendError(e)
  }
}
