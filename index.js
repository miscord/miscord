const sendError = require('./lib/error.js')
const login = require('./lib/login.js')
const getChannel = require('./lib/getChannel.js')
const createEmbed = require('./lib/createEmbed.js')
const recreateEmbed = require('./lib/recreateEmbed.js')
const removeAccents = require('remove-accents')
const emojiStrip = require('emoji-strip')
const log = require('npmlog')
var facebook, discord, guild, config

login().then(e => {
  // save login results as globals
  ({ facebook, discord, guild, config } = e)

  // set log level based on config
  log.level = config.logLevel

  // when got a discord message
  discord.on('message', discordListener)

  // when got a facebook message
  facebook.listen(facebookListener)
}).catch(sendError)

function discordListener (message) {
  log.verbose('discordListener', 'got a discord message')
  log.silly('discordListener', 'Message:', message)
  // don't want to echo bot's messages
  log.verbose('discordListener', '%s (author username) should not be equal to %s (bot username)', message.author.username, discord.user.username)
  if (message.author.username === discord.user.username) return

  // make sure this channel is meant for the bot
  log.verbose('discordListener', '%s (numeric channel topic) should be equal to %s (channel topic)', parseInt(message.channel.topic, 10).toString(), message.channel.topic)
  if (parseInt(message.channel.topic, 10).toString() !== message.channel.topic) return

  // make sure it's bot's category
  if (message.channel.parent && message.channel.parent.name !== config.discord.category.name) return

  // copy message content to a new variable, as the cleanContent property is read-only
  var content = message.cleanContent
  log.verbose('discordListener', 'Clean content:', content)

  // parse embed into plaintext
  if (message.embeds.length > 0) {
    message.embeds.forEach(embed => {
      if (embed.title) content += '\n' + embed.title
      if (embed.url) content += '\n(' + embed.url + ')'
      if (embed.description) content += '\n' + embed.description
      embed.fields.forEach(field => { content += '\n\n' + field.name + '\n' + field.value })
    })
    log.verbose('discordListener', 'Message content after parsing embed:', content)
  }

  // build message with attachments provided
  var username = message.member ? (message.member.nickname || message.author.username) : message.author.username
  log.verbose('discordListener', 'Username:', username)
  var msg = {
    body: config.facebook.showUsername ? (config.facebook.boldUsername ? `*${username}*: ${content}` : `${username}: ${content}`) : content,
    url: message.attachments.size > 0 ? message.attachments.first().url : (message.embeds.length > 0 ? message.embeds[0].image : undefined)
  }
  log.silly('discordListener', 'Message:', msg)
  log.verbose('discordListener', 'Channel topic:', message.channel.topic)

  // send message to thread with ID specified in topic
  facebook.sendMessage(msg, message.channel.topic)
}

function facebookListener (error, message) {
  if (error) return log.error('facebookListener', error)
  log.verbose('facebookListener', 'Got a Facebook message')
  log.silly('facebookListener', 'Facebook message: %o', message)

  // get thread info to know if it's a group conversation
  facebook.getThreadInfoGraphQL(message.threadID, (err, thread) => {
    if (err) return log.error('facebookListener', err)
    log.verbose('facebookListener', 'Got Facebook thread')
    log.silly('facebookListener', 'Thread:', thread)

    // also get sender info because we need it if it's a group
    facebook.getUserInfo(message.senderID, (err, sender) => {
      if (err) return log.error('facebookListener', err)
      log.verbose('facebookListener', 'Got user info')
      log.silly('facebookListener', 'Sender:', sender)

      // get sender's nickname
      var nickname = thread.nicknames[message.senderID]
      log.verbose('facebookListener', 'Nickname:', nickname)

      // get thread name / user
      var name = thread.threadType === 'one_to_one' ? (nickname || sender[message.senderID].name) : (thread.threadName || thread.threadID)
      log.verbose('facebookListener', 'Channel name (before clean):', name)

      // clean name for the needs of discord channel naming
      var cleanname = emojiStrip(removeAccents(name)).trim().replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()
      log.verbose('facebookListener', 'Clean channel name:', cleanname)

      // handle white/blacklist
      var { whitelist, blacklist } = config.facebook.filter
      log.silly('facebookListener', 'Whitelist:', whitelist)
      log.silly('facebookListener', 'Blacklist:', blacklist)
      if (whitelist.length > 0 && !(whitelist.includes(cleanname) || whitelist.includes(message.threadID))) return log.verbose('Ignoring %s (%s) due to whitelist', cleanname, message.threadID)
      if (blacklist.length > 0 && (blacklist.includes(cleanname) || blacklist.includes(message.threadID))) return log.verbose('Ignoring %s (%s) due to blacklist', cleanname, message.threadID)

      // set options for creating message
      var opts = {thread, sender: sender[message.senderID], message}
      log.silly('facebookListener', 'Message options:', opts)

      // build message from template
      var m = createEmbed(opts)
      log.silly('facebookListener', 'Embed:', m)

      // get channel and send the message
      getChannel({
        guild: guild,
        name: cleanname,
        config: config,
        topic: message.threadID
      }).then(async channel => {
        log.verbose('facebookListener', 'Got Discord channel')

        // if it's a new channel, just send it already
        if (!channel.lastMessageID) return channel.send(m)
        // fetch the last message
        var messages = await channel.fetchMessages({limit: 1})
        var lastMessage = messages.first()
        log.silly('facebookListener', 'Last message:', lastMessage)

        // if the last message was sent by the same person and doesn't contain image
        if (
          lastMessage &&
          lastMessage.embeds[0] &&
          lastMessage.embeds[0].author &&
          lastMessage.embeds[0].author.name === m.author.name &&
          !lastMessage.embeds[0].image &&
          !opts.message.attachments.length > 0
        ) {
          log.verbose('Editing existing message')
          if (config.discord.sendNotifications) channel.send(m).then(mess => mess.delete()) // ugly workaround to send notification

          // get the last embed
          var lastEmbed = lastMessage.embeds[0]
          log.silly('facebookListener', 'Last embed:', lastEmbed)

          // recreate last embed to add new text due to discord.js
          var recreatedEmbed = recreateEmbed(lastEmbed).setDescription(lastEmbed.description + '\n' + m.description)
          log.silly('facebookListener', 'Recreated embed:', recreatedEmbed)

          // update message body with the new text
          lastMessage.edit(recreatedEmbed)
        } else {
          log.verbose('facebookListener', 'Sending new message')
          channel.send(m)
        }
      }).catch(sendError)
    })
  })
}
