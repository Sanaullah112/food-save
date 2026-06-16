import DriverMap from './pages/driver/DriverMap'
import AdminSettings from './pages/admin/AdminSettings'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Notifications from './pages/Notifications'

import DonorDashboard from './pages/donor/DonorDashboard'
import AddListing from './pages/donor/AddListing'
import DonorRequests from './pages/donor/DonorRequests'

import NgoDashboard from './pages/ngo/NgoDashboard'
import NgoRequests from './pages/ngo/NgoRequests'
import Feedback from './pages/ngo/Feedback'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRequests from './pages/admin/AdminRequests'
import AdminReports from './pages/admin/AdminReports'

import DriverDashboard from './pages/driver/DriverDashboard'
import AdminGuidelines from './pages/admin/AdminGuidelines'
import ActiveGuidelines from './components/ActiveGuidelines'
import RegisterDriver from './pages/ngo/RegisterDriver'
import AssignPickups from './pages/ngo/Assignpickups'

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
    <Route path="/driver/map/:id" element={<PrivateRoute roles={['driver']}><DriverMap /></PrivateRoute>} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/settings" element={<PrivateRoute roles={['admin']}><AdminSettings /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

      {/* Donor */}
      <Route path="/donor" element={<PrivateRoute roles={['donor']}><DonorDashboard /></PrivateRoute>} />
      <Route path="/donor/add" element={<PrivateRoute roles={['donor']}><AddListing /></PrivateRoute>} />
      <Route path="/donor/requests" element={<PrivateRoute roles={['donor']}><DonorRequests /></PrivateRoute>} />
      <Route path="/donor/gdl" element={<PrivateRoute roles={['donor']}><ActiveGuidelines /></PrivateRoute>} />
 
      {/* NGO */}
      <Route path="/ngo" element={<PrivateRoute roles={['ngo']}><NgoDashboard /></PrivateRoute>} />
      <Route path="/ngo/requests" element={<PrivateRoute roles={['ngo']}><NgoRequests /></PrivateRoute>} />
      <Route path="/ngo/feedback" element={<PrivateRoute roles={['ngo']}><Feedback /></PrivateRoute>} />
      <Route path="/ngo/register-driver" element={<PrivateRoute roles={['ngo']}><RegisterDriver /></PrivateRoute>} />
      <Route path="/ngo/assign-pickups" element={<PrivateRoute roles={['ngo']}><AssignPickups /></PrivateRoute>} />

      {/* Driver */}  
      <Route path="/driver" element={<PrivateRoute roles={['driver']}><DriverDashboard /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/requests" element={<PrivateRoute roles={['admin']}><AdminRequests /></PrivateRoute>} />
      <Route path="/admin/reports" element={<PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute>} />
      <Route path="/admin/guide" element={<PrivateRoute roles={['admin']}><AdminGuidelines /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}