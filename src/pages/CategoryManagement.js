import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');

  const fetchCats = async () => {
    const res = await api.get('/api/categories');
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await api.post('/api/categories', { name: newName });
    setNewName('');
    await fetchCats();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/categories/${id}`);
    await fetchCats();
  };

  return (
    <div className="container my-4">
      <h2>Kategooriad</h2>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Uue kategooria nimi"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          Lisa
        </button>
      </div>
      <ul className="list-group">
        {categories.map(cat => (
          <li key={cat.id} className="list-group-item d-flex justify-content-between">
            {cat.name}
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(cat.id)}
            >
              Kustuta
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
