class AddConnectionLevel {
  constructor () {
    const el = parseHTML(`
      <div class="level">
        <div class="level-left">
          <input class="input" type="text" id="add-name" placeholder="New connection name">
        </div>
        <div class="level-right">
          <a id="add-button" class="button">Add</a>
        </div>
      </div>
    `)

    const button = el.querySelector('#add-button')
    const field = el.querySelector('#add-name')

    button.addEventListener('click', () => {
      const name = field.value.trim()
      field.value = ''
      if (!name) return

      button.classList.add('is-loading')
      fetch('/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          endpoints: []
        })
      })
        .then(() => {
          button.classList.remove('is-loading')
          this.onadd(name)
        })
        .catch(alert)
    })

    field.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') button.click()
    })

    this.el = el
  }

  onadd () {}
}
