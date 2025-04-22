// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaShoppingCart, FaBell, FaUserCircle } from 'react-icons/fa'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/IvanZolo.jpg'
import '../styles/Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const isAuthenticated = Boolean(user)
  // Предполагаем, что в user есть поле roles: string[]
  const isAdmin = user?.roles?.includes('Admin')

  const [menuOpen, setMenuOpen]   = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const navigate                  = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/cart/count')
        .then(res => setCartCount(res.data.count))
        .catch(console.error)
    }
  }, [isAuthenticated])

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
        {/* Бургер */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <FaBars size={20} />
        </button>

        {/* Логотип */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} height="30" alt="Logo" loading="lazy" />
          <span className="ms-2">Marketplace</span>
        </Link>

        {/* Меню */}
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

        {/* Иконки справа */}
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
              className="btn btn-link text-reset dropdown-toggle p-0"
              type="button"
              id="notifDropdown"
              data-bs-toggle="dropdown"
            >
              <FaBell size={20} />
              <span className="badge bg-danger rounded-pill">1</span>
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="notifDropdown"
            >
              <li><a className="dropdown-item" href="#!">Some news</a></li>
              <li><a className="dropdown-item" href="#!">Another news</a></li>
            </ul>
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
