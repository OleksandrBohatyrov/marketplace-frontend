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

  useEffect(() => {
    api.get(`/api/products/${id}`)
       .then(res => setProduct(res.data))
       .catch(err => console.error(err))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      return window.alert('Please register or log in first.')
    }
    if (user.id === String(product.sellerId)) {
      return window.alert("You can't add your own item to the basket.")
    }
    try {
      await api.post(`/api/cart/add/${product.id}`)
      window.alert('Product has been successfully added to your basket!')
    } catch (err) {
      console.error(err)
      window.alert(err.response?.data?.message || 'Failed to add to basket.')
    }
  }

  if (!product) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    )
  }

  return (
    <section className="vh-100">
    <div className="container my-5">
      <div className="row g-4">
        {/* Product img*/}
        <div className="col-md-5">
          <div className="card">
            <img
              src={product.imageUrl || 'https://via.placeholder.com/600x400'}
              className="card-img-top"
              alt={product.name}
            />
          </div>
        </div>

        <div className="col-md-7">
          <h1 className="mb-3">{product.name}</h1>
          <h3 className="text-success mb-4">{product.price} €</h3>
          <p className="lead">{product.description}</p>

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
