import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function CreateProduct() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState('')
  const fileInput = useRef()

  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(console.error)
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!name || !price || !categoryId || !fileInput.current.files[0]) {
      setError('Täida kõik väljad ja vali pildifail')
      return
    }

    try {
      const form = new FormData()
      form.append('Name', name)
      form.append('Description', description)
      form.append('Price', parseFloat(price))
      form.append('CategoryId', parseInt(categoryId, 10))
      form.append('Image', fileInput.current.files[0])

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
      setError(err.response?.data?.message || 'Toote loomisel tekkis viga')
    }
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className='container my-5' style={{ maxWidth: 600 }}>
      <h2 className='mb-4'>Lisa uus toode</h2>
      {error && <div className='alert alert-danger'>{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className='form-floating mb-3'>
          <input
            type='text'
            className='form-control'
            id='prodName'
            placeholder='Toote nimi'
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <label htmlFor='prodName'>Toote nimi</label>
        </div>

        <div className='form-floating mb-3'>
          <textarea
            className='form-control'
            placeholder='Kirjeldus'
            id='prodDesc'
            style={{ height: '100px' }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <label htmlFor='prodDesc'>Kirjeldus</label>
        </div>

        <div className='form-floating mb-3'>
          <input
            type='number'
            step='0.01'
            className='form-control'
            id='prodPrice'
            placeholder='Hind'
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
          <label htmlFor='prodPrice'>Hind, €</label>
        </div>

        <div className='mb-4'>
          <label htmlFor='prodCat' className='form-label'>Kategooria</label>
          <select
            className='form-select'
            id='prodCat'
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
          >
            <option value=''>Vali kategooria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label htmlFor='prodImage' className='form-label'>Toote pilt</label>
          <input
            type='file'
            id='prodImage'
            accept='image/*'
            ref={fileInput}
            className='form-control'
            required
          />
        </div>

        <button type='submit' className='btn btn-success w-100'>
          Lisa toode
        </button>
      </form>
    </div>
  )
}
