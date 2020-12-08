export function toggleSubject(issue, subject, enabled) {
    const current = issue.subjects.indexOf(subject)
    if (enabled && current < 0)
        issue.subjects.push(subject)        
    else if (current >= 0)
        issue.subjects.splice(current, 1)

    return saveIssue(issue)
}

export async function getSubjects() {
    return ['s1', 's2']
}

export function addSubject(name) {

}

export function saveIssue(issue) {

}

export function removeSubject(name) {

}

const knessetBaseUri = 'https://knesset.gov.il/Odata/ParliamentInfo.svc/'

export async function getIssues({startDate, endDate}) {
    const url = `${knessetBaseUri}/KNS_CommitteeSession()?${encodeURIComponent(
            `filter=StartDate gt DateTime'${startDate.toISOString()}' and EndDate lt DateTime'${endDate.toISOString()}'`)}`
    const response = await fetch(url, {cache: 'no-cache', method: 'GET', mode: 'cors', headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*'}})
    const data = await response.json()
    console.log(data)  
}