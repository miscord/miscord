const request = require('request')

module.exports = uri => {
  return new Promise((resolve, reject) => {
    request({
      uri,
      method: 'HEAD',
      followAllRedirects: true,
      followOriginalHttpMethod: true
    }, function (err, res, body) {
      if (err) return reject(err)
      const code = res.statusCode
      if (code >= 400) return reject(new Error('Received invalid status code: ' + code))
      resolve(Number(res.headers['content-length']))
    })
  })
}
