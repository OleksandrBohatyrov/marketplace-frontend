// src/components/RequireAdmin.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAdmin({ children }) {
  const { user } = useAuth()
  if (!user?.roles?.includes('Admin')) {
    return <Navigate to="/" replace />
  }
  return children
}
