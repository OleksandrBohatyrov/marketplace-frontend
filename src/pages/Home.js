// src/pages/Home.js
import React, { useEffect, useState } from 'react'
import api from '../services/api'
import './Home.css'

export default function Home() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch]         = useState('')
  const [selectedCats, setSelected] = useState(new Set())

  // 1) подтягиваем товары и категории
  useEffect(() => {
    api.get('/api/products/feed').then(r => setProducts(r.data))
    api.get('/api/categories').then(r => setCategories(r.data))
  }, [])

  // 2) переключить чекбокс категории
  const toggleCat = (id) => {
    const s = new Set(selectedCats)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  // 3) итоговая фильтрация
  const filtered = products.filter(p => {
    // по названию
    if (!p.name.toLowerCase().includes(search.toLowerCase())) return false
    // по категориям (если хоть одна выбрана)
    if (selectedCats.size > 0 && !selectedCats.has(p.categoryId)) return false
    return true
  })

  return (
    <div className="home-page">
      <h2>Products Feed</h2>

      <div className="home-controls">
        {/* Поисковая строка */}
        <input
          type="text"
          placeholder="Поиск по названию…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Список категорий */}
        <div className="categories-filter">
          <h4>Фильтр по категории</h4>
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

      {/* Список отфильтрованных товаров */}
      <ul className="product-list">
        {filtered.length === 0
          ? <li>Нет товаров по вашему запросу.</li>
          : filtered.map(p => (
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
