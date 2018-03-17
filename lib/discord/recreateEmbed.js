const Discord = require('discord.js')
module.exports = messageEmbed => new Discord.RichEmbed()
  .setDescription(messageEmbed.description || '')
  .setAuthor(messageEmbed.author.name, messageEmbed.author.iconURL)
