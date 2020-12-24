import * as api from './api.js'
window.addEventListener('DOMContentLoaded', async () => {
    const me = await api.ensureCurrentUser()
    const categorizeForm = document.querySelector('#categorize')
    const table = categorizeForm.querySelector('table > tbody')
    const issueTemplate = categorizeForm.querySelector('tbody tr')
    const subjectList = categorizeForm.querySelector('#subjectList')
    const newSubject = categorizeForm.querySelector('#addSubject')
    const newSubjectName = categorizeForm.querySelector('#newSubjectName')
    const subjectTemplate = subjectList.firstElementChild
    subjectTemplate.remove()
    const fromDate = document.querySelector('#fromDate')
    const toDate = document.querySelector('#toDate')
    fromDate.value = new Date().toISOString().substr(0, 10)
    toDate.value = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 7).toISOString().substr(0, 10)
    issueTemplate.remove()
    let cached = {
        startDate: new Date(),
        endDate: new Date(),
        sessions: null
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
            li.querySelector('label').innerText = subj
            li.querySelector('input').onclick = async () => {
                await api.deleteSubject(subj)
                render()
            }
            subjectList.appendChild(li)
        }

        for (const {session, items, committee} of sessions) {
            for (const item of items) {
                const itemSubjects = await api.getSessionSubjects(item.CmtSessionItemID)
                const element = issueTemplate.cloneNode(true)
                element.querySelector('.committee').innerText = committee.Name
                element.querySelector('.date').innerText = new Date(session.StartDate).toLocaleString('he-IL')
                element.querySelector('.issue').innerText = item.Name
                if (session.SessionUrl)
                    element.querySelector('.issue').href = session.SessionUrl
                const itemSubjectTemplate = element.querySelector('span.subject')
                const subjectArea = element.querySelector('.subjects') 
                itemSubjectTemplate.remove()
                const addSubjectInput = subjectArea.querySelector('.add')
                const addUnselected =subject => {
                    const o = document.createElement('option')
                    o.value = o.innerText = subject
                    addSubjectInput.appendChild(o)
                }

                const addSelected = subject => {
                    const span = itemSubjectTemplate.cloneNode(true)
                    const del = span.querySelector('.del')
                    const label = span.querySelector('.title')            
                    label.innerText = subject
                    del.onclick = async () => {
                        await api.toggleSubject(item.CmtSessionItemID, subject, false)
                        span.remove()
                        addUnselected(subject)
                    }
                    subjectArea.appendChild(span)
                }
                addSubjectInput.onchange = event => {
                    debugger
                    const index = addSubjectInput.selectedIndex
                    if (!index)
                        return
                    const subject = addSubjectInput.value
                    addSelected(subject)
                    addSubjectInput.options[index].remove()
                    api.toggleSubject(item.CmtSessionItemID, subject, true)
                }

                for (const subject of subjects) {
                    if (itemSubjects.includes(subject))
                        addSelected(subject)
                    else
                        addUnselected(subject)
                }

                table.appendChild(element)
            }
        }  

        categorizeForm.dataset.ready = true      
    }

    fromDate.onchange = render
    toDate.onchange = render
    newSubject.onclick = async () => {
        await api.addSubject(newSubjectName.value)
        render()
    }

    render()

})