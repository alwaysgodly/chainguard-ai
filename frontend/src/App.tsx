import { Routes, Route, Navigate } from 'react-router-dom'
import Layout         from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Login          from '@/pages/Auth/Login'
import Register       from '@/pages/Auth/Register'
import Dashboard      from '@/pages/Dashboard/Dashboard'
import Education      from '@/pages/Education/Education'
import Analytics      from '@/pages/Analytics/Analytics'
import NFTScanner     from '@/pages/NFTScanner/NFTScanner'
import ChatBot        from '@/pages/ChatBot/ChatBot'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="education"   element={<Education />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="nft-scanner" element={<NFTScanner />} />
          <Route path="chat"        element={<ChatBot />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}