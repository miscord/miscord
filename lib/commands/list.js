const Command = require('./Command')

module.exports = new Command((_, reply) => reply({embed: {description: channels.getPrintable()}}))
