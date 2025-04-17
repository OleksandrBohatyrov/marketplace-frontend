import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/IvanZolo.jpg';
import '../styles/Navbar.css';

export default function Navbar({
  isAuthenticated,
  isAdmin,
  setIsAuthenticated,
  refreshUser
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMobileMenuOpen(o => !o);

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/Auth/Logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setIsAuthenticated(false);
    refreshUser();
    navigate('/login');
  };

  useEffect(() => {
    const handler = e => {
      if (mobileMenuOpen && navRef.current && !navRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileMenuOpen]);

  const handleLinkClick = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={handleLinkClick}>
          <img src={logo} alt="Logo" className="navbar-logo-img" />
          <span style={{ color: '#fff', marginLeft: 8 }}>Marketplace</span>
        </Link>

        <button className="burger-icon" onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </button>

        <ul className={`navbar-menu${mobileMenuOpen ? ' active' : ''}`}>
          <li>
            <Link to="/" onClick={handleLinkClick}>Home</Link>
          </li>

          {isAuthenticated && isAdmin && (
            <>
              <li>
                <Link to="/admin/categories" onClick={handleLinkClick}>
                  Manage Categories
                </Link>
              </li>
              <li>
                <Link to="/admin/products" onClick={handleLinkClick}>
                  Manage Products
                </Link>
              </li>
            </>
          )}

          {isAuthenticated ? (
            <>
              <li>
                <Link to="/cart" onClick={handleLinkClick}>Cart</Link>
              </li>
              <li>
                <button onClick={() => { handleLogout(); handleLinkClick(); }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" onClick={handleLinkClick}>Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
