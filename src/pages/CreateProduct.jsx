// src/pages/CreateProduct.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function CreateProduct() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice]             = useState('')
  const [categories, setCategories]   = useState([])
  const [categoryId, setCategoryId]   = useState('')
  const [tags, setTags]               = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [error, setError]             = useState('')

  useEffect(() => {
    api.get('/api/categories').then(res => setCategories(res.data))
    api.get('/api/tags').then(res => setTags(res.data))
  }, [])

  const toggleTag = id => {
    setSelectedTags(prev => {
      if (prev.includes(id))
        return prev.filter(x => x !== id)
      if (prev.length < 5)
        return [...prev, id]
      return prev
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!name || !price || !categoryId)
      return setError('Заполните название, цену и категорию')
    if (selectedTags.length > 5)
      return setError('Можно выбрать не более 5 тегов')

    try {
      await api.post('/api/products', {
        name,
        description,
        price: parseFloat(price),
        categoryId: +categoryId,
        tagIds: selectedTags
      }, { withCredentials: true })

      navigate('/', { replace: true })
    } catch (err) {
      console.error(err)
      setError(err.response?.data || 'Ошибка при создании')
    }
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className='container my-5' style={{ maxWidth: 600 }}>
      <h2 className='mb-4'>Add new product</h2>
      {error && <div className='alert alert-danger'>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Name, Description, Price, Category */}
        {/* ... копировать из вашего кода ... */}

        {/* --- New: Теги --- */}
        <div className='mb-3'>
          <label className='form-label'>Tags (up to 5):</label>
          <div className='d-flex flex-wrap'>
            {tags.map(tag => (
              <button
                type='button'
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

        <button type='submit' className='btn btn-success w-100'>
          Add item
        </button>
      </form>
    </div>
  )
}
