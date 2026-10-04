import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { learningService } from '../../services/learningService'

export default function SurvivorCourses() {
  const [courses, setCourses] = useState([])
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [userEnrollments, setUserEnrollments] = useState([])
  const [userSkills, setUserSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusNotice, setStatusNotice] = useState(null)
  const [isDemoUser, setIsDemoUser] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')

  // Selected course for modal/detail inspect
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseReviews, setCourseReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const userId = localStorage.getItem('userId')
  const userEmail = localStorage.getItem('email') || ''

  useEffect(() => {
    const isDemo = !userId || userEmail.includes('demo')
    setIsDemoUser(isDemo)
    loadAllLearningData(userId, isDemo)
  }, [userId, userEmail])

  const loadAllLearningData = async (uid, isDemo) => {
    setLoading(true)
    setStatusNotice(null)

    // 1. Load User Skills (from Supabase or local storage draft)
    let currentSkills = []
    if (uid && !isDemo) {
      const skillsRes = await learningService.getSurvivorSkills(uid)
      if (skillsRes.data && skillsRes.data.length > 0) {
        currentSkills = skillsRes.data.map((s) => (typeof s === 'string' ? s : s.skill_name || s.name || '')).filter(Boolean)
      }
    }

    if (currentSkills.length === 0) {
      const localSkills = localStorage.getItem('carevia_survivor_skills_draft')
      if (localSkills) {
        try {
          const parsed = JSON.parse(localSkills)
          if (Array.isArray(parsed)) currentSkills = parsed
        } catch {
          // Ignore
        }
      }
    }
    setUserSkills(currentSkills)

    // 2. Fetch Courses
    const coursesRes = await learningService.getCourses()
    if (coursesRes.unavailable) {
      setStatusNotice({ type: 'warning', text: 'Learning data is temporarily unavailable.' })
      setLoading(false)
      return
    } else if (coursesRes.error) {
      setStatusNotice({ type: 'error', text: 'Failed to load courses.' })
      setLoading(false)
      return
    }

    const fetchedCourses = coursesRes.data || []
    setCourses(fetchedCourses)

    // 3. Fetch Enrollments if authenticated
    if (uid && !isDemo) {
      const enrollRes = await learningService.getEnrollments(uid)
      if (enrollRes.data) {
        setUserEnrollments(enrollRes.data)
      }
    }

    // 4. Fetch Recommended Courses
    if (fetchedCourses.length > 0) {
      const recRes = await learningService.getRecommendedCourses(uid, currentSkills)
      if (recRes.data && recRes.data.length > 0) {
        setRecommendedCourses(recRes.data)
      }
    }

    setLoading(false)
  }

  // Load reviews when opening a course detail
  const handleOpenCourseDetail = async (course) => {
    setSelectedCourse(course)
    setLoadingReviews(true)
    setCourseReviews([])

    const reviewsRes = await learningService.getCourseReviews(course.id)
    if (reviewsRes.data) {
      setCourseReviews(reviewsRes.data)
    }
    setLoadingReviews(false)
  }

  // Handle Enrollment
  const handleEnroll = async (courseId) => {
    if (isDemoUser) {
      alert('Sign in with your account to enroll in courses.')
      return
    }

    setEnrolling(true)
    const payload = {
      survivor_id: userId,
      course_id: courseId,
      status: 'enrolled',
      enrolled_at: new Date().toISOString()
    }

    const { data, error, unavailable } = await learningService.enrollInCourse(payload)

    if (unavailable) {
      alert('Course enrollment service is currently unavailable.')
    } else if (error) {
      alert(`Enrollment failed: ${error}`)
    } else if (data) {
      alert('Successfully enrolled in course!')
      // Refresh enrollments
      const enrollRes = await learningService.getEnrollments(userId)
      if (enrollRes.data) {
        setUserEnrollments(enrollRes.data)
      }
    }
    setEnrolling(false)
  }

  const getEnrollmentState = (courseId) => {
    const found = userEnrollments.find(
      (e) => e.course_id === courseId || e.courses?.id === courseId
    )
    if (!found) return null
    return found
  }

  // Filtering Courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchQuery ||
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDifficulty =
      selectedDifficulty === 'All' ||
      (course.difficulty && course.difficulty.toLowerCase() === selectedDifficulty.toLowerCase())

    return matchesSearch && matchesDifficulty
  })

  // Extract unique difficulties for dropdown
  const availableDifficulties = [
    'All',
    ...Array.from(new Set(courses.map((c) => c.difficulty).filter(Boolean)))
  ]

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink2)' }}>
          Loading courses and recommendations...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 24 }}>
          Courses & Learning Pathways
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Skill development and vocational courses tailored for career readiness.
        </p>
      </div>

      {statusNotice && (
        <div
          style={{
            marginBottom: 24,
            padding: '12px 16px',
            borderRadius: 'var(--r-card)',
            fontSize: 14,
            background: statusNotice.type === 'warning' ? '#fffaf0' : '#fff5f5',
            color: statusNotice.type === 'warning' ? '#9c4221' : '#c53030',
            border: `1px solid ${statusNotice.type === 'warning' ? '#fbd38d' : '#feb2b2'}`
          }}
        >
          {statusNotice.text}
        </div>
      )}

      {/* Recommended For You Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <h3 style={{ color: 'var(--navy)', margin: 0, fontSize: 18 }}>
            Recommended for you
          </h3>
          <span className="badge" style={{ background: 'var(--navy)', color: '#ffffff' }}>
            Personalized
          </span>
        </div>

        {recommendedCourses.length === 0 ? (
          <div className="card-light" style={{ padding: 24, borderRadius: 'var(--r-card)' }}>
            <p style={{ margin: '0 0 6px 0', fontWeight: 500, color: 'var(--navy)', fontSize: 14 }}>
              Recommendations will appear once we have enough profile information.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink2)' }}>
              Add your current skills on the Skills page to receive customized course matches.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {recommendedCourses.slice(0, 3).map((course) => {
              const enrollment = getEnrollmentState(course.id)
              const skillsCovered = Array.isArray(course.skills) ? course.skills : course.topics || []

              return (
                <div
                  key={course.id}
                  className="card"
                  style={{
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    borderLeft: '4px solid var(--royal)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <span className="badge" style={{ fontSize: 11, background: 'var(--mist)', color: 'var(--navy)' }}>
                        {course.provider || 'CareVia Partner'}
                      </span>
                      {course.relevanceScore > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--royal)' }}>
                          Client Match Score: {Math.round(course.relevanceScore)}%
                        </span>
                      )}
                    </div>

                    <h4 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 16 }}>
                      {course.title}
                    </h4>

                    <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 12px 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description || 'Comprehensive learning module designed to build essential workforce competencies.'}
                    </p>

                    {skillsCovered.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                        {skillsCovered.map((sk, idx) => (
                          <span key={idx} style={{ background: '#edf2f7', color: '#2d3748', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                      {course.duration ? `${course.duration}` : ''} {course.difficulty ? `· ${course.difficulty}` : ''}
                    </div>

                    <button
                      onClick={() => handleOpenCourseDetail(course)}
                      className="btn-soft"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Course Search & Filter Bar */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="input"
            placeholder="Search courses by title, provider, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: '1 1 240px' }}
          />

          {availableDifficulties.length > 1 && (
            <select
              className="input"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{ width: 'auto', minWidth: 140 }}
            >
              {availableDifficulties.map((diff) => (
                <option key={diff} value={diff}>
                  Difficulty: {diff}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Courses Grid */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--navy)', margin: 0, fontSize: 18 }}>
            All Available Courses
          </h3>
          <span className="badge">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--navy)', fontWeight: 500, margin: '0 0 6px 0', fontSize: 15 }}>
              No courses match your search criteria.
            </p>
            <p style={{ color: 'var(--ink2)', fontSize: 13, margin: 0 }}>
              Try adjusting your search keywords or clearing filters.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filteredCourses.map((course) => {
              const enrollment = getEnrollmentState(course.id)
              const skillsCovered = Array.isArray(course.skills) ? course.skills : course.topics || []

              return (
                <div
                  key={course.id}
                  className="card"
                  style={{
                    padding: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span className="badge" style={{ fontSize: 11, background: 'var(--mist)', color: 'var(--navy)' }}>
                        {course.provider || 'CareVia Partner'}
                      </span>
                      {enrollment && (
                        <span className="badge" style={{ background: 'var(--navy)', color: '#ffffff', fontSize: 11 }}>
                          {enrollment.status || 'Enrolled'}
                        </span>
                      )}
                    </div>

                    <h4 style={{ color: 'var(--navy)', margin: '0 0 8px 0', fontSize: 17 }}>
                      {course.title}
                    </h4>

                    <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 14px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description || 'Vocational and skill training course.'}
                    </p>

                    {skillsCovered.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {skillsCovered.slice(0, 4).map((sk, idx) => (
                          <span key={idx} style={{ background: '#edf2f7', color: '#2d3748', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                      {course.rating ? `★ ${course.rating}` : ''} {course.duration ? `· ${course.duration}` : ''}
                    </div>

                    <button
                      onClick={() => handleOpenCourseDetail(course)}
                      className="btn-soft"
                      style={{ fontSize: 13, padding: '7px 16px' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 27, 63, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 1000
          }}
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 640,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              background: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span className="badge" style={{ fontSize: 12, background: 'var(--mist)', color: 'var(--navy)', marginBottom: 6, display: 'inline-block' }}>
                  {selectedCourse.provider || 'CareVia Course'}
                </span>
                <h3 style={{ color: 'var(--navy)', margin: 0, fontSize: 20 }}>
                  {selectedCourse.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
                className="btn-soft"
                style={{ padding: '6px 12px', fontSize: 13 }}
              >
                ✕ Close
              </button>
            </div>

            {/* Metadata Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--ink2)', marginBottom: 18 }}>
              {selectedCourse.difficulty && <span><strong>Difficulty:</strong> {selectedCourse.difficulty}</span>}
              {selectedCourse.duration && <span>• <strong>Duration:</strong> {selectedCourse.duration}</span>}
              {selectedCourse.rating && <span>• <strong>Rating:</strong> ★ {selectedCourse.rating} ({courseReviews.length} reviews)</span>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: 'var(--navy)', fontSize: 14, margin: '0 0 6px 0' }}>
                Course Description
              </h4>
              <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                {selectedCourse.description || 'No detailed description available for this course.'}
              </p>
            </div>

            {/* Skills / Topics */}
            {Array.isArray(selectedCourse.skills) && selectedCourse.skills.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: 'var(--navy)', fontSize: 14, margin: '0 0 8px 0' }}>
                  Skills Covered
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedCourse.skills.map((sk, idx) => (
                    <span key={idx} className="badge" style={{ background: 'var(--mist)', color: 'var(--navy)' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enrollment Section */}
            <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '16px 0', margin: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--ink2)' }}>Enrollment Status</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>
                  {getEnrollmentState(selectedCourse.id)
                    ? getEnrollmentState(selectedCourse.id).status || 'Enrolled'
                    : 'Not Enrolled'}
                </div>
              </div>

              {!getEnrollmentState(selectedCourse.id) ? (
                <button
                  onClick={() => handleEnroll(selectedCourse.id)}
                  disabled={enrolling}
                  className="btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </button>
              ) : (
                <span className="badge" style={{ background: 'var(--navy)', color: '#ffffff', padding: '8px 16px', fontSize: 13 }}>
                  ✓ Enrolled
                </span>
              )}
            </div>

            {/* Course Reviews */}
            <div>
              <h4 style={{ color: 'var(--navy)', fontSize: 15, margin: '0 0 12px 0' }}>
                Course Reviews ({courseReviews.length})
              </h4>

              {loadingReviews ? (
                <p style={{ fontSize: 13, color: 'var(--ink2)' }}>Loading reviews...</p>
              ) : courseReviews.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
                  No reviews yet for this course.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {courseReviews.map((rev, idx) => (
                    <div
                      key={rev.id || idx}
                      style={{
                        padding: 12,
                        borderRadius: 'var(--r-subtle)',
                        background: 'var(--mist)',
                        fontSize: 13
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                          {rev.reviewer_name || 'Anonymous Learner'}
                        </span>
                        {rev.rating && <span style={{ color: 'var(--royal)', fontWeight: 600 }}>★ {rev.rating}</span>}
                      </div>
                      <p style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.4 }}>
                        {rev.review_text || rev.comment || 'Great course experience.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
