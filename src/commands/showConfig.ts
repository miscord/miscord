import Command from './Command'

export default new Command((_, reply) => {
  let cleanConfig = JSON.stringify(config.config, null, 2)
  cleanConfig
    .match(/"(token|username|password)": ".*"/g)
    ?.forEach(match => {
      cleanConfig = cleanConfig.replace(match, match.replace(/: ".*"/, ': "***"'))
    })
  reply(cleanConfig, { code: true })
})
