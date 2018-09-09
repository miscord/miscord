const Command = require('./Command')

module.exports = new Command((_, reply) => connections.print((m, opts) => reply(m, opts)))
