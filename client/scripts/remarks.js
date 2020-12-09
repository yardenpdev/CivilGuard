import * as api from './api.js'
window.addEventListener('DOMContentLoaded', async () => {
    const me = await api.ensureCurrentUser()
    const search = new URLSearchParams(location.search.substr(1))
    const id = search.get('item')
    const root = document.querySelector('#remarks')
    root.setAttribute('action', `/remarks/?item=${id}`)
    const remarkList = root.querySelector('#remarkList')
    const template = remarkList.firstElementChild
    template.remove()
    const render = async () => {
        const {item, session, committee, subjects, remarks} = await api.getSessionData(id)
        document.querySelector('#committee').innerText = committee.Name
        document.querySelector('#date').innerText = new Date(session.StartDate).toLocaleString()
        document.querySelector('#session').innerText = item.Name
        document.querySelector('#session').href = session.SessionUrl
        remarkList.innerHTML = ''
        remarks.forEach(r => {
            const li = template.cloneNode(true)
            li.querySelector('label').innerText = r.text
            li.querySelector('.thumb').src = r.photo
            li.querySelector('.name').innerText = r.name
            li.querySelector('.date').innerText = new Date(r.time_inserted).toLocaleDateString()
            const deleteButton = li.querySelector('.delete')
            deleteButton.onclick = async () => {
                await api.deleteRemark(item.CmtSessionItemID, r.text)
                render()
            }
            if (r.user_id !== me.id)
                deleteButton.setAttribute('hidden', true)

            remarkList.appendChild(li)
        })
    }

    const newRemark = root.querySelector('#newRemark')

    document.querySelector('#addRemark').onclick = async e => {
        await api.addSessionRemark(id, newRemark.value)
        newRemark.value = ''
        render()
    }

    render()
})