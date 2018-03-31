const log = require('npmlog')
const { promisify } = require('util')

const removeAccents = require('remove-accents')
const emojiStrip = require('emoji-strip')

const sendError = require('../error.js')

const getChannel = require('../discord/getChannel.js')
const createEmbed = require('../discord/createEmbed.js')
const createMessage = require('../discord/createMessage.js')
const recreateEmbed = require('../discord/recreateEmbed.js')

module.exports = async opts => {
  var { config, message, error } = opts
  if (error) return log.error('messengerListener', error)
  if (!message) return log.error('messengerListener', 'Message is undefined/null, internet connection may be unavailable')
  log.info('messengerListener', 'Got a Messenger message')
  log.silly('messengerListener: message', message)

  // get thread info to know if it's a group conversation
  var thread
  if (config.messenger.threads.has(message.threadID)) {
    log.verbose('messengerListener', 'Messenger thread cached')
    thread = config.messenger.threads.get(message.threadID)
  } else {
    thread = await promisify(config.messenger.client.getThreadInfo)(message.threadID)
    config.messenger.threads.set(message.threadID, thread)
  }
  log.verbose('messengerListener', 'Got Messenger thread')
  log.silly('messengerListener: thread', thread)

  // also get sender info
  var sender
  if (config.messenger.senders.has(message.senderID)) {
    log.verbose('messengerListener', 'Messenger sender cached')
    sender = config.messenger.senders.get(message.senderID)
  } else {
    sender = await promisify(config.messenger.client.getUserInfo)(message.senderID)
    config.messenger.senders.set(message.senderID, sender)
  }
  log.verbose('messengerListener', 'Got user info')
  log.silly('messengerListener: sender', sender)

  // get sender's nickname
  var nickname = thread.nicknames[message.senderID]
  log.verbose('messengerListener: nickname', nickname)

  // get thread name / user
  var name = thread.isGroup ? (thread.threadName || thread.threadID) : (nickname || sender[message.senderID].name)
  log.verbose('messengerListener: raw channel name', name)

  // clean name for the needs of discord channel naming
  var cleanname = emojiStrip(removeAccents(name)).trim().replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()
  log.verbose('messengerListener: clean channel name', cleanname)

  // handle white/blacklist
  var { whitelist, blacklist } = config.messenger.filter
  log.silly('messengerListener: whitelist', whitelist)
  log.silly('messengerListener: blacklist', blacklist)
  if (whitelist.length > 0 && !(whitelist.includes(cleanname) || whitelist.includes(message.threadID.toString()))) return log.verbose('Ignoring %s (%s) due to whitelist', cleanname, message.threadID)
  if (blacklist.length > 0 && (blacklist.includes(cleanname) || blacklist.includes(message.threadID.toString()))) return log.verbose('Ignoring %s (%s) due to blacklist', cleanname, message.threadID)

  // set options for creating message
  var mopts = {thread, sender: sender[message.senderID], message}

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
      lastMessage.attachments.length === 0 &&

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
      var recreatedEmbed = recreateEmbed(lastEmbed).setDescription(lastEmbed.description + '\n' + m.description)
      log.silly('messengerListener: recreated embed', recreatedEmbed)

      // update message body with the new text
      lastMessage.edit(recreatedEmbed)
    } else {
      log.verbose('messengerListener', 'Sending new message')
      channel.send(...m)
    }
  }).catch(sendError)
}
