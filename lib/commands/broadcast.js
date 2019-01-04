const Command = require('./Command')

module.exports = new Command({
  argc: 1,
  usage: `broadcast <message>`,
  example: `broadcast hello everyone!`,
  allowMoreArguments: true
}, (argv, reply) => {
  const message = argv.join(' ')
  connections.list.map(connection => {
    const threads = connection.getWritableThreads()
    threads.forEach(thread => messenger.client.sendMessage(Number(thread.id), message))

    const channels = connection.getWritableChannels()
    channels.forEach(({ channel }) => channel.send(message))
  })
})
