import fetchJSON from '/static/js/fetchJSON.js'

(() => {
  const messenger = document.querySelector('#messenger')
  const button = messenger.querySelector('a.button')
  const username = messenger.querySelector('input[type=text]')
  const password = messenger.querySelector('input[type=password]')
  const status = messenger.querySelector('p.status')

  const inputKeydownListener = ev => {
    if (username.classList.contains('is-danger')) {
      username.classList.remove('is-danger')
      password.classList.remove('is-danger')
    }
    if (ev.key === 'Enter') button.click()
  }

  username.addEventListener('keydown', inputKeydownListener)
  password.addEventListener('keydown', inputKeydownListener)

  button.addEventListener('click', async () => {
    const user = username.value.trim()
    const pass = password.value.trim()
    const markInvalid = message => {
      username.classList.add('is-danger')
      password.classList.add('is-danger')
      status.textContent = `Invalid credentials! (${message})`
    }

    if (!user || !pass) return markInvalid('Username or password empty')

    status.textContent = 'Logging in...'

    const res = await fetchJSON('/validate/messenger', {
      username: user,
      password: pass
    })

    if (!res.valid) return markInvalid(res.error)
    status.textContent = `Logged in, username: ${res.username}`

    window.config.setMessenger(user, pass)
  })
})()
