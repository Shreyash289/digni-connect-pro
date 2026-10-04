import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  PageHeader, StatGrid, ErrorBanner, EmptyState, Loading, Modal, Tag, btn, fieldLabel, fieldInput,
} from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import {
  listMyJobs, saveJob, setJobStatus, deleteJob, EMPLOYMENT_TYPES, formatSalary, jobLocation, formatDate,
} from '../../lib/careers'

const JOB_STATUS = {
  draft: { label: 'Draft', color: '#6B7280', bg: '#F3F4F6' },
  published: { label: 'Live', color: '#059669', bg: '#D1FAE5' },
  closed: { label: 'Closed', color: '#DC2626', bg: '#FEE2E2' },
}

const EMPTY_JOB = {
  title: '', description: '', required_skills: '', location_region: '', location_country: 'India',
  remote_ok: false, employment_type: 'full_time', salary_min: '', salary_max: '', closes_at: '',
}

export default function JobPostings() {
  const navigate = useNavigate()
  const { data, loading, error, reload, live } = useLiveQuery(listMyJobs, { tables: ['jobs', 'job_applications'] })
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const jobs = data ?? []

  const act = async (id, fn) => {
    setBusyId(id)
    try {
      await fn()
      await reload()
    } catch (err) {
      window.alert(err.message || 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const remove = (job) => {
    const extra = job.applicant_count ? ` Its ${job.applicant_count} application(s) will also be deleted.` : ''
    if (window.confirm(`Delete "${job.title}" permanently?${extra} Closing the job keeps its history instead.`)) {
      act(job.id, () => deleteJob(job.id))
    }
  }

  return (
    <Layout>
      <PageHeader
        title="💼 Job Postings"
        subtitle="Post jobs for survivors to apply to, and manage who applied"
        live={live}
        action={<button style={btn('primary', { padding: '9px 16px', fontSize: 13 })} onClick={() => setEditing(EMPTY_JOB)}>+ Post a job</button>}
      />

      <StatGrid stats={[
        { label: 'Live jobs', value: jobs.filter((j) => j.status === 'published').length, color: '#059669', bg: '#F0FDF4' },
        { label: 'Drafts', value: jobs.filter((j) => j.status === 'draft').length, color: '#6B7280', bg: '#F3F4F6' },
        { label: 'Total applicants', value: jobs.reduce((n, j) => n + j.applicant_count, 0), color: '#2563EB', bg: '#EFF6FF' },
        { label: 'New (unreviewed)', value: jobs.reduce((n, j) => n + j.new_count, 0), color: '#D97706', bg: '#FFFBEB' },
      ]} />

      <ErrorBanner message={error} />

      {loading ? <Loading /> : jobs.length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          hint="Post your first job. It appears on every survivor's Job Board as soon as you publish it."
          action={<button style={btn('primary')} onClick={() => setEditing(EMPTY_JOB)}>+ Post a job</button>}
        />
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {jobs.map((job) => {
            const st = JOB_STATUS[job.status] ?? JOB_STATUS.draft
            const busy = busyId === job.id
            const salary = formatSalary(job)
            return (
              <div key={job.id} className="card" style={{ padding: 20, opacity: busy ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3F' }}>{job.title}</span>
                      <span style={{ padding: '3px 9px', background: st.bg, color: st.color, borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      {[job.company_name, jobLocation(job), EMPLOYMENT_TYPES[job.employment_type], salary].filter(Boolean).join(' · ')}
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                      {job.status === 'published' ? `Published ${formatDate(job.published_at)}` : `Created ${formatDate(job.created_at)}`}
                      {job.closes_at ? ` · Closes ${formatDate(job.closes_at)}` : ''}
                    </div>
                  </div>
                  <button
                    style={btn('outlinePurple', { alignSelf: 'flex-start' })}
                    onClick={() => navigate(`/recruiter/applicants?job=${job.id}`)}
                  >
                    👥 {job.applicant_count} applicant{job.applicant_count === 1 ? '' : 's'}
                    {job.new_count > 0 && <span style={{ marginLeft: 6, background: '#D97706', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 10 }}>{job.new_count} new</span>}
                  </button>
                </div>

                {job.required_skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                    {job.required_skills.map((s) => <Tag key={s}>{s}</Tag>)}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {job.status !== 'published' && (
                    <button disabled={busy} style={btn('success')} onClick={() => act(job.id, () => setJobStatus(job.id, 'published'))}>
                      {job.status === 'closed' ? 'Reopen' : 'Publish'}
                    </button>
                  )}
                  {job.status === 'published' && (
                    <button disabled={busy} style={btn('ghost')} onClick={() => act(job.id, () => setJobStatus(job.id, 'closed'))}>Close applications</button>
                  )}
                  <button disabled={busy} style={btn('ghost')} onClick={() => setEditing({
                    ...job,
                    required_skills: (job.required_skills ?? []).join(', '),
                    salary_min: job.salary_min ?? '',
                    salary_max: job.salary_max ?? '',
                    closes_at: job.closes_at ? job.closes_at.slice(0, 10) : '',
                    location_region: job.location_region ?? '',
                    location_country: job.location_country ?? '',
                  })}>Edit</button>
                  <button disabled={busy} style={btn('danger')} onClick={() => remove(job)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && <JobForm initial={editing} onClose={() => setEditing(null)} onSaved={reload} />}
    </Layout>
  )
}

function JobForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const isNew = !initial.id

  const submit = async (publish) => {
    if (!form.title.trim()) return setError('Job title is required.')
    if (!form.description.trim()) return setError('Please describe the job.')
    const min = form.salary_min === '' ? null : Number(form.salary_min)
    const max = form.salary_max === '' ? null : Number(form.salary_max)
    if (min != null && max != null && min > max) return setError('Minimum salary is higher than maximum.')

    setBusy(true)
    setError('')
    try {
      const payload = {
        id: initial.id,
        title: form.title.trim(),
        description: form.description.trim(),
        required_skills: form.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
        location_region: form.location_region.trim() || null,
        location_country: form.location_country.trim() || null,
        remote_ok: form.remote_ok,
        employment_type: form.employment_type,
        salary_min: min,
        salary_max: max,
        currency: 'INR',
        closes_at: form.closes_at ? new Date(`${form.closes_at}T23:59:59`).toISOString() : null,
      }
      if (publish) {
        payload.status = 'published'
        payload.published_at = new Date().toISOString()
      } else if (isNew) {
        payload.status = 'draft'
      }
      await saveJob(payload)
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save the job.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isNew ? 'Post a new job' : 'Edit job'} onClose={onClose} width={600}>
      <ErrorBanner message={error} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Job title *</label>
          <input style={fieldInput} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Data Entry Operator" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Description *</label>
          <textarea style={{ ...fieldInput, minHeight: 110, resize: 'vertical' }} value={form.description}
            onChange={(e) => set('description', e.target.value)} placeholder="What the role involves, working hours, support offered…" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Required skills (comma separated)</label>
          <input style={fieldInput} value={form.required_skills} onChange={(e) => set('required_skills', e.target.value)} placeholder="Data Entry, MS Office" />
        </div>
        <div>
          <label style={fieldLabel}>City / State</label>
          <input style={fieldInput} value={form.location_region} onChange={(e) => set('location_region', e.target.value)} placeholder="Chennai, Tamil Nadu" />
        </div>
        <div>
          <label style={fieldLabel}>Country</label>
          <input style={fieldInput} value={form.location_country} onChange={(e) => set('location_country', e.target.value)} />
        </div>
        <div>
          <label style={fieldLabel}>Employment type</label>
          <select style={fieldInput} value={form.employment_type} onChange={(e) => set('employment_type', e.target.value)}>
            {Object.entries(EMPLOYMENT_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Applications close on (optional)</label>
          <input type="date" style={fieldInput} value={form.closes_at} onChange={(e) => set('closes_at', e.target.value)} />
        </div>
        <div>
          <label style={fieldLabel}>Monthly salary from (₹)</label>
          <input type="number" min="0" style={fieldInput} value={form.salary_min} onChange={(e) => set('salary_min', e.target.value)} />
        </div>
        <div>
          <label style={fieldLabel}>Monthly salary to (₹)</label>
          <input type="number" min="0" style={fieldInput} value={form.salary_max} onChange={(e) => set('salary_max', e.target.value)} />
        </div>
        <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
          <input type="checkbox" checked={form.remote_ok} onChange={(e) => set('remote_ok', e.target.checked)} />
          Remote work is possible
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 22, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button style={btn('ghost')} onClick={onClose}>Cancel</button>
        <button style={btn('ghost')} disabled={busy} onClick={() => submit(false)}>
          {isNew ? 'Save as draft' : 'Save changes'}
        </button>
        {initial.status !== 'published' && (
          <button style={btn('success', { opacity: busy ? 0.6 : 1 })} disabled={busy} onClick={() => submit(true)}>
            {busy ? 'Saving…' : 'Publish now'}
          </button>
        )}
      </div>
    </Modal>
  )
}
