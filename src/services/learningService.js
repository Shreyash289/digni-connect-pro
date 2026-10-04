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

export const learningService = {
  // Fetch survivor skills
  async getSurvivorSkills(survivorId) {
    if (!survivorId) return { data: [], error: null, unavailable: false }
    return handleQuery(async () => {
      return await supabase
        .from('survivor_skills')
        .select('*')
        .eq('survivor_id', survivorId)
    })
  },

  // Save/update survivor skills
  async saveSurvivorSkills(skillsPayload) {
    return handleQuery(async () => {
      return await supabase
        .from('survivor_skills')
        .upsert(skillsPayload)
        .select()
    })
  },

  // List all available courses
  async getCourses() {
    return handleQuery(async () => {
      return await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
    })
  },

  // Fetch course details with reviews
  async getCourseDetails(courseId) {
    if (!courseId) return { data: null, error: 'No course ID provided', unavailable: false }
    return handleQuery(async () => {
      return await supabase
        .from('courses')
        .select(`
          *,
          course_reviews (*)
        `)
        .eq('id', courseId)
        .maybeSingle()
    })
  },

  // Fetch reviews for a course
  async getCourseReviews(courseId) {
    if (!courseId) return { data: [], error: null, unavailable: false }
    return handleQuery(async () => {
      return await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
    })
  },

  // Fetch user course enrollments
  async getEnrollments(survivorId) {
    if (!survivorId) return { data: [], error: null, unavailable: false }
    return handleQuery(async () => {
      return await supabase
        .from('survivor_course_enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('survivor_id', survivorId)
    })
  },

  // Enroll in course
  async enrollInCourse(enrollmentPayload) {
    return handleQuery(async () => {
      return await supabase
        .from('survivor_course_enrollments')
        .insert(enrollmentPayload)
        .select()
        .single()
    })
  },

  // Fetch job/skill mappings
  async getJobSkillMappings() {
    return handleQuery(async () => {
      return await supabase
        .from('job_skill_mapping')
        .select('*')
    })
  },

  // Course recommendations: attempts RPC first, then falls back gracefully
  async getRecommendedCourses(survivorId, userSkills = []) {
    // Attempt RPC if defined in backend
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_recommended_courses', {
        _survivor_id: survivorId
      })
      if (!rpcError && rpcData) {
        return { data: rpcData, error: null, unavailable: false }
      }
    } catch {
      // RPC not available in backend
    }

    // Client-side matching from available courses contract
    const coursesRes = await this.getCourses()
    if (coursesRes.unavailable || !coursesRes.data) {
      return { data: [], error: coursesRes.error, unavailable: coursesRes.unavailable }
    }

    const allCourses = coursesRes.data
    if (!allCourses || allCourses.length === 0) {
      return { data: [], error: null, unavailable: false }
    }

    // Match based on user skills vs course skills/tags
    const recommended = allCourses.map(course => {
      const courseSkills = Array.isArray(course.skills) ? course.skills : (course.topics || [])
      const matchCount = courseSkills.filter(s =>
        userSkills.some(us => us.toLowerCase() === s.toLowerCase())
      ).length
      return {
        ...course,
        matchCount,
        relevanceScore: matchCount > 0 ? (matchCount / Math.max(courseSkills.length, 1)) * 100 : 0
      }
    }).sort((a, b) => b.relevanceScore - a.relevanceScore)

    return { data: recommended, error: null, unavailable: false }
  }
}
