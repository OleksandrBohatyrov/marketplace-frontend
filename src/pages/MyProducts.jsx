import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function MyProducts() {
  const [products, setProducts] = useState([])
  const [trades, setTrades]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/api/products/my-products'),
      api.get('/api/trades/incoming')
    ])
      .then(([pRes, tRes]) => {
        setProducts(pRes.data)
        setTrades(tRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleAccept = async trade => {
    try {
      await api.post(`/api/trades/${trade.id}/accept`)
      setTrades(ts => ts.filter(t => t.id !== trade.id))
      setProducts(ps =>
        ps.map(p =>
          p.id === trade.target.id ? { ...p, status: 'Sold' } : p
        )
      )
      alert('Vahetuspakkumine aktsepteeritud')
    } catch {
      alert('Viga aktsepteerimisel')
    }
  }

  const handleReject = async trade => {
    try {
      await api.post(`/api/trades/${trade.id}/reject`)
      setTrades(ts => ts.filter(t => t.id !== trade.id))
      alert('Vahetuspakkumine keelatud')
    } catch {
      alert('Viga kehtestamisel')
    }
  }

  const handleDelete = async productId => {
    if (!window.confirm('Oled kindel, et soovid selle toote kustutada?')) return
    try {
      await api.delete(`/api/products/${productId}`)
      setProducts(ps => ps.filter(p => p.id !== productId))
      alert('Toode edukalt kustutatud')
    } catch (err) {
      console.error('Kustutamine nurjus:', err.response?.data || err.message)
      alert('Toote kustutamine nurjus')
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Laadimine…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Vahetuspakkumised</h2>
      {trades.length === 0 ? (
        <div className="alert alert-info">
          Sul pole praegu ühtegi vahetuspakkumist.
        </div>
      ) : (
        trades.map(trade => (
          <div key={trade.id} className="card mb-3">
            <div className="card-body">
              <p className="mb-2">
                <strong>{trade.proposer.userName}</strong> pakub selle vastu sinu toodet{' '}
                <Link to={`/products/${trade.offered.id}`}>{trade.offered.name}</Link>
              </p>
              <button
                className="btn btn-sm btn-success me-2"
                onClick={() => handleAccept(trade)}
              >
                Nõustu
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleReject(trade)}
              >
                Keeldu
              </button>
            </div>
          </div>
        ))
      )}

      {/*  My Products */}
      <h2 className="mt-5 mb-4">Minu tooted</h2>
      {products.length === 0 ? (
        <div className="alert alert-info">
          Sul pole veel ühtegi toodet.
        </div>
      ) : (
        <div className="row">
          {products.map(p => (
            <div key={p.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <img
                  src={
                    p.imageUrls && p.imageUrls.length > 0
                      ? p.imageUrls[0]
                      : 'https://via.placeholder.com/400x300'
                  }
                  alt={p.name}
                  className="card-img-top"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="text-success mb-1">€{p.price.toFixed(2)}</p>
                  <p className="mb-1">
                    <strong>Kategooria:</strong> {p.category.name}
                  </p>
                  <p className="mb-1">
                    <strong>Lisatud:</strong>{' '}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mb-3">
                    <strong>Staatus:</strong>{' '}
                    <span
                      className={`badge rounded-pill ${
                        p.status === 'Sold' ? 'bg-danger' : 'bg-success'
                      }`}
                    >
                      {p.status === 'Sold' ? 'Müüdud' : 'Saadaval'}
                    </span>
                  </p>
                  <div className="mt-auto d-flex justify-content-between">
                    <Link
                      to={`/products/${p.id}`}
                      className="btn btn-outline-primary"
                    >
                      Vaata detailid
                    </Link>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Kustuta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
