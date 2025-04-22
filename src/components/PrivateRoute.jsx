// src/components/PrivateRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth()

  // if not logged in  — redirect to login page
  if (!user) return <Navigate to="/login" replace />

  if (adminOnly && !user.roles?.includes('Admin')) {
    return <Navigate to="/" replace />
  }

  return children
}
