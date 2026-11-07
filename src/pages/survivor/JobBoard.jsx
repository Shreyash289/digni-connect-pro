import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  PageHeader, ErrorBanner, EmptyState, Loading, Modal, StatusPill, Tag, btn, fieldInput, fieldLabel,
} from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import { listOpenJobs, applyToJob, EMPLOYMENT_TYPES, formatSalary, jobLocation, formatDate } from '../../lib/careers'

export default function JobBoard() {
  const navigate = useNavigate()
  const { data, loading, error, reload, live } = useLiveQuery(listOpenJobs, {
    tables: ['jobs', 'job_applications'],
    pollMs: 60000,
  })
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [viewing, setViewing] = useState(null)
  const [applying, setApplying] = useState(null)

  const jobs = data ?? []
  const q = query.trim().toLowerCase()
  const filtered = jobs.filter((j) =>
    (type === 'all' || j.employment_type === type) &&
    (!q || [j.title, j.company_name, j.description, j.location_region, ...(j.required_skills ?? [])]
      .some((v) => v?.toLowerCase().includes(q))))

  return (
    <Layout>
      <PageHeader title="💼 Job Board" subtitle="Jobs posted by recruiters on CAREVIA. New jobs appear here automatically." live={live} />

      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input style={{ ...fieldInput, flex: '1 1 260px' }} value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍  Search by title, company, skill or city…" />
        <select style={{ ...fieldInput, width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All job types</option>
          {Object.entries(EMPLOYMENT_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loading label="Loading jobs…" /> : filtered.length === 0 ? (
        <EmptyState
          title={jobs.length ? 'No jobs match your search' : 'No jobs available right now'}
          hint={jobs.length ? null : 'This page updates by itself. Jobs appear here as soon as recruiters publish them.'}
        />
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} onView={() => setViewing(job)} onApply={() => setApplying(job)}
              onTrack={() => navigate('/survivor/applications')} />
          ))}
        </div>
      )}

      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)} width={600}>
          <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: -10, marginBottom: 14 }}>
            {[viewing.company_name, jobLocation(viewing), EMPLOYMENT_TYPES[viewing.employment_type]].filter(Boolean).join(' · ')}
          </div>
          {formatSalary(viewing) && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>{formatSalary(viewing)}</div>}
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 16 }}>{viewing.description}</div>
          {viewing.required_skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {viewing.required_skills.map((s) => <Tag key={s}>{s}</Tag>)}
            </div>
          )}
          {viewing.closes_at && <div style={{ fontSize: 12, color: '#D97706', marginBottom: 16 }}>Applications close {formatDate(viewing.closes_at)}</div>}
          {viewing.application_status ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusPill status={viewing.application_status} />
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>You've applied to this job.</span>
            </div>
          ) : (
            <button style={btn('primary', { padding: '10px 18px', fontSize: 13 })} onClick={() => { setApplying(viewing); setViewing(null) }}>
              Apply now →
            </button>
          )}
        </Modal>
      )}

      {applying && (
        <ApplyModal job={applying} onClose={() => setApplying(null)} onApplied={reload} />
      )}
    </Layout>
  )
}

function JobCard({ job, onView, onApply, onTrack }) {
  const salary = formatSalary(job)
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>{job.title}</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{job.company_name}</div>
        </div>
        {job.application_status && <StatusPill status={job.application_status} />}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 10 }}>
        📍 {jobLocation(job)} · {EMPLOYMENT_TYPES[job.employment_type]}{salary ? ` · ${salary}` : ''}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.description}
      </div>
      {job.required_skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {job.required_skills.map((s) => <Tag key={s}>{s}</Tag>)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={btn('ghost')} onClick={onView}>View details</button>
        {job.application_status
          ? <button style={btn('outlinePurple')} onClick={onTrack}>Track application →</button>
          : <button style={btn('primary')} onClick={onApply}>Apply now</button>}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8A97B5' }}>Posted {formatDate(job.published_at)}</span>
      </div>
    </div>
  )
}

function ApplyModal({ job, onClose, onApplied }) {
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await applyToJob(job.id, note)
      setDone(true)
      onApplied()
    } catch (err) {
      setError(err.message || 'Could not submit your application.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={done ? 'Application sent 🎉' : `Apply: ${job.title}`} onClose={onClose} width={500}>
      {done ? (
        <>
          <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>
            Your application to <strong>{job.company_name}</strong> has been sent. You can follow its progress in My Applications.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
            <button style={btn('ghost')} onClick={onClose}>Keep browsing</button>
            <button style={btn('primary')} onClick={() => navigate('/survivor/applications')}>My Applications →</button>
          </div>
        </>
      ) : (
        <>
          <ErrorBanner message={error} />
          <p style={{ fontSize: 13, color: 'var(--ink2)', marginTop: -6, marginBottom: 16, lineHeight: 1.6 }}>
            {job.company_name} will see your CAREVIA profile (first name and last initial, skills, education and experience).
            Your full name and contact details stay private.
          </p>
          <label style={fieldLabel}>Message to the recruiter (optional)</label>
          <textarea style={{ ...fieldInput, minHeight: 100, resize: 'vertical' }} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Why you're interested, when you can start…" />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
            <button style={btn('ghost')} onClick={onClose}>Cancel</button>
            <button style={btn('primary', { opacity: busy ? 0.6 : 1 })} disabled={busy} onClick={submit}>
              {busy ? 'Sending…' : 'Submit application'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
