import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import OTPVerify from './pages/OTPVerify'
import RoleSelect from './pages/RoleSelect'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<OTPVerify />} />
        <Route path="/select-role" element={<RoleSelect />} />
        
        {/* SURVIVOR ROUTES */}
        <Route path="/survivor" element={<SurvivorDashboard />} />
        <Route path="/survivor/profile" element={<CreateProfile />} />
        <Route path="/survivor/applications" element={<MyApplications />} />
        <Route path="/survivor/docs" element={<DocumentsVault />} />
        <Route path="/survivor/ai" element={<AIMentor />} />
        <Route path="/survivor/jobs" element={<JobBoard />} />
        
        {/* RECRUITER ROUTES */}
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/recruiter/search" element={<SearchSurvivors />} />
        <Route path="/recruiter/shortlisted" element={<SavedCandidates />} />
        <Route path="/recruiter/interviews" element={<MyInterviews />} />
        
        {/* NGO ROUTES */}
        <Route path="/ngo" element={<NGODashboard />} />
        <Route path="/ngo/survivors" element={<ManageSurvivors />} />
        <Route path="/ngo/progress" element={<ProgressTracking />} />
        <Route path="/ngo/documents" element={<DocumentVerification />} />
        
        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/logs" element={<AuditLogs />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}