import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/IvanZolo.jpg';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage]   = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setMessage('');
    if (!email || !password) {
      setMessage('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // server responded 200 → auth cookie set
      await res.json();

      // lift state up to App, then redirect
      onLogin();
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setMessage('Login failed: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Company Logo" className="login-logo" />
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="off"
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        {message && <div className="login-message">{message}</div>}
      </div>
    </div>
  );
}

export default Login;
