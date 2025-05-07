// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

  // Фильтр по названию и выбранным категориям
  const filtered = products.filter(p => {
    if (!p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedCats.size > 0 && !selectedCats.has(p.category.id)) return false
    return true
  })

  // Сортируем копию, а не мутируем исходник
  const sorted = [...filtered]
  if (sortOrder === 'asc') {
    sorted.sort((a, b) => {
      const aVal = a.isAuction ? (a.currentBid ?? a.minBid ?? 0) : a.price
      const bVal = b.isAuction ? (b.currentBid ?? b.minBid ?? 0) : b.price
      return aVal - bVal
    })
  }
  if (sortOrder === 'desc') {
    sorted.sort((a, b) => {
      const aVal = a.isAuction ? (a.currentBid ?? a.minBid ?? 0) : a.price
      const bVal = b.isAuction ? (b.currentBid ?? b.minBid ?? 0) : b.price
      return bVal - aVal
    })
  }

  return (
    <section className="vh-100">
      <div className="container my-4">
        <h2 className="mb-4">Toodete voog</h2>

        {/* Поиск + сортировка */}
        <div className="row mb-3 g-2 align-items-center">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Otsi toote nime järgi…"
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
              <option value="">Ilma sorteeringuta</option>
              <option value="asc">Hind ↑</option>
              <option value="desc">Hind ↓</option>
            </select>
          </div>
        </div>

        <div className="row">
          {/* Список товаров */}
          <div className="col-lg-9">
            {sorted.length === 0 ? (
              <div className="alert alert-warning">
                Ei leidnud ühtegi toodet.
              </div>
            ) : (
              <div className="row">
                {sorted.map(p => (
                  <div key={p.id} className="col-md-6 mb-4">
                    <div className="card h-100">
                      <Link to={`/products/${p.id}`}>
                        <img
                          src={p.imageUrl || 'https://via.placeholder.com/400x300'}
                          className="card-img-top"
                          alt={p.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      </Link>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{p.name}</h5>
                        <div className="mt-auto">
                          {p.isAuction ? (
                            <>
                              <span className="badge bg-warning rounded-pill me-2">
                                Auktsioon: €
                                {(p.currentBid ?? p.minBid ?? 0).toFixed(2)}
                              </span>
                              <span className="badge bg-info text-dark">
                                Auktsioon
                              </span>
                            </>
                          ) : (
                            <span className="badge bg-primary rounded-pill">
                              €{p.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Фильтр по категориям */}
          <div className="col-lg-3">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Kategooriad</h5>
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
          </div>
        </div>
      </div>
    </section>
  )
}
