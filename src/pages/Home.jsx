// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

export default function Home() {
  const [products, setProducts]     = useState(null);
  const [categories, setCategories] = useState(null);
  const [search, setSearch]         = useState('');
  const [selectedCats, setSelected] = useState(new Set());
  const [sortOrder, setSortOrder]   = useState('');
  const [priceRange, setPriceRange] = useState([0, 0]);
  const sliderRef                    = useRef();

  // load data & init slider
  useEffect(() => {
    api.get('/api/products/feed')
      .then(res => {
        const prods = res.data;
        setProducts(prods);
        // compute bounds
        const prices = prods.map(p => p.price);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setPriceRange([min, max]);

        // init CoreUI range-slider
        // eslint-disable-next-line no-undef
        const slider = window.Coreui.RangeSlider.getOrCreateInstance(sliderRef.current, {
          min, max, value: [min, max], label: true
        });
        slider.on('change', e => setPriceRange(e.detail.value));
      })
      .catch(console.error);

    api.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);  // run once

  if (!products || !categories) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  // apply all filters
  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => selectedCats.size === 0 || selectedCats.has(p.categoryId))
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

  const sorted = [...filtered];
  if (sortOrder === 'asc')  sorted.sort((a,b)=>a.price-b.price);
  if (sortOrder === 'desc') sorted.sort((a,b)=>b.price-a.price);

  return (
    <section className="vh-100">
      <div className="container my-4">
        <h2 className="mb-4">Product feed</h2>

        {/* Search / Sort / Price Inputs */}
        <div className="row mb-3 g-2 align-items-center">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name…"
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
              <option value="">No sorting</option>
              <option value="asc">Price ↑</option>
              <option value="desc">Price ↓</option>
            </select>
          </div>
          <div className="col-md-3 d-flex">
            <input
              type="number"
              className="form-control me-1"
              value={priceRange[0]}
              onChange={e => {
                const min = Number(e.target.value);
                setPriceRange([min, Math.max(min, priceRange[1])]);
              }}
              placeholder="min"
            />
            <input
              type="number"
              className="form-control"
              value={priceRange[1]}
              onChange={e => {
                const max = Number(e.target.value);
                setPriceRange([Math.min(priceRange[0], max), max]);
              }}
              placeholder="max"
            />
          </div>
        </div>

        {/* CoreUI double-slider */}
        <div
          ref={sliderRef}
          data-coreui-toggle="range-slider"
          className="mb-4"
        ></div>

        <div className="row">
          {/* Product list */}
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

          {/* Categories */}
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
