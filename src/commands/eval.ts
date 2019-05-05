import util from 'util'
import Command from './Command'

export default new Command(async (argv, reply) => {
  try {
    const code = argv.join(' ')
    // tslint:disable-next-line:no-eval
    let evaled = eval(code)

    if (typeof evaled !== 'string') evaled = util.inspect(evaled)
    evaled = evaled.length > 1000 ? evaled.match(/[\s\S]{1,1000}/g) : [evaled]
    for (let part of evaled) await reply(part, { code: true })
  } catch (err) {
    reply(util.inspect(err), { code: true })
  }
}, {
  argc: 1,
  usage: `eval <code>`,
  example: `eval config.ignoredSequences = ['ddd']`,
  allowMoreArguments: true
})
