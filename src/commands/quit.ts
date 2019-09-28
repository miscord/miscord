const log = logger.withScope('commands:quit')

import Command from './Command'

export default new Command(async () => {
  await discord.client.destroy()
  log.success('Logged out from Discord')
  console.error('close 0')
})
