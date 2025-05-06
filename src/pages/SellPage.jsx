// src/pages/SellPage.jsx
import React, { useState, useEffect, useRef } from 'react'
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

  // реф для файлов
  const fileInput = useRef()

  useEffect(() => {
    // проверяем авторизацию
    api.get('/api/users/me', { withCredentials: true })
      .catch(() => navigate('/login', { replace: true }))

    // загружаем категории и теги
    api.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(console.error)

    api.get('/api/tags')
      .then(res => setTags(res.data))
      .catch(console.error)
  }, [navigate])

  // тумблер тега
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

    const files = fileInput.current.files
    // валидация
    if (!name || !price || !categoryId) {
      setError('Palun täida nimi, hind ja kategooria.')
      return
    }
    if (selectedTags.length > 5) {
      setError('Maksimaalselt 5 silti.')
      return
    }
    if (files.length === 0) {
      setError('Palun vali vähemalt üks pilt.')
      return
    }
    if (files.length > 4) {
      setError('Laadida võib kuni 4 pilti.')
      return
    }

    try {
      const form = new FormData()
      form.append('Name', name)
      form.append('Description', description)
      form.append('Price', parseFloat(price))
      form.append('CategoryId', parseInt(categoryId, 10))
      selectedTags.forEach(id => form.append('TagIds', id))
      for (let i = 0; i < files.length; i++) {
        form.append('Image', files[i])
      }

      await api.post(
        '/api/products',
        form,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
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

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }} encType="multipart/form-data">
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
                <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                disabled={!selectedTags.includes(tag.id) && selectedTags.length >= 5}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* File input */}
        <div className="mb-4">
          <label htmlFor="prodImages" className="form-label">
            Toote pildid (kuni 4)
          </label>
          <input
            type="file"
            id="prodImages"
            accept="image/*"
            multiple
            ref={fileInput}
            className="form-control"
          />
        </div>

        {/* Avalda */}
        <button type="submit" className="btn btn-primary">
          Avalda
        </button>
      </form>
    </div>
  )
}
