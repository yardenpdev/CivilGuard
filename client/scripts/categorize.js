import * as api from './api.js'

window.addEventListener('DOMContentLoaded', () => {
    const categorizeForm = document.querySelector('#categorize')
    const table = categorizeForm.querySelector('table > tbody')
    const issueTemplate = categorizeForm.querySelector('tbody tr')
    const fromDate = document.querySelector('#fromDate')
    const toDate = document.querySelector('#toDate')
    fromDate.value = new Date().toISOString().substr(0, 10)
    toDate.value = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 7).toISOString().substr(0, 10)
    issueTemplate.remove()
    const render = async() => {
        table.innerHTML = ''
        const startDate = new Date(fromDate.value)
        const endDate = new Date(toDate.value)
        const sessions = await api.getKnessetData({startDate, endDate})
        const subjects = await api.getSubjects()
        console.log(sessions)
        for (const {session, items, committee} of sessions) {
            for (const item of items) {
                const element = issueTemplate.cloneNode(true)
                element.querySelector('.committee').innerText = committee.Name
                element.querySelector('.date').innerText = new Date(session.StartDate).toLocaleString('he-IL')
                element.querySelector('.issue').innerText = item.Name
                if (session.SessionUrl)
                    element.querySelector('.issue').href = session.SessionUrl
                const checkboxTemplate = element.querySelector('span.subject')
                const subjectArea = element.querySelector('.subjects') 
                checkboxTemplate.remove()
                for (const subject of subjects) {
                    const span = checkboxTemplate.cloneNode(true)
                    const checkbox = span.querySelector('input')
                    const label = span.querySelector('label span')            
                    label.innerText = subject
    //                checkbox.checked = issue.subjects.includes(subject)
                    checkbox.onchange = () => api.toggleSubject(issue, subject, checkbox.checked)
                    subjectArea.appendChild(span)
                }

                table.appendChild(element)
            }

        }
    }

    fromDate.onchange = render
    toDate.onchange = render
    render()

})