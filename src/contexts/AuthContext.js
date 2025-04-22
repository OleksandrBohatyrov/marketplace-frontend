// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'

const AuthCtx = createContext({
  user: null,
  login: async () => {},
  logout: async () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // При старте подтягиваем, залогинен ли уже
  useEffect(() => {
    api.get('/api/users/me', { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
  }, [])

  const login = async (email, password) => {
    // шлём ровно те поля, что ждёт .NET
    await api.post(
      '/api/auth/login',
      { Email: email, Password: password },
      { withCredentials: true }
    )

    // подтягиваем профиль
    const me = await api.get('/api/users/me', { withCredentials: true })
    setUser(me.data)
  }

  const logout = async () => {
    await api.post('/api/auth/logout', {}, { withCredentials: true })
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
