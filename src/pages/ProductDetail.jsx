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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      window.alert('Please register or log in first.')
      return
    }
    if (user.id === String(product.sellerId)) {
      window.alert("You can't add your own item to the basket.")
      return
    }
    try {
      await api.post(`/api/cart/add/${product.id}`)
      window.alert('Product has been successfully added to your basket!')
      refreshCartCount()
    } catch (err) {
      console.error(err)
      window.alert(err.response?.data?.message || 'Failed to add to basket.')
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="alert alert-warning">
          Product not found.
        </div>
      </div>
    )
  }

  return (
    <section className="vh-100">
      <div className="container my-5">
        <div className="row g-4">

          {/* Изображение */}
          <div className="col-md-5">
            <div className="card">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/600x400'}
                className="card-img-top"
                alt={product.name}
              />
            </div>
          </div>

          {/* Детали */}
          <div className="col-md-7">
            <h1 className="mb-3">{product.name}</h1>
            <h3 className="text-success mb-2">€{product.price}</h3>
            <p className="lead">{product.description}</p>

            {/* Категория */}
            <p>
              <strong>Category:</strong> {product.category.name}
            </p>

            {/* Теги */}
            {product.tags && product.tags.length > 0 && (
              <p>
                <strong>Tags:</strong>{' '}
                {product.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="badge bg-secondary me-1"
                  >
                    {tag.name}
                  </span>
                ))}
              </p>
            )}

            <div className="mt-4">
              <button
                className="btn btn-primary me-2"
                onClick={handleAddToCart}
              >
                <i className="bi bi-cart-plus-fill me-1"></i>
                Add to cart
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
