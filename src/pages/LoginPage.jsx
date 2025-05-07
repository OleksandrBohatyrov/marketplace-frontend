// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/Login.css'
import logoImg from '../assets/hoodielogo.png'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage]   = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage('')
    if (!email || !password) {
      setMessage('Palun sisestage nii e-post kui parool.')
      return
    }
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      console.error(err)
      const title = err.response?.data?.title
      setMessage(title || 'Sisselogimine ebaõnnestus: ' + (err.message || 'Tundmatu viga'))
    }
  }

  return (
    <div className="container py-5 vh-100">
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-md-8 col-lg-6 col-xl-5 mb-4 mb-md-0">
          <img
            src={logoImg}
            className="img-fluid"
            alt="Ettevõtte logo"
          />
        </div>

        {/* Sisselogimisvorm */}
        <div className="col-md-7 col-lg-5 col-xl-4 offset-xl-1">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="mb-4 text-center">Logi sisse</h3>

              {message && (
                <div className="alert alert-danger">{message}</div>
              )}

              <form onSubmit={handleSubmit}>
                {/* E-post */}
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingEmail"
                    placeholder="nimi@näide.ee"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingEmail">E-posti aadress</label>
                </div>

                {/* Parool */}
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPassword"
                    placeholder="Parool"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingPassword">Parool</label>
                </div>

                {/* Mäleta + Unustatud */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="rememberMe"
                    >
                      Pea mind meeles
                    </label>
                  </div>
                  <Link to="/forgot" className="text-decoration-none">
                    Unustasid parooli?
                  </Link>
                </div>

                {/* Saatmise nupp */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                >
                  Logi sisse
                </button>

                {/* Eristaja */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="mx-2 text-muted fw-bold">VÕI</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* All link */}
                <p className="text-center mt-3 mb-0 small">
                  Pole veel kontot?{' '}
                  <Link to="/register" className="link-primary">
                    Registreeru
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
