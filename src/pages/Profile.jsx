// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()

  const [tab, setTab]             = useState('info')    
  const [formData, setFormData]   = useState({ username: '', email: '' })
  const [orders, setOrders]       = useState([])
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    setFormData({ username: user.fullName || '', email: user.email })
    fetchOrders()
    fetchCart()
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders/my')
      setOrders(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCartItems(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    try {
      await api.put('/api/users/me', formData)
      alert('Data updated')
    } catch (e) {
      console.error(e)
      alert('Error on saving')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="container my-4">
      <h2>My profile</h2>

      <ul className="nav nav-tabs mb-3">
        {['info','orders','cart'].map(t => (
          <li className="nav-item" key={t}>
            <button
              className={`nav-link ${tab===t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t==='info'   ? 'Data'
               :t==='orders' ? 'Order history'
                             : 'My cart'}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'info' && (
        <div className="card p-4">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <button className="btn btn-primary me-2" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          {orders.length === 0 
            ? <div className="alert alert-info">No orders</div>
            : orders.map(o => (
                <div key={o.id} className="card mb-3">
                  <div className="card-body">
                    <h5>Order #{o.id}</h5>
                    <p>Date: {new Date(o.orderDate).toLocaleString()}</p>
                    <p>Product: {o.product.name}</p>
                    <p>Amount: {o.product.price} €</p>
                  </div>
                </div>
              ))
          }
        </div>
      )}

      {tab === 'cart' && (
        <div>
          {cartItems.length === 0 
            ? <div className="alert alert-info">Your cart is empty</div>
            : (
              <ul className="list-group">
                {cartItems.map(item => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between">
                    {item.product.name}
                    <span>{item.quantity} × {item.product.price} ₽</span>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      )}
    </div>
  )
}
