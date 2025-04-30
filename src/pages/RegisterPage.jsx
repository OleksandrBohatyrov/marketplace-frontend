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
      setError('Palun täitke kõik väljad.')
      return
    }

    try {
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
        <h3 className="mb-4 text-center">Loo konto</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              id="fldUsername"
              type="text"
              className="form-control"
              placeholder="Kasutajanimi"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <label htmlFor="fldUsername">Kasutajanimi</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="fldEmail"
              type="email"
              className="form-control"
              placeholder="E-posti aadress"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label htmlFor="fldEmail">E-posti aadress</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="fldPassword"
              type="password"
              className="form-control"
              placeholder="Parool"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <label htmlFor="fldPassword">Parool</label>
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            REGISTREERU
          </button>
          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted">VÕI</span>
            <hr className="flex-grow-1" />
          </div>
          <button
            type="button"
            className="btn btn-primary w-100 mb-2"
            style={{ backgroundColor: '#cf3723' }}
          >
            <i className="fa-brands fa-google me-2"></i>
            Jätka Google'iga
          </button>
        </form>
        <div className="text-center mt-3">
          Sul on juba konto? <a href="/login">Logi sisse</a>
        </div>
      </div>
    </div>
  )
}
