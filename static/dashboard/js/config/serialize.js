export default function serialize (field) {
  const { type } = field

  if (type === 'text') return field.value
  if (type === 'checkbox') return field.checked
  if (type === 'textarea') return field.value.split('\n')
  if (type === 'select-one') return field.value
}
