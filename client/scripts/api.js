export async function toggleSubject(item, subject, enabled) {
    const body = new FormData()
    body.append('session_id', item);
    body.append('subject', subject);
    return await fetch('/api/session_subjects', {method: 'POST', body})
}

export async function getSessionSubjects(item) {
    const response = await fetch(`/api/session_subjects?session_id=${item}`)
    const json = await response.json()
    return json.subjects
}

export async function getSubjects() {
    const response = await fetch('/api/subjects')
    return (await response.json()).subjects
}

export async function addSubject(title) {
    const body = new FormData()
    body.append('subject', title);
    return await fetch('/api/subjects', {method: 'POST', body})
}

export async function deleteSubject(title) {
    const body = new FormData()
    body.append('subject', title);

    return await fetch('/api/subjects', {method: 'DELETE', body})

}

const queryKnesset = async path => {
    const url = `/knesset/${path}`
    const response = await fetch(url)
    const data = (await response.json())
    const error = data['odata.error']
    if (error)
        throw error
    const nextLink = data['odata.nextLink']
    if (!data.value)
        return data
    return [...data.value, ...(nextLink ? await queryKnesset(nextLink) : [])]
}


export async function getSessionItems(sessionIDs) {
    const reqs = await Promise.all(sessionIDs.map(id =>
        queryKnesset(`KNS_CmtSessionItem()?$filter=CommitteeSessionID eq ${id}`
    )))
    return reqs.flat()
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

export async function getSessionData(sessionItemID) {
    const item = await queryKnesset(`KNS_CmtSessionItem(${sessionItemID})?$expand=KNS_CommitteeSession/KNS_Committee`)
    const session = item.KNS_CommitteeSession
    const committee = session.KNS_Committee
    delete session.KNS_Committee
    delete item.KNS_CommitteeSession
    const subjects = await getSessionSubjects(item.CmtSessionItemID)
    const remarks = await getSessionRemarks(item.CmtSessionItemID)
    return {item, session, committee, subjects}
}

export async function getSessionRemarks(sessionItemID) {
    const response = await fetch(`/api/remarks?session_id=${sessionItemID}`)
    return (await response.json()).remarks
}

export async function getCurrentUser() {
    const response = await fetch('/me')
    return (await response.json()).user
}

export async function ensureCurrentUser() {
    const self = await getCurrentUser()
    if (self)
        return self

    location.href = `/auth/google?next=${location.href}`
}
