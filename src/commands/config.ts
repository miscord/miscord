import { runInNewContext } from 'vm'
import dotProp from 'dot-prop'
import Command from './Command'

export default new Command(async ([ key, ...value ]) => {
  if (!value.length) {
    const configValue = dotProp.get(config.config, key)
    return `\`config.${key}\` is set to \`${typeof configValue === 'string' ? configValue : JSON.stringify(configValue)}\``
  }

  let val: any = value.join(' ')

  if (val === 'true') val = true
  if (val === 'false') val = false
  if (/^`.+`$/.test(val)) {
    try {
      val = runInNewContext((val.match(/^`(.+)`$/) ?? [])[1], Object.create(null))
      if (!Array.isArray(val) && ![ 'string', 'number', 'boolean' ].includes(typeof val)) {
        return 'Invalid type!'
      }
    } catch (err) {
      return err.message
    }
  }

  await config.set(key, val)
  return `\`config.${key}\` was set to \`${JSON.stringify(val)}\`.`
}, {
  argc: 1,
  usage: 'config <key> [value]',
  example: 'config discord.massMentions true',
  allowMoreArguments: true
})
