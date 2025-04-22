// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Home() {
  const [products, setProducts]     = useState(null);  // null = ещё не загружено
  const [categories, setCategories] = useState(null);
  const [search, setSearch]         = useState('');
  const [selectedCats, setSelected] = useState(new Set());
  const [sortOrder, setSortOrder]   = useState('');

  useEffect(() => {
    // Загрузим продукты и категории одновременно
    Promise.all([
      api.get('/api/products/feed'),
      api.get('/api/categories')
    ])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .catch(console.error);
  }, []);

  // Пока products или categories === null — показываем спиннер
  if (products === null || categories === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  // Фильтрация/сортировка после загрузки:
  const filtered = products.filter(p => {
    if (!p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCats.size > 0 && !selectedCats.has(p.categoryId)) return false;
    return true;
  });

  const sorted = [...filtered];
  if (sortOrder === 'asc')  sorted.sort((a, b) => a.price - b.price);
  if (sortOrder === 'desc') sorted.sort((a, b) => b.price - a.price);

  return (
    <section className="vh-100">
      <div className="container my-4">
        <h2 className="mb-4">Product feed</h2>

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

        <div className="row">
          <div className="col-lg-9">
            {sorted.length === 0 ? (
              <div className="alert alert-warning">
                No products available on your request.
              </div>
            ) : (
              <ul className="list-group">
                {sorted.map(p => (
                  <li
                    key={p.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <a href={`/products/${p.id}`} className="text-decoration-none">
                      {p.name}
                    </a>
                    <span className="badge bg-primary rounded-pill">
                      €{p.price}
                    </span>
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
                        onChange={() => {
                          const s = new Set(selectedCats);
                          s.has(cat.id) ? s.delete(cat.id) : s.add(cat.id);
                          setSelected(s);
                        }}
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
    </section>
  );
}
