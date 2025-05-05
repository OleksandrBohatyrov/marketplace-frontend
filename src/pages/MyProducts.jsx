import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function MyProducts() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    api.get('/api/products/my-products', { withCredentials: true })
      .then(res => {
        setProducts(res.data)
        setError('')
      })
      .catch(err => {
        console.error(err)
        setError('Toodete laadimine ebaõnnestus.')
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) return <div className="text-center mt-5">Laadimine...</div>
  if (error)   return <div className="alert alert-danger">{error}</div>

  if (products.length === 0) {
    return <div className="alert alert-info">Teil pole ühtegi toodet.</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Minu tooted</h2>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Nimi</th>
            <th>Kateegoria</th>
            <th>Hind</th>
            <th>Lisatud</th>
            <th>Tagid</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td><a href={`/products/${p.id}`}>{p.name}</a></td>
              <td>{p.category.name}</td>
              <td>€{p.price.toFixed(2)}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td>
                {p.tags.map(tag => (
                  <span key={tag.id} className="badge bg-secondary me-1">
                    {tag.name}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
