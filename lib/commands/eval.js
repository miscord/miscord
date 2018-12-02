const Command = require('./Command')
// shamelessly stolen from takidelfin/8rniczka
// full credits to @takidelfin

module.exports = new Command({
  argc: 1,
  usage: `eval <code>`,
  example: `eval config.messenger.whitelist = ['123']`,
  allowMoreArguments: true
}, (argv, reply) => {
  try {
    const code = argv.join(' ')
    let evaled = eval(code) // eslint-disable-line

    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
    if (evaled.length >= 2000) {
      for (let i = 0; i < evaled.length; i += 2000) {
        reply(evaled.substring(i, i + 2000), { code: true })
      }
      return
    }
    reply(evaled, { code: 'xl' })
  } catch (err) {
    const embed = {
      title: 'Miscord eval() error',
      description: 'Whoops, looks like eval() died :(\n```\n' + clean(err) + '\n```',
      color: 16741749
    }
    reply({ embed })
  }
})

const clean = text => typeof text === 'string' ? text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) : text
