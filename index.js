const Discord = require('discord.js')
const sendError = require('./lib/error.js')
const login = require('./lib/login.js')
const getChannel = require('./lib/getChannel.js')
const removeAccents = require('remove-accents')
const emojiStrip = require('emoji-strip')
var facebook, discord, guild, config

login().then(e => {
  // save login results as globals
  ({ facebook, discord, guild, config } = e)

  // when got a discord message
  discord.on('message', discordListener)

  // when got a facebook message
  facebook.listen(facebookListener)
}).catch(sendError)

function discordListener (message) {
  // don't want to echo bot's messages
  if (message.author.username === discord.user.username) return

  // make sure this channel is meant for the bot
  if (!parseInt(message.channel.topic, 10).toString() === message.channel.topic) return

  // make sure it's bot's category
  if (message.channel.parent.name !== config.discord.category.name) return

  // build message with attachments provided
  var msg = {
    body: config.discord.showUsername ? message.author.username + ': ' + message.content : message.content,
    url: message.attachments.size > 0 ? message.attachments.first().url : undefined
  }

  // send message to thread with ID specified in topic
  facebook.sendMessage(msg, message.channel.topic)
}

function facebookListener (error, message) {
  if (error) return console.error(error)
  // get thread info to know if it's a group conversation
  facebook.getThreadInfoGraphQL(message.threadID, (err, thread) => {
    if (err) return console.error(err)
    // also get sender info because we need it if it's a group
    facebook.getUserInfo(message.senderID, (err, sender) => {
      if (err) return console.error(err)
      // get name
      var nickname = thread.nicknames[message.senderID]
      var name = thread.threadType === 'one_to_one' ? (nickname || sender[message.senderID].name) : (thread.threadName || thread.threadID)
      // clean name for the needs of discord channel naming
      var cleanname = emojiStrip(removeAccents(name)).trim().replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()

      // set options for creating message
      var opts = {thread, sender: sender[message.senderID], message}

      // build message from template
      var m = createMessage(opts)

      // get channel and send the message
      getChannel({
        guild: guild,
        name: cleanname,
        config: config,
        topic: message.threadID
      }).then(channel => {
        // if it's a new channel, just send it already
        if (!channel.lastMessageID) return channel.send(m)
        // fetch the last message
        channel.fetchMessages({limit: 1}).then(lastMessage => {
          // if the last message was sent by the same person
          if (lastMessage.embeds[0] && lastMessage.embeds[0].author && lastMessage.embeds[0].author.name === m.author.name) {
            channel.send(m).then(mess => mess.delete()) // ugly workaround to send notification
            // get the last embed
            var lastEmbed = lastMessage.embeds[0]
            // update message body with the old text
            lastMessage.edit(recreateEmbed(lastEmbed).addField('\u200B', opts.message.body))
          } else {
            channel.send(m)
          }
        }).catch(sendError)
      }).catch(sendError)
    })
  })
}

// function creating message from template
function createMessage (opts) {
  var {thread, sender, message} = opts
  var attach = message.attachments

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? nickname + ` (${sender.name})` : sender.name
  var embed = new Discord.RichEmbed()
    .addField('\u200B', message.body)
    .setAuthor(authorName, sender.thumbSrc)

  // if there are no attachments, send it already
  if (attach.length === 0) return embed

  // if it's an image, then embed it
  if (attach[0].type === 'photo') return embed.setImage(attach[0].url)

  // if it's not an image, simply attach the file
  return embed.attachFile(attach[0].url)
}

function recreateEmbed (message) {
  var embed = new Discord.RichEmbed(message)
  //   .setDescription(message.description || '')
  //   .setAuthor(message.author)
  
  // if (message.image) embed.setImage(message.image)
  // if (message.url) embed.attachFile(message.url)

  return embed
}