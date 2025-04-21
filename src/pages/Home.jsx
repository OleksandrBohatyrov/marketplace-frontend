// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Home() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch]         = useState('')
  const [selectedCats, setSelected] = useState(new Set())
  const [sortOrder, setSortOrder]   = useState('') 

  useEffect(() => {
    api.get('/api/products/feed')
       .then(r => setProducts(r.data))
       .catch(console.error)

    api.get('/api/categories')
       .then(r => setCategories(r.data))
       .catch(console.error)
  }, [])

  const toggleCat = id => {
    const s = new Set(selectedCats)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const filtered = products.filter(p => {
    if (!p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedCats.size > 0 && !selectedCats.has(p.categoryId)) return false
    return true
  })

  const sorted = [...filtered]
  if (sortOrder === 'asc')  sorted.sort((a, b) => a.price - b.price)
  if (sortOrder === 'desc') sorted.sort((a, b) => b.price - a.price)

  return (
    <div className="container my-4">
      <h2 className="mb-4">Product feed</h2>

      <div className="row">
        <div className="col-lg-9">
          <div className="row mb-3 g-2 align-items-center">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="">No sorting</option>
                <option value="asc">Price ↑</option>
                <option value="desc">Price ↓</option>
              </select>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="alert alert-warning">No products available on your request.</div>
          ) : (
            <ul className="list-group">
              {sorted.map(p => (
                <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <a href={`/products/${p.id}`} className="text-decoration-none">
                    {p.name}
                  </a>
                  <span className="badge bg-primary rounded-pill">€{p.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-lg-3">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Categories</h5>
            </div>
            <ul className="list-group list-group-flush">
              {categories.map(cat => (
                <li key={cat.id} className="list-group-item">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`cat-${cat.id}`}
                      checked={selectedCats.has(cat.id)}
                      onChange={() => toggleCat(cat.id)}
                    />
                    <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
                      {cat.name}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
