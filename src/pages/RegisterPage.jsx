// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [message,  setMessage]  = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email || !password) {
      setMessage('Please fill out all fields.');
      return;
    }

    try {
      await api.post('/api/Auth/Register', {
        username: email,
        email,
        password
      });

      await login(email, password);

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data) {
        setMessage('Registration failed: ' + JSON.stringify(err.response.data));
      } else {
        setMessage('Registration failed: ' + err.message);
      }
    }
  };

  return (
    <section className="vh-100">
      <div className="container py-5 h-100">
        <div className="row d-flex align-items-center justify-content-center h-100">
          <div className="col-md-8 col-lg-7 col-xl-6">
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
              className="img-fluid"
              alt="Illustration"
            />
          </div>

          <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
            <h2 className="mb-4 text-center">Sign up</h2>
            {message && <div className="alert alert-danger">{message}</div>}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="form-outline mb-4">
                <input
                  type="email"
                  id="form1Example13"
                  className="form-control form-control-lg"
                  placeholder="Enter a valid email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <label className="form-label" htmlFor="form1Example13">
                  Email address
                </label>
              </div>

              {/* Password */}
              <div className="form-outline mb-4">
                <input
                  type="password"
                  id="form1Example23"
                  className="form-control form-control-lg"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <label className="form-label" htmlFor="form1Example23">
                  Password
                </label>
              </div>

              {/* Remember & Forgot */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="form1Example3"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="form1Example3">
                    Remember me
                  </label>
                </div>
                <a href="#!" className="text-muted">Forgot password?</a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block w-100 mb-3"
              >
                Sign up &amp; Sign in
              </button>

              {/* OR Divider */}
              <div className="divider d-flex align-items-center my-4">
                <p className="text-center fw-bold mx-3 mb-0 text-muted">OR</p>
              </div>

              {/* Social Buttons */}
              <button
                type="button"
                className="btn btn-primary btn-lg btn-block mb-2"
                style={{ backgroundColor: '#3b5998' }}
              >
                <i className="fab fa-facebook-f me-2"></i>
                Continue with Facebook
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg btn-block"
                style={{ backgroundColor: '#55acee' }}
              >
                <i className="fab fa-twitter me-2"></i>
                Continue with Twitter
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
