import * as api from './api.js'

window.addEventListener('DOMContentLoaded', async () => {
    const categorizeForm = document.querySelector('#categorize')
    const table = categorizeForm.querySelector('table > tbody')
    const issueTemplate = categorizeForm.querySelector('tbody tr')
    issueTemplate.remove()
    const startDate = new Date()
    const endDate = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 7)
    const issues = await api.getIssues({startDate, endDate})
    const subjects = await api.getSubjects()
    for (const issue of issues) {
        const element = issueTemplate.cloneNode(true)
        element.querySelector('.issue').innerText = issue.title
        const checkboxTemplate = element.querySelector('span.subject')
        const subjectArea = element.querySelector('.subjects') 
        checkboxTemplate.remove()
        for (const subject of subjects) {
            const span = checkboxTemplate.cloneNode(true)
            const checkbox = span.querySelector('input')
            const label = span.querySelector('label span')            
            label.innerText = subject
            checkbox.checked = issue.subjects.includes(subject)
            checkbox.onchange = () => api.toggleSubject(issue, subject, checkbox.checked)
            subjectArea.appendChild(span)
        }

        table.appendChild(element)
    }
})