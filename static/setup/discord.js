import fetchJSON from '/static/js/fetchJSON.js'

(() => {
  const discord = document.querySelector('#discord')
  const button = discord.querySelector('a.button')
  const input = discord.querySelector('input')
  const status = discord.querySelector('p.status')

  input.addEventListener('keydown', ev => {
    if (input.classList.contains('is-danger')) {
      input.classList.remove('is-danger')
    }
    if (ev.key === 'Enter') button.click()
  })

  button.addEventListener('click', async () => {
    const token = input.value.trim()
    const markInvalid = message => {
      input.classList.add('is-danger')
      status.textContent = `Invalid token! (${message})`
    }

    if (!token) return markInvalid()

    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) return markInvalid('Invalid format')

    const [ clientID ] = tokenParts
    if (!/\d+/.test(atob(clientID))) return markInvalid('Client ID not found')

    status.textContent = 'Logging in...'

    const res = await fetchJSON('/validate/discord',{ token })

    if (!res.valid) return markInvalid(res.error)
    status.textContent = `Logged in, username: ${res.username}`

    window.config.setDiscord(token)
  })
})()
