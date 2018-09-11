const url = require('url')

module.exports = (attach) => {
  var baseURL = attach.image || attach.url
  var parse = u => url.parse(u, true)
  if (!baseURL) return
  baseURL = baseURL.match(/^(http|https):\/\/l\.facebook\.com\/l\.php/i) ? parse(baseURL).query.u : baseURL
  var imageURL = parse(baseURL).pathname === '/safe_image.php' ? parse(baseURL).query.url : baseURL
  var name = parse(imageURL).pathname.split('/').pop('-1')
  return {
    name: name.includes('.') ? name : name + '.png',
    attachment: imageURL
  }
}
