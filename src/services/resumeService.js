import { supabase } from '../integrations/supabase/client'

const handleQuery = async (queryFn) => {
  try {
    const { data, error } = await queryFn()
    if (error) {
      const isUnavailable =
        error.code === 'PGRST116' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST200' ||
        error.code === '42P01' || // relation does not exist
        error.code === '42883' || // function does not exist
        error.message?.includes('does not exist') ||
        error.message?.includes('not found') ||
        error.message?.includes('schema') ||
        error.message?.includes('relation')
      return { data: null, error: error.message, unavailable: isUnavailable }
    }
    return { data, error: null, unavailable: false }
  } catch (err) {
    return { data: null, error: err.message || 'Service query failed', unavailable: true }
  }
}

export const resumeService = {
  // Fetch survivor resume record
  async getSurvivorResume(survivorId) {
    if (!survivorId) return { data: null, error: 'No survivor ID provided', unavailable: false }
    return handleQuery(async () => {
      return await supabase
        .from('survivor_resumes')
        .select('*')
        .eq('survivor_id', survivorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    })
  },

  // Fetch structured resume JSON data
  async getResumeData(resumeId) {
    if (!resumeId) return { data: null, error: 'No resume ID provided', unavailable: false }
    return handleQuery(async () => {
      return await supabase
        .from('survivor_resume_data')
        .select('*')
        .eq('resume_id', resumeId)
        .maybeSingle()
    })
  },

  // Save / Update resume header record
  async saveResume(resumePayload) {
    return handleQuery(async () => {
      return await supabase
        .from('survivor_resumes')
        .upsert(resumePayload, { onConflict: 'survivor_id' }) // one resume per survivor
        .select()
        .single()
    })
  },

  // Save / Update structured resume data
  async saveResumeData(resumeDataPayload) {
    return handleQuery(async () => {
      return await supabase
        .from('survivor_resume_data')
        .upsert(resumeDataPayload, { onConflict: 'resume_id' })
        .select()
        .single()
    })
  },

  // List all resumes for a survivor
  async listResumes(survivorId) {
    if (!survivorId) return { data: [], error: null, unavailable: false }
    return handleQuery(async () => {
      return await supabase
        .from('survivor_resumes')
        .select('*')
        .eq('survivor_id', survivorId)
        .order('created_at', { ascending: false })
    })
  },

  // Upload resume document file to storage bucket if supported
  async uploadResumeDocument(file, path) {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(path, file, { upsert: true })
      if (error) {
        return { data: null, error: error.message, unavailable: true }
      }
      return { data, error: null, unavailable: false }
    } catch (err) {
      return { data: null, error: err.message || 'Upload failed', unavailable: true }
    }
  }
}
