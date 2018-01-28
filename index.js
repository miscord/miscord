const Discord = require('discord.js')
const sendError = require('./lib/error.js')
const login = require('./lib/login.js')
const getChannel = require('./lib/getChannel.js')
const removeAccents = require('remove-accents')
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
      var cleanname = removeAccents(name).replace(/ /g, '-').replace(/\W-/g, '').replace(/(?![a-zA-Z0-9\-_])/g, '').toLowerCase()

      // build message from template
      var m = createMessage(thread, sender[message.senderID], message)

      // get channel and send the message
      getChannel({
        guild: guild,
        name: cleanname,
        config: config,
        topic: message.threadID
      }).then(channel => channel.send(m)).catch(sendError)
    })
  })
}

// function creating message from template
function createMessage (thread, sender, message) {
  var attach = message.attachments

  // set description to message body, set author to message sender
  var nickname = thread.nicknames[message.senderID]
  var authorName = nickname ? nickname + ` (${sender.name})` : sender.name
  var embed = new Discord.RichEmbed()
    .setDescription(message.body)
    .setAuthor(authorName, sender.thumbSrc)

  // if there are no attachments, send it already
  if (attach.length === 0) return embed

  // if it's an image, then embed it
  if (attach[0].type === 'photo') return embed.setImage(attach[0].url)

  // if it's not an image, simply attach the file
  return embed.attachFile(attach[0].url)
}
