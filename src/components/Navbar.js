import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    }
    // После логаута — редирект на логин
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/create-product">Create Product</Link>
      {loading ? (
        <span style={{ marginLeft: 'auto' }}>Loading…</span>
      ) : user ? (
        <div style={{ marginLeft: 'auto' }}>
          <span>Hello, {user.fullName || user.userName}!</span>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      ) : (
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/login">Login</Link>
          <Link to="/register" style={{ marginLeft: '10px' }}>Register</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
