// src/pages/CreateProduct.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = {
      name,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId)
    };
    try {
      await api.post('/api/products', product);
      navigate('/');
    } catch (error) {
      console.error('Ошибка при создании товара', error);
    }
  };

  return (
    <div>
      <h2>Create New Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name: </label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Description: </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Price: </label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label>Category Id: </label>
          <input type="number" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateProduct;
