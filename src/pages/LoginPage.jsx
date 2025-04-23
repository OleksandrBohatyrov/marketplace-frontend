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
      setMessage('Please enter both email and password.')
      return
    }
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      console.error(err)
      const title = err.response?.data?.title
      setMessage(title || 'Login failed: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="container py-5 vh-100">
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-md-8 col-lg-6 col-xl-5 mb-4 mb-md-0">
          <img
            src={logoImg}
            className="img-fluid"
            alt="Company Logo"
          />
        </div>

        {/* login form */}
        <div className="col-md-7 col-lg-5 col-xl-4 offset-xl-1">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="mb-4 text-center">Sign in</h3>

              {message && (
                <div className="alert alert-danger">{message}</div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingEmail"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingEmail">Email address</label>
                </div>

                {/* Password */}
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPassword"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>

                {/* Remember + Forgot */}
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
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot" className="text-decoration-none">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                >
                  Sign in
                </button>

                {/* Divider */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="mx-2 text-muted fw-bold">OR</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Social */}
                <button
                  type="button"
                  className="btn btn-primary w-100 mb-2"
                  style={{ backgroundColor: '#cf3723' }}
                >
                <i class="fa-brands fa-google me-2"></i>
                  Continue with Google
                </button>
                {/* Bottom link */}
                <p className="text-center mt-3 mb-0 small">
                  Don't have an account?{' '}
                  <Link to="/register" className="link-primary">
                    Sign up
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
