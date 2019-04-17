const endpoint = {
  type: 'object',
  properties: {
    type: { type: 'string', pattern: 'discord|messenger' },
    id: { type: 'string', pattern: '\\d+' },
    readonly: { type: 'boolean' }
  },
  required: [
    'type',
    'id'
  ]
}

const connection = {
  properties: {
    name: { type: 'string' },
    endpoints: {
      type: 'array',
      items: [
        endpoint
      ]
    }
  },
  required: [
    'name'
  ]
}

module.exports = {
  endpoint,
  connection
}
