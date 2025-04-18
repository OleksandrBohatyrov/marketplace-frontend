import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RequireAdmin({ isAdmin, children }) {
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
