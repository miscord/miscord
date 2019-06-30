const buttons = {
  pause: document.querySelector('#pause-button'),
  unpause: document.querySelector('#unpause-button'),
  restart: document.querySelector('#restart-button'),
  stop: document.querySelector('#stop-button')
}

function disable (button, isDisabled) {
  if (isDisabled) {
    button.setAttribute('disabled', '')
  } else {
    button.removeAttribute('disabled')
  }
}

function setLoading (button, isLoading) {
  if (isLoading) {
    button.classList.add('is-loading')
  } else {
    button.classList.remove('is-loading')
  }
}

buttons.pause.addEventListener('click', () => {
  fetch('/control/pause', { method: 'POST' })
    .then(res => res.json())
    .then(updateStatus)
    .catch(alert)
})

buttons.unpause.addEventListener('click', () => {
  fetch('/control/unpause', { method: 'POST' })
    .then(res => res.json())
    .then(updateStatus)
    .catch(alert)
})

buttons.restart.addEventListener('click', () => {
  if (!confirm('Are you sure you want to restart Miscord?\nThe dashboard will become unavailable until it logs back in.')) return
  fetch('/control/restart', { method: 'POST' })
    .then(() => alert('Restarting Miscord...'))
    .catch(alert)
})

buttons.stop.addEventListener('click', () => {
  if (!confirm('Are you sure you want to stop Miscord?\nThe dashboard will become unavailable until you run it again.')) return
  fetch('/control/stop', { method: 'POST' })
    .then(() => alert('Stopped Miscord.'))
    .catch(alert)
})

setLoading(buttons.pause, true)
setLoading(buttons.unpause, true)

function updateStatus ({ status }) {
  document.querySelector('#status').textContent = status
  disable(buttons.unpause, status !== 'paused')
  disable(buttons.pause, status === 'paused')
}
fetch('/control/status')
  .then(res => res.json())
  .then(updateStatus)
  .then(() => {
    setLoading(buttons.pause, false)
    setLoading(buttons.unpause, false)
  })
  .catch(alert)
