// src/pages/SellPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function SellPage() {
  const navigate = useNavigate()

  const [name, setName]             = useState('')
  const [description, setDesc]      = useState('')
  const [price, setPrice]           = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError]           = useState('')

  useEffect(() => {
    api.get('/api/users/me', { withCredentials: true })
      .catch(() => navigate('/login', { replace: true }))

    api.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err))
  }, [navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!name || !price || !categoryId) {
      setError('Please fill in name, price and category.')
      return
    }

    try {
      await api.post(
        '/api/products',
        {
          name,
          description,
          price: parseFloat(price),
          categoryId: parseInt(categoryId, 10)
        },
        { withCredentials: true }
      )
      navigate('/', { replace: true })
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) {
        navigate('/login', { replace: true })
      } else {
        setError('Failed to publish product.')
      }
    }
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">List a new product</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={description}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Price</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">— choose —</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Publish
        </button>
      </form>
    </div>
  )
}
