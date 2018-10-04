const request = require('request')

module.exports = options => {
  return new Promise((resolve, reject) => {
    if (typeof options === 'string') {
      options = {
        uri: options
      }
    }
    options = options || {}

    options.method = 'HEAD'
    options.followAllRedirects = true
    options.followOriginalHttpMethod = true

    request(options, function (err, res, body) {
      if (err) return reject(err)
      const code = res.statusCode
      if (code >= 400) return reject(new Error('Received invalid status code: ' + code))

      var len = res.headers['content-length']
      if (!len) return reject(new Error('Unable to determine file size'))
      len = +len
      if (Number.isNaN(len)) return reject(new Error('Invalid Content-Length received'))

      resolve(+res.headers['content-length'])
    })
  })
}
