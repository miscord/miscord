(() => {
  const api = document.querySelector('#api')
  const button = api.querySelector('a.button')
  const username = api.querySelector('input[type=text]')
  const password = api.querySelector('input[type=password]')
  const status = api.querySelector('p.status')

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

    status.textContent = 'Saved!'

    window.config.setAPI(user, pass)
  })
})()
