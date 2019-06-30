function parseHTML (htmlString) {
  const document = new DOMParser().parseFromString(htmlString, 'text/html')
  return document.querySelector('body').firstChild
}
