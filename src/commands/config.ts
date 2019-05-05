import dotProp from 'dot-prop'
import Command from './Command'

export default new Command(async argv => {
  const [key, ...value] = argv

  if (!value.length) {
    const configValue = dotProp.get(config.config, key)
    return `\`config.${key}\` is set to \`${typeof configValue === 'string' ? configValue : JSON.stringify(configValue)}\``
  }

  let val: any = value.join(' ')

  if (val === 'true') val = true
  if (val === 'false') val = false
  // tslint:disable-next-line:no-eval
  if (/^`.+`$/.test(val)) val = eval(val.match(/^`(.+)`$/)!![1])

  await config.set(key, val)
  return `\`config.${key}\` was set to \`${JSON.stringify(val)}\`.`
}, {
  argc: 1,
  usage: `config <key> [value]`,
  example: `config discord.massMentions true`,
  allowMoreArguments: true
})
