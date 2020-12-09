import * as api from './api.js'
window.addEventListener('DOMContentLoaded', async () => {
    const me = await api.ensureCurrentUser()
    const search = new URLSearchParams(location.search.substr(1))
    const id = search.get('remark')
    const {item, session, committee, subjects, remarks} = await api.getSessionData(id)
    document.querySelector('#committee').innerText = committee.Name
    document.querySelector('#date').innerText = new Date(session.StartDate).toLocaleString()
    document.querySelector('#session').innerText = item.Name
    document.querySelector('#session').href = session.SessionUrl
    const remarkList = document.querySelector('#remarkList')
    const template = remarkList.firstElementChild
    template.remove()
    const render = () => {
        remarks.innerHTML = ''
        remarks.forEach(r => {
            const li = template.cloneNode(true)
            li.querySelector('label').innerText = r.text
            remarkList.appendChild(li)
        })
    }

    render()
})