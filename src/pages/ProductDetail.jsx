// File: src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

  const [product, setProduct]       = useState(null)
  const [bids, setBids]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [images, setImages]         = useState([])
  const [currentImgIdx, setCurrent] = useState(0)
  const [prevId, setPrevId]         = useState(null)
  const [nextId, setNextId]         = useState(null)
  const [bidAmount, setBidAmount]   = useState('')

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
        setImages(res.data.imageUrls || [])
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

  if (loading) return <Spinner animation="border" className="m-5" />
  if (!product) return <Alert variant="warning">Toodet ei leitud.</Alert>

  const now = new Date()
  const endsAt = product.endsAt ? new Date(product.endsAt) : null
  const auctionActive = product.isAuction && endsAt > now
  const topBid = bids.length ? Math.max(...bids.map(b => b.amount)) : product.minBid || 0

  const placeBid = async () => {
    setError('')
    if (!user) return setError('Logi sisse, et pakkuda.')
    const amt = parseFloat(bidAmount)
    if (isNaN(amt) || amt <= topBid) return setError(`Paku üle €${topBid}.`)
    await api.post('/api/bids', { productId: product.id, amount: amt })
    const res = await api.get('/api/bids', { params: { productId: product.id } })
    setBids(res.data)
    setBidAmount('')
  }

  const prevImage = () => setCurrent(i => (i === 0 ? images.length - 1 : i - 1))
  const nextImage = () => setCurrent(i => (i === images.length - 1 ? 0 : i + 1))

  return (
    <Container className="my-5">

      <Row className="g-4">
        <Col md={5} className="position-relative">
          {images.length > 0 ? (
            <>
              <Zoom>
                <img
                  src={images[currentImgIdx]}
                  alt=""
                  className="img-fluid w-100"
                  style={{ objectFit: 'contain', height: 400 }}
                />
              </Zoom>
              <Button
                variant="light"
                size="sm"
                className="position-absolute top-50 start-0 translate-middle-y"
                onClick={prevImage}
              >‹</Button>
              <Button
                variant="light"
                size="sm"
                className="position-absolute top-50 end-0 translate-middle-y"
                onClick={nextImage}
              >›</Button>
            </>
          ) : (
            <div className="border bg-light" style={{ height: 400 }} />
          )}
        </Col>
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
          <p><strong>Kategooria:</strong> {product.category.name}</p>

          {product.isAuction ? (
            <>
              <p>{auctionActive
                ? `Kõrgeim pakkumine: €${topBid.toFixed(2)}`
                : 'Auktsioon lõppenud'
              }</p>
              {auctionActive && (
                <>
                  <div className="input-group mb-2" style={{ maxWidth: 240 }}>
                    <span className="input-group-text">€</span>
                    <input
                      type="number"
                      className="form-control"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                    />
                  </div>
                  <Button variant="warning" onClick={placeBid}>Paku</Button>
                </>
              )}
              {error && <div className="text-danger mt-2">{error}</div>}
            </>
          ) : (
            <Button onClick={() => alert('Lisa ostukorvi')}>Lisa ostukorvi</Button>
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
