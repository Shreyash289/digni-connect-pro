import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import RoleSelect from './pages/RoleSelect'
import AuthGuard from './components/AuthGuard'
import SurvivorDashboard from './pages/survivor/SurvivorDashboard'
import CreateProfile from './pages/survivor/CreateProfile'
import DocumentsVault from './pages/survivor/DocumentsVault'
import MyApplications from './pages/survivor/MyApplications'
import AIMentor from './pages/survivor/AIMentor'
import JobBoard from './pages/survivor/JobBoard'
import SurvivorResume from './pages/survivor/SurvivorResume'
import SurvivorSkills from './pages/survivor/SurvivorSkills'
import SurvivorCourses from './pages/survivor/SurvivorCourses'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import SavedCandidates from './pages/recruiter/SavedCandidates'
import MyInterviews from './pages/recruiter/MyInterviews'
import SearchSurvivors from './pages/recruiter/SearchSurvivors'
import JobPostings from './pages/recruiter/JobPostings'
import Applicants from './pages/recruiter/Applicants'
import NGODashboard from './pages/ngo/NGODashboard'
import ManageSurvivors from './pages/ngo/ManageSurvivors'
import ProgressTracking from './pages/ngo/ProgressTracking'
import DocumentVerification from './pages/ngo/DocumentVerification'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import AuditLogs from './pages/admin/AuditLogs'
import Analytics from './pages/admin/Analytics'
import LaunchScreen from './components/ui/LaunchScreen'

const SURVIVOR = ['survivor']
const RECRUITER = ['recruiter']
const NGO = ['ngo_partner']
const ADMIN = ['admin', 'super_admin']

// Every portal page needs a real Supabase session AND the matching role in
// user_roles — typing a URL alone gets you nowhere.
const guard = (allow, page) => <AuthGuard allow={allow}>{page}</AuthGuard>

export default function App() {
  return (
    <BrowserRouter>
      <LaunchScreen />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* Codes are entered on the Login / Signup pages themselves */}
        <Route path="/verify" element={<Navigate to="/login" replace />} />
        <Route path="/select-role" element={<RoleSelect />} />

        {/* SURVIVOR ROUTES */}
        <Route path="/survivor" element={guard(SURVIVOR, <SurvivorDashboard />)} />
        <Route path="/survivor/profile" element={guard(SURVIVOR, <CreateProfile />)} />
        <Route path="/survivor/applications" element={guard(SURVIVOR, <MyApplications />)} />
        <Route path="/survivor/docs" element={guard(SURVIVOR, <DocumentsVault />)} />
        <Route path="/survivor/ai" element={guard(SURVIVOR, <AIMentor />)} />
        <Route path="/survivor/jobs" element={guard(SURVIVOR, <JobBoard />)} />
        <Route path="/survivor/resume" element={guard(SURVIVOR, <SurvivorResume />)} />
        <Route path="/survivor/skills" element={guard(SURVIVOR, <SurvivorSkills />)} />
        <Route path="/survivor/courses" element={guard(SURVIVOR, <SurvivorCourses />)} />

        {/* RECRUITER ROUTES */}
        <Route path="/recruiter" element={guard(RECRUITER, <RecruiterDashboard />)} />
        <Route path="/recruiter/jobs" element={guard(RECRUITER, <JobPostings />)} />
        <Route path="/recruiter/applicants" element={guard(RECRUITER, <Applicants />)} />
        <Route path="/recruiter/search" element={guard(RECRUITER, <SearchSurvivors />)} />
        <Route path="/recruiter/shortlisted" element={guard(RECRUITER, <SavedCandidates />)} />
        <Route path="/recruiter/interviews" element={guard(RECRUITER, <MyInterviews />)} />

        {/* NGO ROUTES */}
        <Route path="/ngo" element={guard(NGO, <NGODashboard />)} />
        <Route path="/ngo/survivors" element={guard(NGO, <ManageSurvivors />)} />
        <Route path="/ngo/progress" element={guard(NGO, <ProgressTracking />)} />
        <Route path="/ngo/documents" element={guard(NGO, <DocumentVerification />)} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={guard(ADMIN, <AdminDashboard />)} />
        <Route path="/admin/users" element={guard(ADMIN, <UserManagement />)} />
        <Route path="/admin/logs" element={guard(ADMIN, <AuditLogs />)} />
        <Route path="/admin/analytics" element={guard(ADMIN, <Analytics />)} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
