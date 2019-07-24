import parseHTML from '/static/js/parseHTML.js'

export default function collapsible (connection) {
  const header = connection.querySelector('header')
  const icons = header.querySelector('.icons')
  const deleteButton = header.querySelector('button.delete')
  const content = connection.querySelector('.message-body')
  header.addEventListener('click', ev => {
    if (ev.target === deleteButton) return
    content.hidden = !content.hidden

    if (content.hidden) {
      icons.innerHTML = ''
      const endpointIcons = content.querySelectorAll('.endpoint > .icon')
      for (let icon of endpointIcons) {
        icons.appendChild(parseHTML(icon.outerHTML))
      }
    }

    icons.hidden = !icons.hidden
  })
}
