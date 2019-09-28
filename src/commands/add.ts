import Command from './Command'
import Connection from '../Connection'

export default new Command(async ([ name, ...endpoints ]) => {
  if (connections.has(name)) return `Connection \`${name}\` already exists!`

  if (endpoints.length) {
    const connection = new Connection(name)
    for (let endpoint of endpoints) {
      if (discord.client.channels.has(endpoint)) {
        await connection.addEndpoint({
          id: endpoint,
          type: 'discord'
        })
      } else if (messenger.threads.has(endpoint)) {
        await connection.addEndpoint({
          id: endpoint,
          type: 'messenger'
        })
      } else {
        return `Channel/chat ${endpoint} not found!
If it's a Messenger chat and bot was added to it while running, try restarting.`
      }
    }
    await connection.save()
  } else {
    await new Connection(name).save()
  }

  return `Connection \`${name}\` was added successfully!`
}, {
  argc: 1,
  allowMoreArguments: true,
  usage: `add <connection name> [...IDs of threads/channels]`,
  example: `add test-connection 1234 5678`
})
