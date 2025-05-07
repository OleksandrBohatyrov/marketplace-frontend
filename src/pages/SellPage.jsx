import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function SellPage() {
  const navigate = useNavigate()

  // Common product fields
  const [name, setName]             = useState('')
  const [description, setDesc]      = useState('')
  const [price, setPrice]           = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [tags, setTags]             = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [error, setError]           = useState('')

  // Auction-specific
  const [isAuction, setIsAuction]   = useState(false)
  const [minBid, setMinBid]         = useState('')
  const [durationHours, setDurationHours] = useState('')

  const fileInput = useRef()

  useEffect(() => {
    api.get('/api/users/me', { withCredentials: true })
      .catch(() => navigate('/login', { replace: true }))

    api.get('/api/categories')
      .then(r => setCategories(r.data))
      .catch(console.error)
    api.get('/api/tags')
      .then(r => setTags(r.data))
      .catch(console.error)
  }, [navigate])

  const toggleTag = id => {
    setSelectedTags(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length < 5)      return [...prev, id]
      return prev
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    const files = fileInput.current.files
    if (!name || (!isAuction && !price) || !categoryId) {
      setError('Täida kõik kohustuslikud väljad.')
      return
    }
    if (selectedTags.length > 5) {
      setError('Maksimaalselt 5 silti.')
      return
    }
    if (files.length === 0) {
      setError('Vali vähemalt üks pilt.')
      return
    }
    if (files.length > 4) {
      setError('Max 4 pilti.')
      return
    }
    if (isAuction) {
      if (!minBid || !durationHours) {
        setError('Sisesta minimaalne pakkumine ja kestus.')
        return
      }
      if (+durationHours <= 0) {
        setError('Kestus peab olema > 0.')
        return
      }
    }

    try {
      const form = new FormData()
      form.append('Name', name)
      form.append('Description', description)
      form.append('Price', parseFloat(price) || 0)
      form.append('CategoryId', parseInt(categoryId, 10))
      selectedTags.forEach(id => form.append('TagIds', id))
      for (let i = 0; i < files.length; i++) {
        form.append('Image', files[i])
      }

      // Auction fields
      form.append('IsAuction', isAuction)                  // backend DTO must accept
      if (isAuction) {
        form.append('MinBid', parseFloat(minBid))
        // End time = now + hours
        const endsAt = new Date(Date.now() + durationHours*3600*1000)
        form.append('EndsAt', endsAt.toISOString())
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
      <h2 className="mb-4">Lisa uus toode</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ maxWidth: 600 }}>
        {/* Name */}
        <div className="mb-3">
          <label className="form-label">Nimi *</label>
          <input type="text"
                 className="form-control"
                 value={name}
                 onChange={e => setName(e.target.value)} />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Kirjeldus</label>
          <textarea className="form-control"
                    rows={3}
                    value={description}
                    onChange={e => setDesc(e.target.value)} />
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="form-label">Kategooria *</label>
          <select className="form-select"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}>
            <option value="">— vali —</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mb-3">
          <label className="form-label">Sildid (kuni 5)</label>
          <div className="d-flex flex-wrap">
            {tags.map(tag => (
              <button type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={
                        'btn me-2 mb-2 ' +
                        (selectedTags.includes(tag.id)
                          ? 'btn-primary'
                          : 'btn-outline-secondary')
                      }>
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="mb-3">
          <label className="form-label">Pildid (1–4) *</label>
          <input type="file"
                 accept="image/*"
                 multiple
                 ref={fileInput}
                 className="form-control" />
        </div>

        {/* Sale type toggle */}
        <div className="form-check mb-3">
          <input className="form-check-input"
                 type="checkbox"
                 id="auctionToggle"
                 checked={isAuction}
                 onChange={() => setIsAuction(f => !f)} />
          <label className="form-check-label" htmlFor="auctionToggle">
            Müü oksjonina
          </label>
        </div>

        {/* If auction: min bid & duration */}
        {isAuction && (
          <>
            <div className="mb-3">
              <label className="form-label">Minimaalne pakkumine (€) *</label>
              <input type="number"
                     step="0.01"
                     className="form-control"
                     value={minBid}
                     onChange={e => setMinBid(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="form-label">Kestus (tundides) *</label>
              <input type="number"
                     className="form-control"
                     value={durationHours}
                     onChange={e => setDurationHours(e.target.value)} />
            </div>
          </>
        )}

        {/* Regular price (if direct sale) */}
        {!isAuction && (
          <div className="mb-4">
            <label className="form-label">Hind (€) *</label>
            <input type="number"
                   step="0.01"
                   className="form-control"
                   value={price}
                   onChange={e => setPrice(e.target.value)} />
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Avalda
        </button>
      </form>
    </div>
  )
}
