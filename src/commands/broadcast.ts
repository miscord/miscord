import Command from './Command'
import { reportError } from '../error'

export default new Command(argv => {
  const message = argv.join(' ')
  connections.map(async connection => {
    const threads = connection.getWritableThreads()
    await Promise.all(threads.map(thread => messenger.client.sendMessage(thread.id, message))).catch(err => reportError(err))

    const channels = connection.getWritableChannels()
    await Promise.all(channels.map(endpoint => discord.getChannel(endpoint.id).send(message))).catch(err => reportError(err))
  })
}, {
  argc: 1,
  usage: 'broadcast <message>',
  example: 'broadcast hello everyone!',
  allowMoreArguments: true
})
