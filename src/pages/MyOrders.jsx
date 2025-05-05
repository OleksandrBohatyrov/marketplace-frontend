import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Stranitsa Minu tellimused
export default function MyOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('purchases')
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/api/orders/my-purchases', { withCredentials: true }),
        api.get('/api/orders/my-sales', { withCredentials: true })
      ])
      setPurchases(pRes.data)
      setSales(sRes.data)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Tellimuste laadimine ebaõnnestus.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    fetchOrders()
  }, [user])

  const handleAddAddress = async orderId => {
    const address = window.prompt('Sisesta tarneaadress:')
    if (!address) return
    try {
      await api.put(
        `/api/orders/${orderId}/address`,
        { shippingAddress: address },
        { withCredentials: true }
      )
      fetchOrders()
    } catch {
      alert('Aadressi lisamine ebaõnnestus.')
    }
  }

  const handleMarkShipped = async orderId => {
    try {
      await api.put(`/api/orders/${orderId}/ship`, {}, { withCredentials: true })
      fetchOrders()
    } catch {
      alert('Saatmise märkimine ebaõnnestus.')
    }
  }

  const handleConfirmReceived = async orderId => {
    try {
      await api.put(`/api/orders/${orderId}/deliver`, {}, { withCredentials: true })
      fetchOrders()
    } catch {
      alert('Saate kättesaamise kinnitamine ebaõnnestus.')
    }
  }

  if (loading) return <div className="text-center mt-5">Tellimuste laadimine...</div>
  if (error)   return <div className="alert alert-danger">{error}</div>

  const list = tab === 'purchases' ? purchases : sales

  return (
    <div className="container my-5">
      <h2 className="mb-4">Minu tellimused</h2>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'purchases' && 'active'}`}
            onClick={() => setTab('purchases')}
          >Ostud</button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'sales' && 'active'}`}
            onClick={() => setTab('sales')}
          >Müük</button>
        </li>
      </ul>
      {list.length === 0 ? (
        <div className="alert alert-info">Tellimusi ei leitud.</div>
      ) : (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Toode</th>
              <th>Aadress</th>
              <th>Staatus</th>
              <th>Tegevused</th>
            </tr>
          </thead>
          <tbody>
            {list.map(order => (
              <tr key={order.id}>
                <td><a href={`/products/${order.product.id}`}>{order.product.name}</a></td>
                <td>{order.shippingAddress || '-'}</td>
                <td>{order.status}</td>
                <td>
                  {tab === 'purchases' && order.status === 'PendingAddress' && (
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleAddAddress(order.id)}>
                      Lisa aadress
                    </button>
                  )}
                  {tab === 'purchases' && order.status === 'Shipped' && (
                    <button className="btn btn-sm btn-success" onClick={() => handleConfirmReceived(order.id)}>
                      Kinnita kättesaamine
                    </button>
                  )}
                  {tab === 'sales' && order.status === 'AwaitingShipment' && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleMarkShipped(order.id)}>
                      Märgi saadetuks
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
