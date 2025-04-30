import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Home() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState(null);
  const [tags, setTags] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [sortOrder, setSortOrder] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/products/feed'),
      api.get('/api/categories'),
      api.get('/api/tags')
    ])
      .then(([prdRes, catRes, tagRes]) => {
        setProducts(prdRes.data);
        setCategories(catRes.data);
        setTags(tagRes.data);
      })
      .catch(console.error);
  }, []);

  if (products === null || categories === null || tags === null) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Laadimine…</span>
        </div>
      </div>
    );
  }

  const filtered = products.filter(p => {
    if (!p.name.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (selectedCats.size > 0 && !selectedCats.has(p.categoryId))
      return false;

    if (selectedTags.size > 0) {
      const prodTagIds = p.tags.map(t => t.id);
      const hasOne = [...selectedTags].some(id => prodTagIds.includes(id));
      if (!hasOne) return false;
    }

    return true;
  });

  const sorted = [...filtered];
  if (sortOrder === 'asc') sorted.sort((a, b) => a.price - b.price);
  if (sortOrder === 'desc') sorted.sort((a, b) => b.price - a.price);

  const toggleCat = id => {
    const s = new Set(selectedCats);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedCats(s);
  };

  const toggleTag = id => {
    const s = new Set(selectedTags);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedTags(s);
  };

  return (
    <section>
      <div className="container my-4">
        <h2 className="mb-4">Toodete voog</h2>

        {/* Otsing + Sortimine */}
        <div className="row mb-3 g-2 align-items-center">
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
          {/* Tooted */}
          <div className="col-lg-7">
            {sorted.length === 0 ? (
              <div className="alert alert-warning">
                Päringule ei vastanud ükski toode.
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

          {/* Filtrid */}
          <div className="col-lg-5">
            {/* Kategooriad */}
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="mb-0">Kategooriad</h5>
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

            {/* Sildid */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Sildid</h5>
              </div>
              <ul className="list-group list-group-flush">
                {tags.map(tag => (
                  <li key={tag.id} className="list-group-item">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`tag-${tag.id}`}
                        checked={selectedTags.has(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />
                      <label className="form-check-label" htmlFor={`tag-${tag.id}`}>
                        {tag.name}
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
