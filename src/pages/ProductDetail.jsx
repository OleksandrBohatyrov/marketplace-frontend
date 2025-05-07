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
  const [bids, setBids]       = useState([])
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // Load product
  useEffect(() => {
    setLoading(true)
    api.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  // If it's an auction, load bids
  useEffect(() => {
    if (product?.isAuction) {
      api.get(`/api/bids`, { params: { productId: product.id } })
         .then(res => setBids(res.data))
         .catch(err => console.error(err))
    }
  }, [product])

  const handlePlaceBid = async () => {
    setError('')
    if (!user) {
      setError('Palun logi sisse, et teha pakkumine.')
      return
    }
    if (user.id === product.sellerId) {
      setError('Sa ei saa teha pakkumist oma kaubale.')
      return
    }
    const amt = parseFloat(bidAmount)
    if (isNaN(amt)) {
      setError('Sisesta kehtiv summa.')
      return
    }
    // Determine current top
    const currentTop = bids.length > 0
      ? Math.max(...bids.map(b => b.amount))
      : (product.minBid ?? 0)
    if (amt <= currentTop) {
      setError(`Paku rohkem kui €${currentTop.toFixed(2)}.`)
      return
    }
    try {
      await api.post('/api/bids', {
        productId: product.id,
        amount: amt
      })
      // refresh bids
      const res = await api.get('/api/bids', { params: { productId: product.id } })
      setBids(res.data)
      setBidAmount('')
    } catch (err) {
      console.error(err)
      setError(err.response?.data || 'Pakkumise saatmine ebaõnnestus.')
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
    return (
      <div className="alert alert-warning m-5">Toodet ei leitud.</div>
    )
  }

  const now = new Date()
  const endsAt = product.endsAt ? new Date(product.endsAt) : null
  const auctionActive = product.isAuction && endsAt && now < endsAt

  return (
    <section className="container my-5">
      <div className="row g-4">
        <div className="col-md-5">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600x400'}
            className="img-fluid"
            alt={product.name}
          />
        </div>
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

          {/* Auction section */}
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
                  Auktsioon lõppes; palju õnne kõrgeima pakkumise tegijale!
                </div>
              )}
            </>
          ) : (
            // Regular sale: show buy/add-to-cart button
            <button
              className="btn btn-primary"
              onClick={() => window.alert('Lisa ostukorvi funktsioon')}
            >
              Lisa ostukorvi
            </button>
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
