import * as api from './api.js'
window.addEventListener('DOMContentLoaded', async () => {
    const me = await api.ensureCurrentUser()
    const userSubjects = await api.getUserSubjects()
    const mainForm = document.querySelector('#main')
    const table = mainForm.querySelector('table > tbody')
    const issueTemplate = mainForm.querySelector('tbody tr')
    const subjectList = mainForm.querySelector('#subjectList')
    const subjectTemplate = subjectList.firstElementChild
    subjectTemplate.remove()
    const fromDate = document.querySelector('#fromDate')
    const toDate = document.querySelector('#toDate')
    const selectAll = mainForm.querySelector('.selectAll')
    fromDate.value = new Date().toISOString().substr(0, 10)
    toDate.value = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 7).toISOString().substr(0, 10)
    issueTemplate.remove()

    selectAll.onchange = ({target: {checked}}) => {
        if (checked) {
            for (const cb of mainForm.querySelectorAll('input.filter'))
                cb.checked = false
        }

        render()
    }

    let cached = {
        startDate: new Date(),
        endDate: new Date(),
        sessions: null
    }
    const elementSubjects = new WeakMap()

    const refilter = () => {
        const items = mainForm.querySelectorAll('.item')
        const selectedSubjects = new Set([...subjectList.querySelectorAll('.filter:checked')].map(s => s.value))
        items.forEach(element => {
            const subjects = elementSubjects.get(element)
            if (selectAll.checked || subjects.some(s => selectedSubjects.has(s)))
                element.removeAttribute('hidden')
            else
                element.setAttribute('hidden', true)
        })
    }

    const render = async() => {
        table.innerHTML = ''
        subjectList.innerHTML = ''
        const startDate = new Date(fromDate.value)
        const endDate = new Date(toDate.value)
        let sessions = cached.sessions

        if (startDate.valueOf() != cached.startDate.valueOf() || endDate.valueOf() !== cached.endDate.valueOf()) {
            sessions = await api.getKnessetData({startDate, endDate})
            cached.startDate = startDate
            cached.endDate = endDate
            cached.sessions = sessions
        }

        const subjects = await api.getSubjects()

        for (const subj of subjects) {
            const li = subjectTemplate.cloneNode(true)
            li.querySelector('.label').innerText = subj
            const checkbox = li.querySelector('.filter')
            checkbox.value = subj
            checkbox.onchange = ({target: {checked}}) => {
                if (checked) {
                    selectAll.checked = false
                } else {
                    const firstChecked = subjectList.querySelector('.filter:checked')
                    if (!firstChecked)
                        selectAll.checked = true
                }

                refilter()
            }
            subjectList.appendChild(li)
        }

        for (const {session, items, committee} of sessions) {
            for (const item of items) {
                const itemSubjects = await api.getSessionSubjects(item.CmtSessionItemID)
                const element = issueTemplate.cloneNode(true)
                element.classList.add('item')
                elementSubjects.set(element, itemSubjects)
                element.querySelector('.committee').innerText = committee.Name
                element.querySelector('.date').innerText = new Date(session.StartDate).toLocaleString('he-IL')
                element.querySelector('.issue').innerText = item.Name
                const innerSubjTemplate = element.querySelector('span.subject')
                const subjectArea = element.querySelector('.subjects') 
                innerSubjTemplate.remove()
                for (const subject of itemSubjects) {
                    const subj = innerSubjTemplate.cloneNode(true)
                    const label = subj.querySelector('.title')    
                    label.innerText = subject
                    subjectArea.appendChild(subj)
                }

                element.querySelector('.remarks').href = `/remarks?item=${item.CmtSessionItemID}`
                element.querySelector('.info').href = session.SessionUrl
                table.appendChild(element)
            }
        }  

        mainForm.dataset.ready = true      
        refilter()
    }

    fromDate.onchange = render
    toDate.onchange = render
    render()

})