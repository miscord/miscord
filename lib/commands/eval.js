const Command = require('./Command')
// shamelessly stolen from takidelfin/8rniczka
// full credits to @takidelfin

module.exports = new Command({
  argc: 1,
  usage: `eval <code>`,
  example: `eval config.ignoredSequences = ['ddd']`,
  allowMoreArguments: true
}, async (argv, reply) => {
  try {
    const code = argv.join(' ')
    let evaled = eval(code) // eslint-disable-line

    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
    evaled = evaled.length > 1000 ? evaled.match(/[\s\S]{1,1000}/g) : [ evaled ]
    for (let part of evaled) {
      await reply(part, { code: true })
    }
  } catch (err) {
    const embed = {
      title: 'Miscord eval() error',
      description: 'Whoops, looks like eval() died :(\n```\n' + clean(err) + '\n```',
      color: 16741749
    }
    return { embed }
  }
})

const clean = text => typeof text === 'string' ? text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) : text
