import serialize from './serialize.js'
import deserialize from './deserialize.js'
import fetchJSON from '../../../js/fetchJSON.js'

export default function load (data, prefix) {
  const column = document.querySelector('.column.is-three-quarters')
  const fields = column.querySelectorAll('input,select,textarea,checkbox')
  fields.forEach(field => {
    const val = dotProp.get(data, field.id)
    deserialize(field, val)

    field.addEventListener('change', async () => {
      field.disabled = true
      const value = serialize(field)
      await fetchJSON(`/config/${prefix}${field.id}`, 'POST', value)
      field.disabled = false
    })
  })
}
