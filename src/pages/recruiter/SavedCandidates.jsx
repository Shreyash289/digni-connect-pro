import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  PageHeader, StatGrid, ErrorBanner, EmptyState, Loading, CandidateCard, CandidateProfileModal, InterviewModal,
  btn, fieldInput, formatDate,
} from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import { listSavedCandidates, toggleSavedCandidate, updateSavedNotes, scheduleInterview } from '../../lib/careers'

export default function SavedCandidates() {
  const { data, loading, error, reload, live, setData } = useLiveQuery(listSavedCandidates, {
    tables: ['saved_candidates', 'job_applications'],
  })
  const [filterSkill, setFilterSkill] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewing, setViewing] = useState(null)
  const [scheduling, setScheduling] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [drafts, setDrafts] = useState({})

  const saved = data ?? []
  const allSkills = [...new Set(saved.flatMap((c) => c.skills))].sort()
  const filtered = filterSkill === 'all' ? saved : saved.filter((c) => c.skills.includes(filterSkill))
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'name' ? a.display_name.localeCompare(b.display_name) : new Date(b.saved_at) - new Date(a.saved_at))

  const remove = async (c) => {
    if (!window.confirm(`Remove ${c.display_name} from your shortlist?`)) return
    setBusyId(c.id)
    try {
      await toggleSavedCandidate(c.id)
      setData((rows) => rows?.filter((r) => r.id !== c.id))
    } catch (err) {
      window.alert(err.message || 'Could not remove candidate.')
    } finally {
      setBusyId(null)
    }
  }

  const saveNotes = async (c) => {
    const notes = drafts[c.id]
    if (notes === undefined || notes === (c.notes ?? '')) return
    try {
      await updateSavedNotes(c.id, notes)
      setData((rows) => rows?.map((r) => (r.id === c.id ? { ...r, notes } : r)))
      setDrafts(({ [c.id]: _, ...rest }) => rest)
    } catch (err) {
      window.alert(err.message || 'Could not save notes.')
    }
  }

  return (
    <Layout>
      <PageHeader title="📌 Shortlisted Candidates" subtitle="Candidates you've shortlisted from search or from your applicants" live={live} />

      <StatGrid stats={[
        { label: 'Shortlisted', value: saved.length, color: '#7C3AED', bg: '#F5F3FF' },
        { label: 'Profile 60%+ complete', value: saved.filter((c) => c.profile_completion >= 60).length, color: '#059669', bg: '#F0FDF4' },
        { label: 'With notes', value: saved.filter((c) => c.notes).length, color: '#2563EB', bg: '#EFF6FF' },
      ]} />

      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <select style={{ ...fieldInput, width: 'auto' }} value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
          <option value="all">All skills</option>
          {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={{ ...fieldInput, width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Recently shortlisted</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loading /> : sorted.length === 0 ? (
        <EmptyState
          title="No shortlisted candidates yet"
          hint="Press 📌 on a candidate in Search Talent, or Shortlist an applicant, to add them here."
          action={<Link to="/recruiter/search" style={btn('primary', { textDecoration: 'none' })}>Search talent</Link>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {sorted.map((c) => (
            <CandidateCard
              key={c.id}
              c={c}
              onView={() => setViewing(c)}
              footer={
                <>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>Shortlisted {formatDate(c.saved_at)}</div>
                  <textarea
                    value={drafts[c.id] ?? c.notes ?? ''}
                    onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                    onBlur={() => saveNotes(c)}
                    placeholder="Private notes about this candidate (saved automatically)"
                    style={{ ...fieldInput, fontSize: 12, minHeight: 54, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={btn('teal', { flex: 1 })} onClick={() => setScheduling(c)}>📅 Interview</button>
                    <button style={btn('danger', { flex: 1 })} disabled={busyId === c.id} onClick={() => remove(c)}>Remove</button>
                  </div>
                </>
              }
            />
          ))}
        </div>
      )}

      {viewing && <CandidateProfileModal c={viewing} onClose={() => setViewing(null)} />}

      {scheduling && (
        <InterviewModal
          title="Schedule interview"
          candidateName={scheduling.display_name}
          onClose={() => setScheduling(null)}
          onSubmit={async (v) => {
            await scheduleInterview({ survivorId: scheduling.id, ...v })
            window.alert('Interview scheduled. You can manage it under My Interviews.')
            reload()
          }}
        />
      )}
    </Layout>
  )
}
