function initSelects (guilds, threads) {
  $('.discord-endpoints-select').select2({
    placeholder: 'Add Discord channel',
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

  $('.messenger-endpoints-select').select2({
    placeholder: 'Add Messenger chat',
    data: threads.map(thread => ({
      id: thread.id,
      text: thread.name
    }))
  })
}
