import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);

  const fetchProds = async () => {
    const res = await api.get('/api/products/feed');
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProds();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Kas eemaldada see toode?')) return;
    await api.delete(`/api/products/${id}`);
    await fetchProds();
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Tooted</h2>
        <Link to="/create-product" className="btn btn-success">
          Lisa uus
        </Link>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nimi</th><th>Hind</th><th>Kategooria</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.category?.name}</td>
              <td className="text-end">
                <Link to={`/edit-product/${p.id}`} className="btn btn-sm btn-primary me-2">
                  Muuda
                </Link>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(p.id)}
                >
                  Kustuta
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
