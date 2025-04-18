// src/pages/Home.js
import React, { useEffect, useState } from 'react'
import api from '../services/api'
import './Home.css'

export default function Home() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch]         = useState('')
  const [selectedCats, setSelected] = useState(new Set())
  const [sortOrder, setSortOrder]   = useState('') // '' | 'asc' | 'desc'

  useEffect(() => {
    api.get('/api/products/feed').then(r => setProducts(r.data))
    api.get('/api/categories').then(r => setCategories(r.data))
  }, [])

  const toggleCat = (id) => {
    const s = new Set(selectedCats)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  // сначала фильтруем
  const filtered = products.filter(p => {
    if (!p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedCats.size > 0 && !selectedCats.has(p.categoryId)) return false
    return true
  })

  // затем сортируем копию массива
  const sorted = [...filtered]
  if (sortOrder === 'asc') {
    sorted.sort((a, b) => a.price - b.price)
  } else if (sortOrder === 'desc') {
    sorted.sort((a, b) => b.price - a.price)
  }

  return (
    <div className="home-page">
      <h2>Products Feed</h2>

      <div className="home-controls">
        {/* Поиск */}
        <input
          type="text"
          placeholder="Поиск по названию…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Сортировка */}
        <select
          className="sort-select"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
        >
          <option value="">Без сортировки</option>
          <option value="asc">Цена ↑</option>
          <option value="desc">Цена ↓</option>
        </select>

        {/* Фильтр по категориям */}
        <div className="categories-filter">
          <h4>Категории</h4>
          {categories.map(cat => (
            <label key={cat.id}>
              <input
                type="checkbox"
                checked={selectedCats.has(cat.id)}
                onChange={() => toggleCat(cat.id)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Список */}
      <ul className="product-list">
        {sorted.length === 0
          ? <li>Нет товаров по вашему запросу.</li>
          : sorted.map(p => (
            <li key={p.id}>
              <a href={`/products/${p.id}`}>
                {p.name} — ${p.price}
              </a>
            </li>
          ))
        }
      </ul>
    </div>
  )
}
