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
  const [tags, setTags]             = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [error, setError]           = useState('')

  useEffect(() => {
    // kontrollime autoriseerimist
    api.get('/api/users/me', { withCredentials: true })
      .catch(() => navigate('/login', { replace: true }))

    // laadime kategooriad ja sildid
    api.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err))

    api.get('/api/tags')
      .then(res => setTags(res.data))
      .catch(err => console.error(err))
  }, [navigate])

  // sildi valiku ümberlülitamine
  const toggleTag = id => {
    setSelectedTags(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      if (prev.length < 5) {
        return [...prev, id]
      }
      return prev
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!name || !price || !categoryId) {
      setError('Palun täida nimi, hind ja kategooria.')
      return
    }
    if (selectedTags.length > 5) {
      setError('Maksimaalselt 5 silti.')
      return
    }

    try {
      await api.post(
        '/api/products',
        {
          name,
          description,
          price: parseFloat(price),
          categoryId: parseInt(categoryId, 10),
          tagIds: selectedTags
        },
        { withCredentials: true }
      )
      navigate('/', { replace: true })
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) {
        navigate('/login', { replace: true })
      } else {
        setError('Toote avaldamine ebaõnnestus.')
      }
    }
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Lisa uus toode müügiks</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        {/* Nimi */}
        <div className="mb-3">
          <label className="form-label">Nimi</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Kirjeldus */}
        <div className="mb-3">
          <label className="form-label">Kirjeldus</label>
          <textarea
            className="form-control"
            rows={3}
            value={description}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        {/* Hind ja kategooria */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Hind (€)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Kategooria</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">— vali —</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sildid */}
        <div className="mb-4">
          <label className="form-label">Sildid (kuni 5)</label>
          <div className="d-flex flex-wrap">
            {tags.map(tag => (
              <button
                type="button"
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={
                  'btn me-2 mb-2 ' +
                  (selectedTags.includes(tag.id)
                    ? 'btn-primary'
                    : 'btn-outline-secondary')
                }
                disabled={
                  !selectedTags.includes(tag.id) && selectedTags.length >= 5
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Avalda */}
        <button type="submit" className="btn btn-primary">
          Avalda
        </button>
      </form>
    </div>
  )
}
