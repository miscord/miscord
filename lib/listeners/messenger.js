const log = require('npmlog')

const sendError = require('../error')

const { createEmbed, createMessage, getChannel, handleMentions, isMergeable, recreateEmbed } = require('../discord')
const { filter, getChannelName, getSender, getThread } = require('../messenger')
const handleEvent = require('../messenger/handleEvent')

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

    var cleanname = getChannelName(thread, sender, message)

    // handle white/blacklist

    // set options for creating message
    var mopts = {thread, sender, message}
    if (!filter(config, cleanname, message.threadID)) return

    // build message from template
    var m = config.discord.noEmbeds ? createMessage(mopts) : createEmbed(mopts)
    log.silly('messengerListener: message', m)

    // handle mentions
    if (config.discord.noEmbeds) {
      m[0] = handleMentions(config, m[0])
    } else {
      // m[0].embed.setDescription(handleMentions(config, m[0].embed.description))
      // another ugly workaround to mention people from embed, currently impossible (2018-04-11)
      m[1] = m[0]
      m[0] = handleMentions(config, m[0].embed.description, true)
    }

    // get channel and send the message
    getChannel({
      name: cleanname,
      config: config,
      topic: message.threadID
    }).then(async channel => {
      log.verbose('messengerListener', 'Got Discord channel')

      // if it's a new channel, just send it already
      if (!channel.lastMessageID) return channel.send(...m).then(message => log.silly('messengerListener: sent message', message))

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
        m[1].embed = recreateEmbed(lastEmbed).setDescription(lastEmbed.description + '\n' + m[1].embed.description)
        log.silly('messengerListener: recreated embed', m[1].embed)

        // update message body with the new text
        lastMessage.edit(...m)
      } else {
        log.verbose('messengerListener', 'Sending new message')
        channel.send(...m).then(message => log.silly('messengerListener: sent message', message))
      }
    })
  } catch (e) {
    sendError(e)
  }
}
