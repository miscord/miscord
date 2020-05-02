import util from 'util'
import Command from './Command'
import { splitString } from '../utils'
import { runInNewContext } from 'vm'

export default new Command(async ([ unsafe, ...argv ], reply) => {
  let evaled
  try {
    const code = argv.join(' ')
    if (!config.enableEval) {
      return '`eval` is disabled in the config, toggle `config.enableEval` to enable it'
    }
    if (unsafe === 'yes') {
      // eslint-disable-next-line no-eval
      evaled = eval(code)
    } else {
      evaled = runInNewContext(code, Object.create(null))
    }

    if (typeof evaled !== 'string') evaled = util.inspect(evaled)
  } catch (err) {
    evaled = util.inspect(err)
  }

  evaled = splitString(evaled, 1000)
  for (const part of evaled) await reply(part, { code: true })
}, {
  argc: 1,
  usage: 'eval <code>',
  example: 'eval config.ignoredSequences = [\'ddd\']',
  allowMoreArguments: true
})
