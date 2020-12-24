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
    return fetch('/api/subjects', {method: 'POST', body})
}

export function deleteSubject(title) {
    const body = new FormData()
    body.append('subject', title);

    return fetch('/api/subjects', {method: 'DELETE', body})

}
const getValue = (o, k) => (v => (v.$ && v.$['m:null']) ? null : v._ ? v._ : v)(o[`d:${k}`][0])
const extractEntry = e => {
    const props = (e.content[0]['m:properties'][0])
    const result = Object.entries(props).map(([k, [v]]) => 
        ({[k.substr(2)]: v._ || v})).reduce((a, o) => Object.assign(a, o), {})
    e.link.forEach(l => {
        const inline = l['m:inline']
        if (inline)
            result[l.$.title] = extractEntry(inline[0].entry[0])
    })

    return result
}

const queryKnesset = async path => {
    const url = `/knesset/${path}`
    const response = await fetch(url)
    const data = (await response.json())
    const error = data['odata.error']
    if (error)
        throw error
    const nextLink = data['odata.nextLink']
    const value = data.feed ? data.feed.entry.map(extractEntry) : extractEntry(data.entry)
    return data.feed ? [...value, ...(nextLink ? await queryKnesset(nextLink) : [])] : value
}

export async function getUserSubjects() {
    return (await (await fetch('/api/user_subjects')).json()).subjects
}

export function setUserSubjects(subjects) {
    const body = new FormData()
    body.append('subjects', JSON.stringify(subjects))
    return fetch('/api/user_subjects', {method: 'POST', body})
}

export async function getSessionItems(sessionIDs) {
    let items = []
    const batchSize = 20
    for (let i = 0; i < sessionIDs.length; i += batchSize) {
        const ids = sessionIDs.slice(i, Math.min(i + batchSize, sessionIDs.length))
        const result = await queryKnesset(`KNS_CmtSessionItem()?$filter=${ids.map(id => `CommitteeSessionID eq ${id}`).join(' or ')}`)
        items = [...items, ...result] 
    }

    return items
}

export async function getCommittees(ids) {
    return queryKnesset(`KNS_Committee()?$filter=${ids.map(id => `CommitteeID eq ${id}`).join(' or ')}`)  
}

export function getCommitteeSessions({startDate, endDate}) {
   return queryKnesset(`KNS_CommitteeSession()?$filter=StatusDesc eq 'פעילה' and StartDate ge DateTime'${startDate.toISOString()}' and StartDate lt DateTime'${endDate.toISOString()}'`)
}

export async function getKnessetData({startDate, endDate}) {
    try {
        const sessions = await getCommitteeSessions({startDate, endDate})
        const committeeIDs = [...new Set(sessions.map(s => s.CommitteeID))]
        const committees = (await getCommittees(committeeIDs)).map(c => ({[c.CommitteeID]: c})).reduce((a, o) => Object.assign(a, o), {})
        const sessionItems = await getSessionItems(sessions.map(s => s.CommitteeSessionID))

        return sessions.map(session => ({
            session,
            committee: committees[session.CommitteeID],
            items: sessionItems.filter(item => item.CommitteeSessionID === session.CommitteeSessionID)
        }))
    } catch (e) {
        console.error(e)
    }
}

export async function getSessionData(sessionItemID) {
    try {
        const item = await queryKnesset(`KNS_CmtSessionItem(${sessionItemID})?$expand=KNS_CommitteeSession/KNS_Committee`)
        const session = item.KNS_CommitteeSession
        const committee = session.KNS_Committee
        delete session.KNS_Committee
        delete item.KNS_CommitteeSession
        const subjects = await getSessionSubjects(item.CmtSessionItemID)
        const remarks = await getSessionRemarks(item.CmtSessionItemID)
        return {item, session, committee, subjects, remarks}
    } catch (e) {
        console.error(e)
    }
}

export async function addSessionRemark(sessionItemID, remark) {
    const body = new FormData()
    body.append('session_id', sessionItemID)
    body.append('remark', remark)
    const response = await fetch(`/api/remarks`, {method: 'POST', body})
    return (await response.json())
}

export async function deleteRemark(sessionItemID, remark) {
    const body = new FormData()
    body.append('session_id', sessionItemID)
    body.append('remark', remark)
    const response = await fetch(`/api/remarks`, {method: 'DELETE', body})
    return (await response.json())
}

export async function updateUserProfile({name, email, photo}) {
    const body = new FormData()
    body.append('name', name)
    body.append('email', email)
    body.append('photo', photo)
    const response = await fetch(`/api/users`, {method: 'PUT', body})
    return (await response.json())
}

export async function getSessionRemarks(sessionItemID) {
    const response = await fetch(`/api/remarks?session_id=${sessionItemID}`)
    return (await response.json()).remarks
}

export async function getCurrentUser() {
    const response = await fetch('/api/me')
    return (await response.json()).user
}

export async function ensureCurrentUser() {
    const self = await getCurrentUser()
    if (self)
        return self

    location.href = `/auth/google?next=${location.href}`
}

export async function getSessionsForUser() {
    const userSubjects = await getUserSubjects()
    const {sessions} = await (await fetch(`/api/sessions?subjects=${userSubjects.join(',')}`)).json()
    return Promise.all(sessions.map(getSessionData))
}

export async function checkNotifications() {
    const prevSessions = JSON.parse(localStorage.getItem('prevSessions') || '[]')
    const sessions = await getSessionsForUser()
//    localStorage.setItem('prevSessions', JSON.stringify(sessions))
    const newSessions = sessions.filter(s => !prevSessions.some(({item: {CmtSessionItemID}}) => CmtSessionItemID === s.item.CmtSessionItemID))
    if (!newSessions.length)
        return

    newSessions.forEach(async s => {
        const ntf = new Notification(`דיון חדש ב${s.committee.Name}`, {body: s.item.Name, icon:'https://cdn2.iconfinder.com/data/icons/mixed-rounded-flat-icon/512/megaphone-64.png'})

        ntf.onclick = () => {
            location.href = `/remarks?item=${s.item.CmtSessionItemID}`
            ntf.close()
        }
    })      
}

export async function initPermissions() {
    const notificationPermission = await Notification.requestPermission()
    if (notificationPermission !== 'granted')
        return

    checkNotifications()
}
