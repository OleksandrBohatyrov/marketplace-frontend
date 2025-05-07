import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshCartCount } = useCart()

  const [product, setProduct] = useState(null)
  const [myProducts, setMyProducts] = useState([])
  const [showTrade, setShowTrade] = useState(false)
  const [offeredId, setOfferedId] = useState(null)
  const [loading, setLoading] = useState(true)

  // загрузка товара
  useEffect(() => {
    setLoading(true)
    api.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false))
  }, [id])

  // загрузка ваших товаров (для обмена)
  useEffect(() => {
    if (user) {
      api.get('/api/products/my-products')
        .then(res => setMyProducts(res.data))
        .catch(console.error)
    }
  }, [user])

  const handleAddToCart = async () => {
    if (!user) { alert('Palun login'); return }
    if (user.id === product.sellerId) { alert('Oma toodet'); return }
    await api.post(`/api/cart/add/${product.id}`)
    alert('Lisatud ostukorvi')
    refreshCartCount()
  }

  const handlePropose = () => {
    setShowTrade(true)
  }

  const sendTrade = async () => {
    if (!offeredId) { alert('Vali toode'); return }
    try {
      await api.post('/api/trades', {
        requestedProductId: product.id,
        offeredProductId: offeredId
      })
      alert('Kõne tehtud!')
      setShowTrade(false)
      setOfferedId(null)
    } catch (err) {
      console.error(err)
      alert(err.response?.data || 'Error')
    }
  }

  if (loading) return <div>Loading…</div>
  if (!product) return <div>Toodet ei leitud</div>

  return (
    <section className="vh-100">
      <div className="container my-5">
        <div className="row g-4">
          {/* Изображение */}
          <div className="col-md-5">
            <img
              src={product.imageUrl}
              className="img-fluid"
              alt={product.name}
            />
          </div>

          {/* Данные */}
          <div className="col-md-7">
            <h1>{product.name}</h1>
            <h3 className="text-success">€{product.price}</h3>
            <p>{product.description}</p>
            <p><strong>Kategooria:</strong> {product.category.name}</p>
            {/* Кнопки */}
            <button className="btn btn-primary me-2" onClick={handleAddToCart}>
              Lisa ostukorvi
            </button>
            <button className="btn btn-secondary me-2" onClick={handlePropose}>
              Paku vahetust
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              Tagasi
            </button>

            {/* Модал/селект для обмена */}
            {showTrade && (
              <div className="mt-4 p-3 border rounded">
                <h5>Vali, millist toodet pakud:</h5>
                <select
                  className="form-select mb-2"
                  value={offeredId || ''}
                  onChange={e => setOfferedId(Number(e.target.value))}
                >
                  <option value="">— vali oma toode —</option>
                  {myProducts.map(mp => (
                    <option key={mp.id} value={mp.id}>
                      {mp.name} (€{mp.price})
                    </option>
                  ))}
                </select>
                <button className="btn btn-success me-2" onClick={sendTrade}>
                  Saada ettepanek
                </button>
                <button className="btn btn-link" onClick={() => setShowTrade(false)}>
                  Katkesta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
