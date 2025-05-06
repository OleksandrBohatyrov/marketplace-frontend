import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function MyProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const placeholder = 'https://via.placeholder.com/400x300'

  useEffect(() => {
    api.get('/api/products/my-products')
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Laadimine…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Minu tooted</h2>

      {products.length === 0 ? (
        <div className="alert alert-info">
          Sul pole veel ühtegi toodet.
        </div>
      ) : (
        <div className="row">
          {products.map(p => (
            <div key={p.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <img
                  src={p.imageUrl || placeholder}
                  className="card-img-top"
                  alt={p.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="text-success mb-1">€{p.price}</p>
                  <p className="mb-1">
                    <strong>Kategooria:</strong> {p.category.name}
                  </p>
                  <p className="mb-1">
                    <strong>Lisatud:</strong>{' '}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mb-1">
                    <strong status>Staatus:</strong>{' '}
                    <span
                      className={`badge rounded-pill ${
                        p.status === 'Sold' ? 'bg-danger' : 'bg-success'
                      }`}
                    >
                      {p.status === 'Sold' ? 'Müüdud' : 'Saadaval'}
                    </span>
                  </p>
                  {p.tags && p.tags.length > 0 && (
                    <p className="mt-2">
                      <strong>Sildid:</strong> {p.tags.map(t => t.name).join(', ')}
                    </p>
                  )}
                  <div className="mt-auto">
                    <a
                      href={`/products/${p.id}`}
                      className="btn btn-outline-primary w-100"
                    >
                      Vaata detailid
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
