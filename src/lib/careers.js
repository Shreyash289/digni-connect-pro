import { supabase } from '../integrations/supabase/client'

// Thin wrappers over the RPCs in
// supabase/migrations/20261001010000_jobs_applications_live.sql

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw error
  return data
}

// ----- survivor -----
export const getMySurvivor = () => rpc('get_my_survivor')
export const saveMySurvivorProfile = (profile) => rpc('save_my_survivor_profile', { _p: profile })
export const listOpenJobs = async () => (await rpc('list_open_jobs')) ?? []
export const applyToJob = (jobId, coverNote) => rpc('apply_to_job', { _job_id: jobId, _cover_note: coverNote ?? null })
export const withdrawApplication = (applicationId) => rpc('withdraw_application', { _application_id: applicationId })
export const listMyApplications = async () => (await rpc('survivor_list_my_applications')) ?? []
export const listMySurvivorInterviews = async () => (await rpc('survivor_list_my_interviews')) ?? []

// ----- recruiter -----
export const getMyRecruiter = () => rpc('get_my_recruiter')
export const searchSurvivors = async (query, location) =>
  (await rpc('search_survivors', { _query: query || null, _location: location || null })) ?? []
export const toggleSavedCandidate = (survivorId) => rpc('toggle_saved_candidate', { _survivor_id: survivorId })
export const updateSavedNotes = (survivorId, notes) =>
  rpc('update_saved_candidate_notes', { _survivor_id: survivorId, _notes: notes })
export const listSavedCandidates = async () => (await rpc('recruiter_list_saved')) ?? []
export const listMyJobs = async () => (await rpc('recruiter_list_my_jobs')) ?? []
export const listApplicants = async (jobId) => (await rpc('recruiter_list_applicants', { _job_id: jobId || null })) ?? []
export const setApplicationStatus = (applicationId, status, note) =>
  rpc('recruiter_set_application_status', { _application_id: applicationId, _status: status, _note: note ?? null })
export const scheduleInterview = ({ applicationId, survivorId, scheduledAt, interviewType, videoLink, notes }) =>
  rpc('schedule_interview', {
    _application_id: applicationId ?? null,
    _survivor_id: survivorId ?? null,
    _scheduled_at: scheduledAt,
    _interview_type: interviewType,
    _video_link: videoLink ?? null,
    _notes: notes ?? null,
  })
export const listMyInterviews = async () => (await rpc('recruiter_list_interviews')) ?? []

export async function saveJob(job) {
  const { id, ...fields } = job
  if (id) {
    const { error } = await supabase.from('jobs').update(fields).eq('id', id)
    if (error) throw error
    return id
  }
  const recruiter = await getMyRecruiter()
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...fields, recruiter_id: recruiter.id, company_name: fields.company_name || recruiter.company_name })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function setJobStatus(jobId, status) {
  const patch = { status }
  if (status === 'published') patch.published_at = new Date().toISOString()
  const { error } = await supabase.from('jobs').update(patch).eq('id', jobId)
  if (error) throw error
}

export async function deleteJob(jobId) {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) throw error
}

export async function updateInterview(interviewId, patch) {
  const { error } = await supabase.from('interviews').update(patch).eq('id', interviewId)
  if (error) throw error
}

// ----- display helpers -----
export const EMPLOYMENT_TYPES = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
}

export const APPLICATION_STATUS = {
  submitted: { label: 'Applied', color: '#2563EB', bg: '#EFF6FF' },
  reviewing: { label: 'Under review', color: '#D97706', bg: '#FFFBEB' },
  shortlisted: { label: 'Shortlisted', color: '#7C3AED', bg: '#F5F3FF' },
  interview_scheduled: { label: 'Interview', color: '#0D9488', bg: '#F0FDFA' },
  offered: { label: 'Offered', color: '#059669', bg: '#F0FDF4' },
  hired: { label: 'Hired', color: '#047857', bg: '#ECFDF5' },
  rejected: { label: 'Not selected', color: '#DC2626', bg: '#FEF2F2' },
}

export const statusInfo = (status) =>
  APPLICATION_STATUS[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6' }

export function formatSalary(job) {
  const fmt = (n) => Number(n).toLocaleString('en-IN')
  const cur = job.currency === 'INR' || !job.currency ? '₹' : `${job.currency} `
  if (job.salary_min && job.salary_max) return `${cur}${fmt(job.salary_min)} – ${cur}${fmt(job.salary_max)} / month`
  if (job.salary_min) return `From ${cur}${fmt(job.salary_min)} / month`
  if (job.salary_max) return `Up to ${cur}${fmt(job.salary_max)} / month`
  return null
}

export function jobLocation(job) {
  const place = [job.location_region, job.location_country].filter(Boolean).join(', ')
  if (job.remote_ok) return place ? `${place} · Remote OK` : 'Remote'
  return place || 'Location not specified'
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}
