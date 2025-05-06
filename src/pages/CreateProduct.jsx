import React, { useEffect, useState } from 'react'
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

useEffect(() => {
api.get('/api/categories')
.then(res => setCategories(res.data))
.catch(console.error)
}, [])

const handleSubmit = async e => {
e.preventDefault()
setError('')
if (!name || !price || !categoryId) {
  setError('Täida kõik väljad: nimi, hind ja kategooria')
  return
}

try {
  await api.post(
    '/api/products',
    {
      name,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId, 10)
    },
    { withCredentials: true }
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
Lisa uus toode
{error && {error}}
<form onSubmit={handleSubmit}>
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

    <button type='submit' className='btn btn-success w-100'>
      Lisa toode
    </button>
  </form>
</div>
)
}