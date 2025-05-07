// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert
} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct]           = useState(null)
  const [bids, setBids]                 = useState([])
  const [myProducts, setMyProducts]     = useState([])
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [offeredId, setOfferedId]       = useState('')
  const [images, setImages]             = useState([])
  const [currentImgIdx, setCurrent]     = useState(0)
  const [prevId, setPrevId]             = useState(null)
  const [nextId, setNextId]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [bidAmount, setBidAmount]       = useState('')

  // Prev/Next product
  useEffect(() => {
    api.get('/api/products/feed')
      .then(res => {
        const ids = res.data.map(p => p.id)
        const idx = ids.indexOf(+id)
        setPrevId(idx > 0 ? ids[idx - 1] : null)
        setNextId(idx < ids.length - 1 ? ids[idx + 1] : null)
      })
      .catch(console.error)
  }, [id])

  // Load product
  useEffect(() => {
    setLoading(true)
    api.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data)
        // support both imageUrl and imageUrls[]
        const imgs = res.data.imageUrls ?? (res.data.imageUrl ? [res.data.imageUrl] : [])
        setImages(imgs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // Load bids if auction
  useEffect(() => {
    if (product?.isAuction) {
      api.get('/api/bids', { params: { productId: product.id } })
        .then(res => setBids(res.data))
        .catch(console.error)
    }
  }, [product])

  // Load my products when showing trade form
  useEffect(() => {
    if (showTradeForm && user) {
      api.get('/api/products/my-products')
        .then(res => setMyProducts(res.data))
        .catch(console.error)
    }
  }, [showTradeForm, user])

  if (loading) return <Spinner animation="border" className="m-5" />
  if (!product) return <Alert variant="warning">Toodet ei leitud.</Alert>

  const now = new Date()
  const endsAt = product.endsAt ? new Date(product.endsAt) : null
  const auctionActive = product.isAuction && endsAt > now
  const topBid = bids.length
    ? Math.max(...bids.map(b => b.amount))
    : product.minBid ?? 0

  const prevImage = () =>
    setCurrent(i => (i === 0 ? images.length - 1 : i - 1))
  const nextImage = () =>
    setCurrent(i => (i === images.length - 1 ? 0 : i + 1))

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
    if (isNaN(amt) || amt <= topBid) {
      setError(`Sisesta summa, mis on suurem kui €${topBid.toFixed(2)}.`)
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
      setError(
        typeof data === 'string'
          ? data
          : data?.message || 'Pakkumine ebaõnnestus.'
      )
    }
  }

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
      setError(
        typeof data === 'string'
          ? data
          : data?.message || 'Vahetuspakkumine ebaõnnestus.'
      )
    }
  }

  return (
    <Container className="my-5">
      <Row className="g-4">
        {/* Image gallery */}
        <Col md={5} className="position-relative">
          {images.length > 0 ? (
            <>
              <Zoom>
                <img
                  src={images[currentImgIdx]}
                  alt={product.name}
                  className="img-fluid w-100"
                  style={{ objectFit: 'contain', height: 400 }}
                />
              </Zoom>
              <Button
                variant="light"
                size="sm"
                className="position-absolute top-50 start-0 translate-middle-y"
                onClick={prevImage}
              >
                ‹
              </Button>
              <Button
                variant="light"
                size="sm"
                className="position-absolute top-50 end-0 translate-middle-y"
                onClick={nextImage}
              >
                ›
              </Button>
            </>
          ) : (
            <div className="border bg-light" style={{ height: 400 }} />
          )}
        </Col>

        {/* Details */}
        <Col md={7}>
          <h2>{product.name}</h2>

          {product.isAuction ? (
            <p className="text-danger">
              Auktsioon {endsAt && `(lõpeb ${endsAt.toLocaleString()})`}
            </p>
          ) : (
            <h4 className="text-success">€{product.price.toFixed(2)}</h4>
          )}

          <p>{product.description}</p>
          <p>
            <strong>Kategooria:</strong> {product.category.name}
          </p>

          {product.isAuction ? (
            <>
              <p>
                {auctionActive
                  ? `Kõrgeim pakkumine: €${topBid.toFixed(2)}`
                  : 'Auktsioon on lõppenud'}
              </p>
              {auctionActive && (
                <div className="mb-3" style={{ maxWidth: 300 }}>
                  <div className="input-group mb-2">
                    <span className="input-group-text">€</span>
                    <input
                      type="number"
                      className="form-control"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="warning"
                    onClick={handlePlaceBid}
                    disabled={!user || user.id === product.sellerId}
                  >
                    Tee pakkumine
                  </Button>
                  {error && <div className="text-danger mt-2">{error}</div>}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="d-flex mb-3">
                <Button
                  className="me-2"
                  onClick={() => window.alert('Lisa ostukorvi')}
                >
                  Lisa ostukorvi
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowTradeForm(s => !s)}
                  disabled={
                    !user ||
                    user.id === product.sellerId ||
                    product.status !== 'Available'
                  }
                >
                  Propose Trade
                </Button>
              </div>
              {showTradeForm && (
                <div className="mb-3" style={{ maxWidth: 300 }}>
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
                  <Button variant="success" onClick={handleProposeTrade}>
                    Saada pakkumine
                  </Button>
                  {error && <div className="text-danger mt-2">{error}</div>}
                </div>
              )}
            </>
          )}

          <div className="mt-3">
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              Tagasi
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}