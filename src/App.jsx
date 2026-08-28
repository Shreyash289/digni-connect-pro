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
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import SavedCandidates from './pages/recruiter/SavedCandidates'
import MyInterviews from './pages/recruiter/MyInterviews'
import SearchSurvivors from './pages/recruiter/SearchSurvivors'
import NGODashboard from './pages/ngo/NGODashboard'
import ManageSurvivors from './pages/ngo/ManageSurvivors'
import ProgressTracking from './pages/ngo/ProgressTracking'
import DocumentVerification from './pages/ngo/DocumentVerification'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import AuditLogs from './pages/admin/AuditLogs'
import Analytics from './pages/admin/Analytics'

const SURVIVOR = ['survivor']
const RECRUITER = ['recruiter']
const NGO = ['ngo_partner']
const ADMIN = ['admin', 'super_admin']

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/select-role" element={<RoleSelect />} />

        {/* SURVIVOR ROUTES */}
        <Route path="/survivor" element={<AuthGuard allow={SURVIVOR}><SurvivorDashboard /></AuthGuard>} />
        <Route path="/survivor/profile" element={<AuthGuard allow={SURVIVOR}><CreateProfile /></AuthGuard>} />
        <Route path="/survivor/applications" element={<AuthGuard allow={SURVIVOR}><MyApplications /></AuthGuard>} />
        <Route path="/survivor/docs" element={<AuthGuard allow={SURVIVOR}><DocumentsVault /></AuthGuard>} />
        <Route path="/survivor/ai" element={<AuthGuard allow={SURVIVOR}><AIMentor /></AuthGuard>} />
        <Route path="/survivor/jobs" element={<AuthGuard allow={SURVIVOR}><JobBoard /></AuthGuard>} />

        {/* RECRUITER ROUTES */}
        <Route path="/recruiter" element={<AuthGuard allow={RECRUITER}><RecruiterDashboard /></AuthGuard>} />
        <Route path="/recruiter/search" element={<AuthGuard allow={RECRUITER}><SearchSurvivors /></AuthGuard>} />
        <Route path="/recruiter/shortlisted" element={<AuthGuard allow={RECRUITER}><SavedCandidates /></AuthGuard>} />
        <Route path="/recruiter/interviews" element={<AuthGuard allow={RECRUITER}><MyInterviews /></AuthGuard>} />

        {/* NGO ROUTES */}
        <Route path="/ngo" element={<AuthGuard allow={NGO}><NGODashboard /></AuthGuard>} />
        <Route path="/ngo/survivors" element={<AuthGuard allow={NGO}><ManageSurvivors /></AuthGuard>} />
        <Route path="/ngo/progress" element={<AuthGuard allow={NGO}><ProgressTracking /></AuthGuard>} />
        <Route path="/ngo/documents" element={<AuthGuard allow={NGO}><DocumentVerification /></AuthGuard>} />

        {/* ADMIN ROUTES — only reachable with a real 'admin'/'super_admin' row in user_roles */}
        <Route path="/admin" element={<AuthGuard allow={ADMIN}><AdminDashboard /></AuthGuard>} />
        <Route path="/admin/users" element={<AuthGuard allow={ADMIN}><UserManagement /></AuthGuard>} />
        <Route path="/admin/logs" element={<AuthGuard allow={ADMIN}><AuditLogs /></AuthGuard>} />
        <Route path="/admin/analytics" element={<AuthGuard allow={ADMIN}><Analytics /></AuthGuard>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}