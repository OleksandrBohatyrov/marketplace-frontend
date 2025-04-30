import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaShoppingCart, FaBell, FaUserCircle } from 'react-icons/fa'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/hoodielogo.png'
import '../styles/Navbar.css'

import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth()
  const isAuthenticated = Boolean(user)
  const isAdmin = user?.roles?.includes('Admin')

  const [menuOpen, setMenuOpen]   = useState(false)
  const { cartCount } = useCart()
  const navigate = useNavigate()

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
        {/* Burger-menüü */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-label="Lülita menüü"
        >
          <FaBars size={20} />
        </button>

        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} height="30" alt="Logo" loading="lazy" />
          <span className="ms-2">Turg</span>
        </Link>

        {/* Menüü */}
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/" 
                onClick={() => setMenuOpen(false)}
              >Avaleht</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sell" onClick={()=>setMenuOpen(false)}>Müü</Link>
            </li>
            {isAuthenticated && isAdmin && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/admin/categories"
                    onClick={() => setMenuOpen(false)}
                  >
                    Halda kategooriaid
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/admin/products"
                    onClick={() => setMenuOpen(false)}
                  >
                    Halda tooteid
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Parempoolne ikoonide plokk */}
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

          {/* Avatar ja kasutajanimi */}
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-reset p-0"
              onClick={handleAvatarClick}
            >
              <FaUserCircle size={28} />
            </button>
            {isAuthenticated && (
              <span className="ms-2 me-3">
                {user.username}
              </span>
            )}
          </div>

          {isAuthenticated && (
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={handleLogout}
            >
              Logi välja
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
