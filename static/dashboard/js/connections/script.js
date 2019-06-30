const container = document.querySelector('#connections')

const fetchJSON = url => fetch(url).then(res => res.json())

Promise.all([
  fetchJSON('/connections'),
  fetchJSON('/discord/guilds'),
  fetchJSON('/messenger/threads')
])
  .then(([connections, guilds, threads]) => {
    const categoryName = (guild, catID) => catID ? '[' + guild.channels.find(chan => chan.id === catID).name + ']' : ''

    function endpointName (endpoint) {
      if (endpoint.type === 'discord') {
        const guild = guilds.find(guild => guild.channels.some(channel => channel.id === endpoint.id))
        const channel = guild.channels.find(channel => channel.id === endpoint.id)
        return [
          `${guild.name}:`,
          categoryName(guild, channel.category),
          `#${endpoint.name}`
        ].join(' ')
      } else {
        return endpoint.name
      }
    }

    function endpointLink (endpoint) {
      if (endpoint.type === 'discord') {
        const guild = guilds.find(guild => guild.channels.some(channel => channel.id === endpoint.id))
        return `https://discordapp.com/channels/${guild.id}/${endpoint.id}`
      } else {
        return `https://messenger.com/t/${endpoint.id}/`
      }
    }

    const Endpoint = endpoint => `
      <div class="box endpoint">
        <img class="icon" src="/static/img/${endpoint.type}.png" alt="${endpoint.type} logo">
        <a href="${endpointLink(endpoint)}">${endpointName(endpoint)}</a>
        <button style="margin-left: auto;" class="delete" aria-label="delete" data-id="${endpoint.id}"></button>
      </div>
    `

    const Connection = conn => parseHTML(`
      <article class="message connection">
        <header class="message-header">
          <p>${conn.name}</p>
          <div class="icons" hidden>icons go here</div>
          <button class="delete" aria-label="delete"></button>
        </header>
        <div class="message-body">
          ${conn.endpoints.length ? conn.endpoints.map(Endpoint).join('\n') : '<b>No endpoints!</b>'}
          <select name="discord-endpoints[]" class="discord-endpoints-select">
            <option></option>
          </select>
          <br />
          <select name="messenger-endpoints[]" class="messenger-endpoints-select">
            <option></option>
         </select>
        </div>
      </div>
    `)

    function loadConnection (connection) {
      const el = Connection(connection)

      const refresh = () => {
        fetch(`/connections/${connection.name}`)
          .then(res => res.json())
          .then(connection => {
            const newEl = loadConnection(connection)
            el.parentNode.replaceChild(newEl, el)
            initSelects(guilds, threads)
          })
      }

      el.querySelector('.delete').addEventListener('click', () => {
        if (confirm(`Do you want to delete connection ${connection.name}?`)) {
          fetch(`/connections/${connection.name}`, { method: 'DELETE' })
            .then(() => location.reload())
        }
      })

      el.querySelectorAll('.endpoint > .delete').forEach(button => {
        button.addEventListener('click', ev => {
          fetch(`/connections/${connection.name}/endpoints/${ev.target.dataset.id}`, { method: 'DELETE' })
            .then(() => refresh())
        })
      })

      const discordEndpoints = $(el).find('.discord-endpoints-select')
      const messengerEndpoints = $(el).find('.messenger-endpoints-select')

      function addEndpoint (type, id) {
        discordEndpoints.prop('disabled', true)
        messengerEndpoints.prop('disabled', true)
        fetch(`/connections/${connection.name}/endpoints`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, id })
        }).then(() => refresh())
      }

      discordEndpoints.change(ev => addEndpoint('discord', ev.target.value))
      messengerEndpoints.change(ev => addEndpoint('messenger', ev.target.value))

      collapsible(el)

      return el
    }

    if (!connections.length) {
      container.appendChild(parseHTML(`<h1 class="title">No connections!</h1>`))
    } else {
      for (let connection of connections) {
        container.appendChild(loadConnection(connection))
      }
    }

    initSelects(guilds, threads)

    const level = new AddConnectionLevel()
    level.onadd = name => {
      const noConn = container.querySelector('h1')
      if (noConn) container.removeChild(noConn)

      container.insertBefore(loadConnection({ name, endpoints: [] }), level.el)
      initSelects(guilds, threads)
    }
    container.appendChild(level.el)
  })
  .catch(alert)
