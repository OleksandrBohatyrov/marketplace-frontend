// src/pages/MyProducts.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function MyProducts() {
  const [products, setProducts] = useState([])
  const [trades, setTrades]     = useState([])
  const [loading, setLoading]   = useState(true)

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
      // удаляем принятое предложение
      setTrades(ts => ts.filter(t => t.id !== trade.id))
      // отмечаем в списке своих товаров, что товар-цель (target) теперь продан
      setProducts(ps =>
        ps.map(p =>
          p.id === trade.target.id
            ? { ...p, status: 'Sold' }
            : p
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
      {/* SECTION: Exchange Proposals */}
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
                {/* Теперь здесь proposer, а не requester */}
                <strong>{trade.proposer.userName}</strong> pakub selle vastu sinu toodet{' '}
                <Link to={`/products/${trade.offered.id}`}>
                  {trade.offered.name}
                </Link>
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

      {/* SECTION: My Products */}
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
                  src={p.imageUrl || 'https://via.placeholder.com/400x300'}
                  className="card-img-top"
                  alt={p.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="text-success mb-1">€{p.price}</p>
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
                  <Link
                    to={`/products/${p.id}`}
                    className="btn btn-outline-primary mt-auto"
                  >
                    Vaata detailid
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
