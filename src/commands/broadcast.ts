import Command from './Command'

export default new Command(argv => {
  const message = argv.join(' ')
  connections.list.map(connection => {
    const threads = connection.getWritableThreads()
    threads.forEach(thread => messenger.client.sendMessage(thread.id, message))

    const channels = connection.getWritableChannels()
    channels.forEach(endpoint => discord.getChannel(endpoint.id).send(message))
  })
}, {
  argc: 1,
  usage: `broadcast <message>`,
  example: `broadcast hello everyone!`,
  allowMoreArguments: true
})
