// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Если на backend реализован эндпоинт logout, вызываем его:
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    }
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px', background: '#f2f2f2' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
      <Link to="/create-product" style={{ marginRight: '10px' }}>Create Product</Link>
      <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
      <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
