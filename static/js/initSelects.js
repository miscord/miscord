export default function initSelects ({ guilds, threads }) {
  if (guilds) {
    initChannels(guilds)
    initGuilds(guilds)
  }
  if (threads) initThreads(threads)
}

export function initThreads (threads) {
  $('.messenger-thread-select').select2({
    placeholder: 'Select a Messenger chat',
    data: threads
      .toArray()
      .map(thread => ({
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
      children: guild.channels
        .filter(channel => channel.type === 'text')
        .toArray()
        .map(channel => ({
          id: channel.id,
          text: channel.category
            ? `[${guild.channels.get(channel.category).name}] #${channel.name}`
            : `#${channel.name}`
        }))
    }))
  })
}

export function initGuilds (guilds) {
  $('.discord-guild-select').select2({
    placeholder: 'Select a Discord server',
    data: guilds.map(guild => ({
      id: guild.id,
      text: guild.name
    }))
  })
}

export function initCategories (guild) {
  $('.discord-category-select').select2({
    placeholder: 'Select a category',
    data: guild.channels
      .filter(channel => channel.type === 'category')
      .toArray()
      .map(category => ({
        id: category.id,
        text: category.name
      }))
  })
}
