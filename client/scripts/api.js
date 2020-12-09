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

const queryKnesset = async path => {
    const url = `/knesset/${path}`
    const response = await fetch(url)
    const data = (await response.json())
    const error = data['odata.error']
    if (error)
        throw error
    const nextLink = data['odata.nextLink']
    return [...data.value, ...(nextLink ? await queryKnesset(nextLink) : [])]
}


export async function getSessionItems(sessionIDs) {
    return queryKnesset(`KNS_CmtSessionItem()?$filter=${sessionIDs.map(id => `CommitteeSessionID eq ${id}`).join(' or ')}`)    
}

export async function getCommittees(ids) {
    return queryKnesset(`KNS_Committee()?$filter=${ids.map(id => `CommitteeID eq ${id}`).join(' or ')}`)    
}

export function getCommitteeSessions({startDate, endDate}) {
   return queryKnesset(`KNS_CommitteeSession()?$filter=StartDate ge DateTime'${startDate.toISOString()}' and StartDate lt DateTime'${endDate.toISOString()}'`)
}

export async function getKnessetData({startDate, endDate}) {
    const sessions = await getCommitteeSessions({startDate, endDate})
    const committeeIDs = [...new Set(sessions.map(s => s.CommitteeID))]
    const committees = (await getCommittees(committeeIDs)).map(c => ({[c.CommitteeID]: c})).reduce((a, o) => Object.assign(a, o), {})
    const sessionItems = await getSessionItems(sessions.map(s => s.CommitteeSessionID))

    return sessions.map(session => ({
        session,
        committee: committees[session.CommitteeID],
        items: sessionItems.filter(item => item.CommitteeSessionID === session.CommitteeSessionID)
    }))
}