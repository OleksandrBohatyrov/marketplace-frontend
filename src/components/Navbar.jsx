// src/components/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaBars,
  FaShoppingCart,
  FaBell,
  FaUserCircle
} from 'react-icons/fa'
import logo from '../assets/IvanZolo.jpg'
import '../styles/Navbar.css'

export default function Navbar({
  isAuthenticated,
  isAdmin,
  setIsAuthenticated,
  refreshUser
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setMenuOpen(open => !open)
  }

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/Auth/Logout`, {
        method: 'POST',
        credentials: 'include'
      })
      setIsAuthenticated(false)
      refreshUser()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        {/* Бургер-иконка */}
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          <FaBars size={20} />
        </button>

        {/* Логотип */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} height="30" alt="Logo" loading="lazy" />
          <span className="ms-2">Marketplace</span>
        </Link>

        {/* Главное меню */}
        <div
          className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
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
          {/* Корзина */}
          <Link
            className="text-reset me-3 position-relative"
            to="/cart"
            onClick={() => setMenuOpen(false)}
          >
            <FaShoppingCart size={20} />
            {/* Для бейджа корзины */}
            {/* <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">3</span> */}
          </Link>

          {/* Уведомления */}
          <div className="dropdown me-3">
            <a
              className="text-reset dropdown-toggle hidden-arrow"
              href="#!"
              role="button"
              data-bs-toggle="dropdown"
            >
              <FaBell size={20} />
              <span className="badge bg-danger rounded-pill">1</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#!">Some news</a></li>
              <li><a className="dropdown-item" href="#!">Another news</a></li>
            </ul>
          </div>

          {/* Аватар / профиль */}
          <div className="dropdown">
            <a
              className="text-reset dropdown-toggle hidden-arrow d-flex align-items-center"
              href="#!"
              role="button"
              data-bs-toggle="dropdown"
            >
              <FaUserCircle size={28} />
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        handleLogout()
                        setMenuOpen(false)
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link className="dropdown-item" to="/login">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/register">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
