import * as api from './api.js'
window.addEventListener('DOMContentLoaded', async () => {
    const me = await api.ensureCurrentUser()
    const profileForm = document.querySelector('#profile')
    const name = profileForm.querySelector('#name')
    const email = profileForm.querySelector('#email')
    const photo = profileForm.querySelector('#photo')
    const thumb = profileForm.querySelector('#thumb')
    const render = () => {
        name.value = me.name
        email.value = me.email
        photo.value = me.photo
        thumb.src = photo.value
    }
    profileForm.addEventListener('submit', e => {
        e.preventDefault()
        const data = new FormData()
        api.updateUserProfile({name: name.value, photo: photo.value, email: email.value}).
        then(() => location.reload())
    })

    render()
})