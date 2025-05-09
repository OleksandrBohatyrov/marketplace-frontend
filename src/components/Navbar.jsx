import React, { useState } from 'react'
import { FaBars, FaShoppingCart, FaUserCircle } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/hoodielogo.png'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const isAuthenticated = Boolean(user)
  const isAdmin = user?.roles?.includes('Admin')
  const { cartCount } = useCart()

  const [menuOpen, setMenuOpen] = useState(false)
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
        <button className="navbar-toggler" type="button" onClick={toggleMenu}>
          <FaBars size={20} />
        </button>

        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} height="30" alt="Logo" loading="lazy" />
          <span className="ms-2">Riidesstock</span>
        </Link>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>
                Avaleht
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sell" onClick={() => setMenuOpen(false)}>
                Müü
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/my-products"
                  onClick={() => setMenuOpen(false)}
                >
                  Minu tooted
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/chats" onClick={() => setMenuOpen(false)}>
                Vestlused
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

        <div className="d-flex align-items-center position-relative">
          {isAuthenticated && (
            <Link
              className="text-reset me-3 position-relative"
              to="/cart"
              onClick={() => setMenuOpen(false)}
            >
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.6rem' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <button className="btn btn-link text-reset p-0" onClick={handleAvatarClick}>
            <FaUserCircle size={28} />
          </button>
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
