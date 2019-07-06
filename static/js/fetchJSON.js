import handleError from '/static/js/handleError.js'

const parse = async res => {
  const body = await res.text()
  try {
    return JSON.parse(body)
  } catch (err) {
    alert('Error while parsing JSON\n' + body)
  }
}

export default function fetchJSON (url, method, data) {
  if (!method) {
    return fetch(url).then(parse).catch(handleError)
  }

  if (typeof method !== 'string') {
    data = method

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(parse).catch(handleError)
  }

  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data || {})
  }).then(parse).catch(handleError)
}
