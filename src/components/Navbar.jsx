// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation} from 'react-router-dom'
import { FaBars, FaShoppingCart, FaBell, FaUserCircle } from 'react-icons/fa'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/IvanZolo.jpg'
import '../styles/Navbar.css'


import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth()
  const isAuthenticated = Boolean(user)
  const isAdmin = user?.roles?.includes('Admin')

  const [menuOpen, setMenuOpen]   = useState(false)
  const { cartCount } = useCart();
  const navigate                  = useNavigate()



  const toggleMenu = () => setMenuOpen(o => !o)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleAvatarClick = () => {
    setMenuOpen(false)
    navigate(isAuthenticated ? '/profile' : '/login')
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        {/* Vurger menu */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <FaBars size={20} />
        </button>

        {/* logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} height="30" alt="Logo" loading="lazy" />
          <span className="ms-2">Marketplace</span>
        </Link>

        {/* menu */}
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/" 
                onClick={() => setMenuOpen(false)}
              >Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sell" onClick={()=>setMenuOpen(false)}>Sell</Link>
            </li>
            {isAuthenticated && isAdmin && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/admin/categories"
                    onClick={() => setMenuOpen(false)}
                  >
                    Manage Categories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/admin/products"
                    onClick={() => setMenuOpen(false)}
                  >
                    Manage Products
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Right icons */}
        <div className="d-flex align-items-center">
          {isAuthenticated && (
            <Link
              className="text-reset me-3 position-relative"
              to="/cart"
              onClick={() => setMenuOpen(false)}
            >
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <div className="dropdown me-3">
            <button
              className="btn btn-link text-reset p-0"
              type="button"
              id="notif"
            >
              <FaBell size={20} />
              <span className="badge bg-danger rounded-pill"></span>
            </button>
          </div>

          <button
            className="btn btn-link text-reset p-0"
            onClick={handleAvatarClick}
          >
            <FaUserCircle size={28} />
          </button>

          {isAuthenticated && (
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
