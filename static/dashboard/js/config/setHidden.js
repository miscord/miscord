export default function setHidden (field, isHidden) {
  if (field.type === 'select-one') field = field.parentNode.querySelector('.select2')

  field.hidden = isHidden
  if (isHidden) field.style.display = 'none'
  else field.style.display = ''
}
