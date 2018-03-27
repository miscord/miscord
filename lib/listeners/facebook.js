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
  if (error) return log.error('facebookListener', error)
  log.info('facebookListener', 'Got a Facebook message')
  log.silly('facebookListener: message', message)

  // get thread info to know if it's a group conversation
  var thread
  if (config.facebook.threads.has(message.threadID)) {
    log.verbose('facebookListener', 'Facebook thread cached')
    thread = config.facebook.threads.get(message.threadID)
  } else {
    thread = await promisify(config.facebook.client.getThreadInfo)(message.threadID)
    config.facebook.threads.set(message.threadID, thread)
  }
  log.verbose('facebookListener', 'Got Facebook thread')
  log.silly('facebookListener: thread', thread)

  // also get sender info
  var sender
  if (config.facebook.senders.has(message.senderID)) {
    log.verbose('facebookListener', 'Facebook sender cached')
    sender = config.facebook.senders.get(message.senderID)
  } else {
    sender = await promisify(config.facebook.client.getUserInfo)(message.senderID)
    config.facebook.senders.set(message.senderID, sender)
  }
  log.verbose('facebookListener', 'Got user info')
  log.silly('facebookListener: sender', sender)

  // get sender's nickname
  var nickname = thread.nicknames[message.senderID]
  log.verbose('facebookListener: nickname', nickname)

  // get thread name / user
  var name = thread.isGroup ? (thread.threadName || thread.threadID) : (nickname || sender[message.senderID].name)
  log.verbose('facebookListener: raw channel name', name)

  // clean name for the needs of discord channel naming
  var cleanname = emojiStrip(removeAccents(name)).trim().replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()
  log.verbose('facebookListener: clean channel name', cleanname)

  // handle white/blacklist
  var { whitelist, blacklist } = config.facebook.filter
  log.silly('facebookListener: whitelist', whitelist)
  log.silly('facebookListener: blacklist', blacklist)
  if (whitelist.length > 0 && !(whitelist.includes(cleanname) || whitelist.includes(message.threadID.toString()))) return log.verbose('Ignoring %s (%s) due to whitelist', cleanname, message.threadID)
  if (blacklist.length > 0 && (blacklist.includes(cleanname) || blacklist.includes(message.threadID.toString()))) return log.verbose('Ignoring %s (%s) due to blacklist', cleanname, message.threadID)

  // set options for creating message
  var mopts = {thread, sender: sender[message.senderID], message}

  // build message from template
  var m = config.discord.noEmbeds ? createMessage(mopts) : createEmbed(mopts)
  log.silly('facebookListener: message', m)

  // get channel and send the message
  getChannel({
    name: cleanname,
    config: config,
    topic: message.threadID
  }).then(async channel => {
    log.verbose('facebookListener', 'Got Discord channel')

    // if it's a new channel, just send it already
    if (!channel.lastMessageID) return config.discord.noEmbeds ? (m.length === 1 ? channel.send(m[0]) : channel.send(m[0], m[1])) : channel.send(m)

    // fetch the last message
    var messages = await channel.fetchMessages({limit: 1})
    var lastMessage = messages.first()
    log.silly('facebookListener: last message', lastMessage)

    // if the last message was sent by the same person and doesn't contain image
    if (
      !config.discord.noEmbeds &&
      lastMessage &&
      lastMessage.embeds[0] &&
      lastMessage.embeds[0].author &&
      lastMessage.embeds[0].author.name === m.author.name &&
      !lastMessage.embeds[0].image &&
      !opts.message.attachments.length > 0
    ) {
      log.verbose('facebookListener', 'Editing existing message')
      if (config.discord.sendNotifications) channel.send(m).then(mess => mess.delete()) // ugly workaround to send notification

      // get the last embed
      var lastEmbed = lastMessage.embeds[0]
      log.silly('facebookListener: last embed', lastEmbed)

      // recreate last embed to add new text due to discord.js
      var recreatedEmbed = recreateEmbed(lastEmbed).setDescription(lastEmbed.description + '\n' + m.description)
      log.silly('facebookListener: recreated embed', recreatedEmbed)

      // update message body with the new text
      lastMessage.edit(recreatedEmbed)
    } else {
      log.verbose('facebookListener', 'Sending new message')
      config.discord.noEmbeds ? (m.length === 1 ? channel.send(m[0]) : channel.send(m[0], m[1])) : channel.send(m)
    }
  }).catch(sendError)
}
