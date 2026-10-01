import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import {
  PageHeader, ErrorBanner, EmptyState, Loading, CandidateCard, CandidateProfileModal, InterviewModal, btn, fieldInput, fieldLabel,
} from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import { searchSurvivors, toggleSavedCandidate, scheduleInterview } from '../../lib/careers'

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export default function SearchSurvivors() {
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const skill = useDebounced(searchSkill.trim())
  const location = useDebounced(searchLocation.trim())
  const [viewing, setViewing] = useState(null)
  const [scheduling, setScheduling] = useState(null)
  const [savingId, setSavingId] = useState(null)

  // Survivor profiles aren't streamed to recruiters (privacy), so refresh periodically
  const { data, loading, error, reload, live, setData } = useLiveQuery(
    () => searchSurvivors(skill, location),
    { tables: ['saved_candidates'], pollMs: 20000, deps: [skill, location] },
  )
  const results = data ?? []

  const toggleSave = async (c) => {
    setSavingId(c.id)
    try {
      const saved = await toggleSavedCandidate(c.id)
      setData((rows) => rows?.map((r) => (r.id === c.id ? { ...r, is_saved: saved } : r)))
      setViewing((v) => (v && v.id === c.id ? { ...v, is_saved: saved } : v))
    } catch (err) {
      window.alert(err.message || 'Could not update your shortlist.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Layout>
      <PageHeader title="🔍 Search Talent" subtitle="Find survivors matching your job requirements" live={live} />

      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div>
          <label style={fieldLabel}>Skill or role</label>
          <input style={fieldInput} value={searchSkill} onChange={(e) => setSearchSkill(e.target.value)} placeholder="Data Entry, Teaching, etc" />
        </div>
        <div>
          <label style={fieldLabel}>Location</label>
          <input style={fieldInput} value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} placeholder="Chennai, Bangalore, etc" />
        </div>
      </div>

      <ErrorBanner message={error} />

      {!loading && (
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
          {results.length} candidate{results.length === 1 ? '' : 's'}{skill || location ? ' match your search' : ' available'}
        </div>
      )}

      {loading ? <Loading label="Searching…" /> : results.length === 0 ? (
        <EmptyState
          title={skill || location ? 'No candidates match this search' : 'No candidates available yet'}
          hint="Survivors appear here once they turn on “Visible to recruiters” in their profile. Survivors who apply to your jobs always appear under Applicants."
          action={(skill || location) && <button style={btn('ghost')} onClick={() => { setSearchSkill(''); setSearchLocation('') }}>Clear search</button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {results.map((c) => (
            <CandidateCard
              key={c.id}
              c={c}
              saving={savingId === c.id}
              onToggleSave={() => toggleSave(c)}
              onView={() => setViewing(c)}
            />
          ))}
        </div>
      )}

      {viewing && (
        <CandidateProfileModal
          c={viewing}
          onClose={() => setViewing(null)}
          actions={[
            <button key="iv" style={btn('teal', { flex: 1, padding: '10px' })} onClick={() => setScheduling(viewing)}>📅 Schedule interview</button>,
            <button key="sv" style={btn(viewing.is_saved ? 'outlinePurple' : 'ghost', { padding: '10px 14px' })}
              disabled={savingId === viewing.id} onClick={() => toggleSave(viewing)}>
              {viewing.is_saved ? '🔖 Shortlisted' : '📌 Shortlist'}
            </button>,
          ]}
        />
      )}

      {scheduling && (
        <InterviewModal
          title="Schedule interview"
          candidateName={scheduling.display_name}
          onClose={() => setScheduling(null)}
          onSubmit={async (v) => {
            await scheduleInterview({ survivorId: scheduling.id, ...v })
            setViewing(null)
            window.alert('Interview scheduled. You can manage it under My Interviews.')
            reload()
          }}
        />
      )}
    </Layout>
  )
}
