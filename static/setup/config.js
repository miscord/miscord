import fetchJSON from '/static/js/fetchJSON.js'

const nextButton = document.querySelector('#next-button')
class Config {
  constructor () {
    this.config = { discord: {}, messenger: {}, api: {} }
    this.discord = false
    this.messenger = false
    this.api = false
    this.checkNextButton()
  }
  setDiscord (token) {
    this.config.discord.token = token
    this.discord = true
    this.checkNextButton()
  }
  setMessenger (user, pass) {
    this.config.messenger.username = user
    this.config.messenger.password = pass
    this.messenger = true
    this.checkNextButton()
  }
  setAPI (user, pass) {
    this.config.api.username = user
    this.config.api.password = pass
    this.api = true
    this.checkNextButton()
  }
  checkNextButton () {
    if (this.messenger && this.discord && this.api) {
      nextButton.removeAttribute('disabled')
    } else {
      nextButton.setAttribute('disabled', 'disabled')
    }
  }
}
window.config = new Config()
nextButton.addEventListener('click', async () => {
  await fetchJSON('/config', config.config)
  alert('Starting up the instance...\nYou might need to wait a few seconds before refreshing this page.')
  location.reload()
})
