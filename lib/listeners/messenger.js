const log = require('npmlog')

const sendError = require('../error.js')

const getChannel = require('../discord/getChannel.js')
const createEmbed = require('../discord/createEmbed.js')
const createMessage = require('../discord/createMessage.js')
const recreateEmbed = require('../discord/recreateEmbed.js')

const handleEvent = require('../messenger/handleEvent.js')
const getThread = require('../messenger/getThread.js')
const getSender = require('../messenger/getSender.js')
const getCleanName = require('../messenger/getCleanName.js')
const filter = require('../messenger/filter.js')

module.exports = async opts => {
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

  var cleanname = getCleanName({sender, thread, message})

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

    if (
      // embeds are enabled
      !config.discord.noEmbeds &&

      // there's an embed in current message
      m[0].embed &&

      // there is a "last message"
      lastMessage &&

      // the last message had embed
      lastMessage.embeds[0] &&

      // that embed had author
      lastMessage.embeds[0].author &&

      // last message's author is the same as current's
      lastMessage.embeds[0].author.name === m[0].embed.author.name &&

      // there was no picture in the embed
      !lastMessage.embeds[0].image &&

      // there were no attachments
      lastMessage.attachments.size === 0 &&

      // current message also has no attachmtents
      opts.message.attachments.length === 0 &&

      // there are no "message options"
      m.length === 1
    ) {
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
  }).catch(sendError)
}
