const Command = require('./Command')

module.exports = new Command((_, reply) => {
  let cleanConfig = require('fs').readFileSync(require('path').join(config.path, 'config.json'), 'utf8')
  cleanConfig
    .match(/"(token|username|password)": ".*"/g)
    .forEach(match => { cleanConfig = cleanConfig.replace(match, match.replace(/: ".*"/, ': "***"')) })
  reply(cleanConfig, { code: true })
})
