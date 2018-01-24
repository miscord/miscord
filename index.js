const Discord = require('discord.js')
const sendError = require('./lib/error.js')
const login = require('./lib/login.js')
const getChannel = require('./lib/getChannel.js')
const removeAccents = require('remove-accents')
var facebook, discord, guild, category

login().then(e => {
  // save login results as globals
  facebook = e.facebook
  discord = e.discord
  guild = e.guild
  category = e.category

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

  // build message with attachments provided
  var msg = message.attachments.size > 0 ? {body: message.author.username + ': ' + message.content, url: message.attachments.first().url} : {body: message.author.username + ': ' + message.content}

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
      var name = thread.threadType === 'one_to_one' ? sender[message.senderID].name : thread.threadName ? thread.threadName : thread.threadID
      // clean name for the needs of discord channel naming
      var cleanname = removeAccents(name).replace(/ /g, '-').replace(/\W-/g, '').replace(/[^\x00-\x7F]/g, '').toLowerCase()

      // build message from template
      var m = createMessage(thread, sender[message.senderID], message)

      // get channel and send the message
      getChannel(guild, cleanname, category, message.threadID).then(channel => channel.send(m))
    })
  })
}

// function creating message from template
function createMessage (thread, sender, message) {
  if (thread.threadType === 'one_to_one') {
    // if it's not a group:
    // if there are no attachments, return plaintext message
    if (message.attachments.length === 0) return message.body
    var attach = message.attachments[0]

    // if there are attachments, set title to message body
    var embed = new Discord.RichEmbed().setTitle(message.body)

    // if it's image, then embed it
    if (attach.type === 'photo') return embed.setImage(message.attachments[0].url)

    // if it's not image, simply attach file
    return embed.attachFile(attach.url)
  } else {
    var attach = message.attachments
    // set description to message body, set author to message sender
    var embed = new Discord.RichEmbed().setDescription(message.body).setAuthor(sender.name, sender.thumbSrc)

    // if there are no attachments, send it already
    if (attach.length === 0) return embed

    // if it's image, then embed it
    if (attach[0].type === 'photo') return embed.setImage(attach[0].url)

    // if it's not image, simply attach file
    return embed.attachFile(attach.url)
  }
}
