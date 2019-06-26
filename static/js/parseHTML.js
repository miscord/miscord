function parseHTML (htmlString) {
  const document = new DOMParser().parseFromString(htmlString, 'text/html')
  console.log(document)
  return document.querySelector('body').firstChild
}
