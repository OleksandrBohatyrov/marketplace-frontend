// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/Home.css'
import api from '../services/api'

export default function Home() {
  const [products, setProducts]       = useState([])
  const [categories, setCategories]   = useState([])
  const [tags, setTags]               = useState([])
  const [search, setSearch]           = useState('')
  const [selectedCats, setSelectedCats] = useState(new Set())
  const [selectedTags, setSelectedTags] = useState(new Set())
  const [sortOrder, setSortOrder]     = useState('')
  const [priceRange, setPriceRange]   = useState([0, 0])
  const [selPrice, setSelPrice]       = useState([0, 0])

  useEffect(() => {
    Promise.all([
      api.get('/api/products/feed'),
      api.get('/api/categories'),
      api.get('/api/tags'),
    ])
      .then(([prdRes, catRes, tagRes]) => {
        // добавляем categoryId для фильтрации
        const normalized = prdRes.data.map(p => ({
          ...p,
          categoryId: p.category.id,
          imageUrl: p.ImageUrls && p.ImageUrls.length > 0
            ? p.imageUrls[0]
            : null
        }));
        setProducts(normalized)
        setCategories(catRes.data)
        setTags(tagRes.data)

        // вычисляем границы для фильтра по цене (учитываем аукционы)
        const allPrices = normalized.map(p =>
          p.isAuction
            ? (p.currentBid ?? p.minBid ?? 0)
            : p.price
        )
        const min = Math.min(...allPrices)
        const max = Math.max(...allPrices)
        setPriceRange([min, max])
        setSelPrice([min, max])
      })
      .catch(console.error)
  }, [])

  const now = new Date()

  // функция для получения актуальной цены (для обычных и аукционных товаров)
  const getPrice = p =>
    p.isAuction
      ? (p.currentBid ?? p.minBid ?? 0)
      : p.price

  const filtered = products
    .filter(p => !(p.isAuction && p.endsAt && new Date(p.endsAt) <= now))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !selectedCats.size || selectedCats.has(p.categoryId))
    .filter(p => !selectedTags.size || p.tags.some(t => selectedTags.has(t.id)))
    .filter(p => {
      const price = getPrice(p)
      return price >= selPrice[0] && price <= selPrice[1]
    })

  const sorted = [...filtered]
  if (sortOrder === 'asc') {
    sorted.sort((a, b) => getPrice(a) - getPrice(b))
  }
  if (sortOrder === 'desc') {
    sorted.sort((a, b) => getPrice(b) - getPrice(a))
  }

  // переключение категории
  const toggleCat = id => {
    setSelectedCats(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }
  // переключение тега
  const toggleTag = id => {
    setSelectedTags(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }
  // изменение минимальной цены
  const onMinChange = e => {
    const v = +e.target.value
    setSelPrice([Math.min(v, selPrice[1]), selPrice[1]])
  }
  // изменение максимальной цены
  const onMaxChange = e => {
    const v = +e.target.value
    setSelPrice([selPrice[0], Math.max(v, selPrice[0])])
  }

  return (
    <div className="container my-4">
      {/* Search & Sort */}
      <div className="row mb-3 gx-2 align-items-center">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Otsi toote nime järgi…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="">Ilma sorteerimiseta</option>
            <option value="asc">Hind ↑</option>
            <option value="desc">Hind ↓</option>
          </select>
        </div>
      </div>

      <div className="row">
        {/* Sidebar filters */}
        <aside className="col-lg-3 mb-4">
          {/* Price filter */}
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="mb-0">Hind</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <small>€{selPrice[0].toFixed(2)}</small>
                <small>€{selPrice[1].toFixed(2)}</small>
              </div>
              <input
                type="range"
                className="form-range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={selPrice[0]}
                onChange={onMinChange}
              />
              <input
                type="range"
                className="form-range mt-2"
                min={priceRange[0]}
                max={priceRange[1]}
                value={selPrice[1]}
                onChange={onMaxChange}
              />
            </div>
          </div>
          {/* Category filter */}
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="mb-0">Kategooriad</h5>
            </div>
            <ul className="list-group list-group-flush">
              {categories.map(cat => (
                <li key={cat.id} className="list-group-item py-1">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`cat-${cat.id}`}
                      checked={selectedCats.has(cat.id)}
                      onChange={() => toggleCat(cat.id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`cat-${cat.id}`}
                    >
                      {cat.name}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Tag filter */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Sildid</h5>
            </div>
            <ul className="list-group list-group-flush">
              {tags.map(tag => (
                <li key={tag.id} className="list-group-item py-1">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={selectedTags.has(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`tag-${tag.id}`}
                    >
                      {tag.name}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product grid */}
        <div className="col-lg-9">
          {sorted.length === 0 ? (
            <div className="alert alert-warning">
              Päringule ei vastanud ükski toode.
            </div>
          ) : (
            <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
              {sorted.map(p => (
                <div key={p.id} className="col">
                  <Link
                    to={`/products/${p.id}`}
                    className="card h-100 product-card text-decoration-none text-dark"
                  >
                    <img
                      src={p.imageUrl || 'https://via.placeholder.com/400x300'}
                      alt={p.name}
                      className="card-img-top"
                      style={{ objectFit: 'cover', height: '140px' }}
                    />
                    <div className="card-body p-2 d-flex justify-content-between align-items-center">
                      <h6
                        className="card-title mb-0 text-truncate"
                        style={{ maxWidth: '120px' }}
                      >
                        {p.name}
                      </h6>
                      <span className="fw-bold text-success">
                        €{getPrice(p).toFixed(2)}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
