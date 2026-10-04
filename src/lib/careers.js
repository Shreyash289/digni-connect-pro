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

// ----- NGO partner -----
export const getMyOrg = () => rpc('ngo_get_my_org')
export const saveMyOrg = (org) => rpc('ngo_save_my_org', { _p: org })
export const listNgoSurvivors = async () => (await rpc('ngo_list_survivors')) ?? []
export const saveNgoSurvivor = (id, profile) => rpc('ngo_save_survivor', { _id: id ?? null, _p: profile })

// ----- documents review (NGO for own survivors, admin for all) -----
export const listReviewableDocuments = async (status) =>
  (await rpc('list_reviewable_documents', { _status: status ?? null })) ?? []
export const reviewDocument = (id, status) => rpc('review_document', { _document_id: id, _status: status })

export async function openDocument(storagePath, fileName) {
  const { data, error } = await supabase.storage
    .from('survivor-documents')
    .createSignedUrl(storagePath, 60, fileName ? { download: fileName } : undefined)
  if (error) throw error
  window.open(data.signedUrl, '_blank', 'noopener')
}

// ----- admin -----
export const getAdminOverview = () => rpc('admin_overview')
export const setNgoStatus = (id, status, reason) => rpc('admin_set_ngo_status', { _id: id, _status: status, _reason: reason ?? null })
export const setRecruiterStatus = (id, status) => rpc('admin_set_recruiter_status', { _id: id, _status: status })
export const setSurvivorStatus = (id, status, reason) => rpc('admin_set_survivor_status', { _id: id, _status: status, _reason: reason ?? null })
export const getAdminAnalytics = () => rpc('admin_analytics')
export const getPublicStats = () => rpc('public_platform_stats')

// ----- survivor journey (same stages for survivor + NGO views) -----
export const JOURNEY = ['Registered', 'Profile complete', 'Applied to jobs', 'Interviewing', 'Offer received', 'Employed']

// counts: { completion, applications, interviews, offers, hired } → 1..6
export function journeyStage({ completion = 0, applications = 0, interviews = 0, offers = 0, hired = 0 }) {
  if (hired > 0) return 6
  if (offers > 0) return 5
  if (interviews > 0) return 4
  if (applications > 0) return 3
  if (completion >= 60) return 2
  return 1
}

export const SURVIVOR_STATUS = {
  draft: { label: 'Draft', color: '#6B7280', bg: '#F3F4F6' },
  submitted: { label: 'Awaiting review', color: '#D97706', bg: '#FFFBEB' },
  under_review: { label: 'Under review', color: '#D97706', bg: '#FFFBEB' },
  approved: { label: 'Verified', color: '#059669', bg: '#D1FAE5' },
  rejected: { label: 'Changes needed', color: '#DC2626', bg: '#FEE2E2' },
}

export const DOC_STATUS = {
  verified: { label: '✓ Verified', bg: '#D1FAE5', color: '#059669' },
  pending: { label: '⏳ Pending', bg: '#FEF3C7', color: '#D97706' },
  rejected: { label: '✕ Rejected', bg: '#FEE2E2', color: '#DC2626' },
}

export const DOC_TYPES = {
  id_proof: 'ID Proof', education: 'Education', bgv: 'Background Verification',
  resume: 'Resume', photo: 'Photograph', other: 'Other',
}

// Picklist for the skills selector (not sample data — just suggestions)
export const SKILL_SUGGESTIONS = [
  'Data Entry', 'MS Office', 'Tailoring', 'Teaching', 'Child Care',
  'Carpentry', 'Plumbing', 'Cooking', 'Housekeeping', 'Embroidery',
  'Garment Stitching', 'Electrical Work', 'Accounting', 'Tally',
  'Security Guard', 'Nursing Assistant', 'Painting', 'Driving (2W)',
  'Customer Service', 'Tamil Typing', 'Mobile Repair', 'AC Repair',
]

export function timeAgo(value) {
  if (!value) return ''
  const s = Math.round((Date.now() - new Date(value).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`
  return formatDate(value)
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
