// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaShoppingCart, FaBell, FaUserCircle } from 'react-icons/fa'
import api from '../services/api'
import logo from '../assets/IvanZolo.jpg'
import '../styles/Navbar.css'

export default function Navbar({
  isAuthenticated,
  isAdmin,
  setIsAuthenticated,
  refreshUser
}) {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const navigate                  = useNavigate()

  // Подгружаем количество товаров в корзине
  useEffect(() => {
    api.get('/api/cart/count')
      .then(res => setCartCount(res.data.count))
      .catch(console.error)
  }, [])

  const toggleMenu = () => setMenuOpen(open => !open)

  const handleLogout = async () => {
    try {
      await api.post('/api/Auth/logout')
      setIsAuthenticated(false)
      refreshUser()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleAvatarClick = () => {
    setMenuOpen(false)
    if (isAuthenticated) navigate('/profile')
    else navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        {/* Бургер */}
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

        {/* Меню */}
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
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
            {cartCount > 0 && (
              <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Уведомления */}
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
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notifDropdown">
              <li><a className="dropdown-item" href="#!">Some news</a></li>
              <li><a className="dropdown-item" href="#!">Another news</a></li>
            </ul>
          </div>

          {/* Аватарка (профиль или логин) */}
          <button
            className="btn btn-link text-reset p-0"
            type="button"
            onClick={handleAvatarClick}
          >
            <FaUserCircle size={28} />
          </button>
        </div>
      </div>
    </nav>
  )
}
