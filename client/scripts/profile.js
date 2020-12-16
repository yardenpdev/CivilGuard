import * as api from './api.js'
window.addEventListener('DOMContentLoaded', async () => {
    const me = await api.ensureCurrentUser()
    const profileForm = document.querySelector('#profile')
    const notificationForm = document.querySelector('#notifications')
    const name = profileForm.querySelector('#name')
    const email = profileForm.querySelector('#email')
    const photo = profileForm.querySelector('#photo')
    const thumb = profileForm.querySelector('#thumb')
    const subjectTemplate = notificationForm.querySelector('.subject')
    const subjectList = subjectTemplate.parentElement
    subjectTemplate.remove()
    const allSubjects = await api.getSubjects()
    const userSubjects = new Set((await api.getUserSubjects()).filter(s => allSubjects.includes(s)));
    for (const subject of allSubjects) {
        const subjectItem = subjectTemplate.cloneNode(true)
        const checkbox = subjectItem.querySelector('input[type="checkbox"]')
        checkbox.value = subject
        checkbox.checked = userSubjects.has(subject)
        subjectItem.querySelector('span').innerText = subject
        subjectList.appendChild(subjectItem)
        checkbox.onchange = ({target: {checked, value}}) => {
            userSubjects[checked ? 'add' : 'delete'](value)
            api.setUserSubjects(Array.from(userSubjects))
        }
    }
    notificationForm.addEventListener('submit', e => {
        e.preventDefault()
        api.initPermissions()
    })


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