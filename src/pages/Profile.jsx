import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('info');
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setFormData({ username: user.fullName || '', email: user.email });
    fetchOrders();
    fetchCart();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders/my');
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart');
      setCartItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/api/users/me', formData);
      alert('Andmed on uuendatud');
    } catch (e) {
      console.error(e);
      alert('Salvestamisel ilmnes viga');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Oled kindel, et soovid oma konto kustutada? Kõik sinu tooted kustutatakse enne konto eemaldamist.'
      )
    ) {
      return;
    }
    setLoading(true);

    try {
      const productsRes = await api.get('/api/products/my-products');
      for (const p of productsRes.data) {
        await api.delete(`/api/products/${p.id}`);
      }
      await api.delete('/api/users/me');
      window.location.reload()
      await logout();
      navigate('/home', { replace: true });
    } catch (e) {
      console.error('Kustutamisviga:', e.response?.data || e.message || e);
      alert('Vabandust, konto kustutamisel oli viga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <h2>Minu profiil</h2>

      <ul className="nav nav-tabs mb-3">
        {['info', 'orders', 'cart'].map((t) => (
          <li className="nav-item" key={t}>
            <button
              className={`nav-link ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'info'
                ? 'Andmed'
                : t === 'orders'
                ? 'Tellimuste ajalugu'
                : 'Minu ostukorv'}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'info' && (
        <div className="card p-4">
          <div className="mb-3">
            <label className="form-label">Nimi</label>
            <input
              type="text"
              className="form-control"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">E-post</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <button
            className="btn btn-primary me-2"
            onClick={handleSave}
            disabled={loading}
          >
            Salvesta
          </button>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={handleLogout}
            disabled={loading}
          >
            Logi välja
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            Kustuta konto
          </button>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="alert alert-info">Tellimusi ei ole</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="card mb-3">
                <div className="card-body">
                  <h5>Tellimus #{o.id}</h5>
                  <p>Kuupäev: {new Date(o.orderDate).toLocaleString()}</p>
                  <p>Toode: {o.product.name}</p>
                  <p>Summa: {o.product.price} €</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'cart' && navigate('/cart', { replace: true })}
    </div>
  );
}
