function toggleModal(element) {
    if (typeof element === 'string') document.querySelector(element).classList.toggle('is-active')
    else element.classList.toggle('is-active')
}

document.querySelectorAll('.modal').forEach(modal => {
    modal.querySelector('.modal-background').addEventListener(ev => toggleModal(modal))
    modal.querySelector('.modal-close').addEventListener(ev => toggleModal(modal))
})