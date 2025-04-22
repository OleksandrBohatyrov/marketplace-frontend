// src/pages/RegisterPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password) {
      setError('Please fill out all fields.')
      return
    }

    try {
      // register
      await api.post('/api/auth/register', {
        Username: username,
        Email:    email,
        Password: password
      }, { withCredentials: true })

      await login(email, password)

      navigate('/', { replace: true })
      window.location.reload()

    } catch (err) {
      console.error(err)
      const errs = err.response?.data?.errors
      if (errs) {
        const fld = Object.keys(errs)[0]
        setError(`${fld}: ${errs[fld].join(', ')}`)
      } else {
        setError(err.response?.data || err.message)
      }
    }
  }

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="card p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h3 className="mb-4 text-center">Sign up</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              id="fldUsername"
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <label htmlFor="fldUsername">Username</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="fldEmail"
              type="email"
              className="form-control"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label htmlFor="fldEmail">Email address</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="fldPassword"
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <label htmlFor="fldPassword">Password</label>
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            SIGN UP
          </button>
          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted">OR</span>
            <hr className="flex-grow-1" />
          </div>
          <button
                  type="button"
                  className="btn btn-primary w-100 mb-2"
                  style={{ backgroundColor: '#cf3723' }}
                >
                <i class="fa-brands fa-google me-2"></i>
                  Continue with Google
                </button>
        </form>
        <div className="text-center mt-3">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  )
}
