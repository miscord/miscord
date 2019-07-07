export default function initSelects ({ guilds, threads }) {
  if (guilds) initChannels(guilds)
  if (threads) initThreads(threads)
}

export function initThreads (threads) {
  $('.messenger-thread-select').select2({
    placeholder: 'Select a Messenger chat',
    data: threads.map(thread => ({
      id: thread.id,
      text: thread.name
    }))
  })
}

export function initChannels (guilds) {
  $('.discord-channel-select').select2({
    placeholder: 'Select a Discord channel',
    data: guilds.map(guild => ({
      text: guild.name,
      children: guild.channels.filter(channel => channel.type === 'text').map(channel => ({
        id: channel.id,
        text: channel.category
          ? `[${guild.channels.find(c => c.id === channel.category).name}] #${channel.name}`
          : `#${channel.name}`
      }))
    }))
  })
}
