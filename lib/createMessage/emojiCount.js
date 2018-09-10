// https://blog.jonnew.com/posts/poo-dot-length-equals-two
module.exports = (str) => {
  const split = str.split('\u{200D}')
  let count = 0

  for (const s of split) {
    const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join('')).length
    count += num
  }

  return count / split.length
}
