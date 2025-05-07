// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [bids, setBids] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [offeredId, setOfferedId] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 1) Загружаем детали товара
  useEffect(() => {
    setLoading(true)
    api.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // 2) Если это аукцион, подтягиваем ставки
  useEffect(() => {
    if (product?.isAuction) {
      api.get('/api/bids', { params: { productId: product.id } })
        .then(res => setBids(res.data))
        .catch(console.error)
    }
  }, [product])

  // 3) При открытии формы обмена — подгружаем наши товары
  useEffect(() => {
    if (showTradeForm && user) {
      api.get('/api/products/my-products')
        .then(res => setMyProducts(res.data))
        .catch(console.error)
    }
  }, [showTradeForm, user])

  // Разместить ставку
  const handlePlaceBid = async () => {
    setError('')
    if (!user) {
      setError('Logi sisse, et teha pakkumine.')
      return
    }
    if (user.id === product.sellerId) {
      setError('Ei saa teha pakkumist enda tootega.')
      return
    }
    const amt = parseFloat(bidAmount)
    const currentTop = bids.length
      ? Math.max(...bids.map(b => b.amount))
      : (product.minBid ?? 0)
    if (isNaN(amt) || amt <= currentTop) {
      setError(`Sisesta summa, mis on suurem kui €${currentTop.toFixed(2)}.`)
      return
    }
    try {
      await api.post('/api/bids', { productId: product.id, amount: amt })
      const res = await api.get('/api/bids', { params: { productId: product.id } })
      setBids(res.data)
      setBidAmount('')
    } catch (err) {
      console.error(err)
      const data = err.response?.data
      const msg =
        typeof data === 'string'
          ? data
          : data?.message ||
            (data?.errors && Object.values(data.errors).flat()[0]) ||
            'Pakkumine ebaõnnestus.'
      setError(msg)
    }
  }

  // Предложить обмен
  const handleProposeTrade = async () => {
    setError('')
    if (!user) {
      setError('Logi sisse, et proposeerida.')
      return
    }
    if (user.id === product.sellerId) {
      setError('Ei saa proposeerida enda tootega.')
      return
    }
    if (product.status !== 'Available') {
      setError('Seda toodet ei saa enam vahetada.')
      return
    }
    const offeredInt = parseInt(offeredId, 10)
    if (isNaN(offeredInt)) {
      setError('Vali kehtiv oma toode.')
      return
    }
    try {
      await api.post('/api/trades', {
        TargetProductId: product.id,
        OfferedProductId: offeredInt
      })
      alert('Vahetuspakkumine saadetud!')
      setShowTradeForm(false)
    } catch (err) {
      console.error(err)
      const data = err.response?.data
      const msg =
        typeof data === 'string'
          ? data
          : data?.message ||
            (data?.errors && Object.values(data.errors).flat()[0]) ||
            'Vahetuspakkumine ebaõnnestus.'
      setError(msg)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status" />
      </div>
    )
  }
  if (!product) {
    return <div className="alert alert-warning m-5">Toodet ei leitud.</div>
  }

  const now = new Date()
  const endsAt = product.endsAt ? new Date(product.endsAt) : null
  const auctionActive = product.isAuction && endsAt && now < endsAt

  return (
    <section className="container my-5">
      <div className="row g-4">
        {/* Image */}
        <div className="col-md-5">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600x400'}
            className="img-fluid"
            alt={product.name}
          />
        </div>

        {/* Details */}
        <div className="col-md-7">
          <h1>{product.name}</h1>

          {product.isAuction ? (
            <p className="text-danger">
              Auktsioon {endsAt && `(lõpeb ${endsAt.toLocaleString()})`}
            </p>
          ) : (
            <h3 className="text-success">€{product.price.toFixed(2)}</h3>
          )}

          <p>{product.description}</p>
          <p><strong>Kategooria:</strong> {product.category.name}</p>

          {/* Auction block */}
          {product.isAuction ? (
            <>
              <h5 className="mt-4">
                {auctionActive
                  ? bids.length
                      ? `Kõrgeim pakkumine: €${Math.max(...bids.map(b => b.amount)).toFixed(2)}`
                      : `Minimaalne pakkumine: €${product.minBid?.toFixed(2)}`
                  : 'Auktsioon on lõppenud'}
              </h5>

              {auctionActive ? (
                <div className="mt-3" style={{ maxWidth: 300 }}>
                  <div className="input-group mb-2">
                    <span className="input-group-text">€</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Sinu pakkumine"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-warning"
                    onClick={handlePlaceBid}
                    disabled={!user || user.id === product.sellerId}
                  >
                    Tee pakkumine
                  </button>
                  {error && <div className="text-danger mt-2">{error}</div>}
                </div>
              ) : (
                <div className="alert alert-secondary mt-3">
                  Auktsioon on lõppenud!
                </div>
              )}
            </>
          ) : (
            /* Sale + Trade block */
            <>
              <button
                className="btn btn-primary me-2"
                onClick={() => window.alert('Lisa ostukorvi')}
              >
                Lisa ostukorvi
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowTradeForm(s => !s)}
                disabled={
                  !user ||
                  user.id === product.sellerId ||
                  product.status !== 'Available'
                }
              >
                Propose Trade
              </button>

              {showTradeForm && (
                <div className="mt-3" style={{ maxWidth: 300 }}>
                  <select
                    className="form-select mb-2"
                    value={offeredId}
                    onChange={e => setOfferedId(e.target.value)}
                  >
                    <option value="">— vali oma toode —</option>
                    {myProducts.map(mp => (
                      <option key={mp.id} value={mp.id}>
                        {mp.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-success"
                    onClick={handleProposeTrade}
                  >
                    Saada pakkumine
                  </button>
                  {error && <div className="text-danger mt-2">{error}</div>}
                </div>
              )}
            </>
          )}

          <button
            className="btn btn-outline-secondary mt-3"
            onClick={() => navigate(-1)}
          >
            Tagasi
          </button>
        </div>
      </div>
    </section>
  )
}
