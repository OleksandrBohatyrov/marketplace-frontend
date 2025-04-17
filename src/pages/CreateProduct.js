// src/pages/CreateProduct.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // загрузка категорий
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data);
        if (res.data.length) {
          // по умолчанию выбираем первую категорию
          setCategoryId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error('Не удалось загрузить категории', err);
        alert('Ошибка загрузки категорий');
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Формируем правильно типы
    const product = {
      name,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId, 10),
    };

    try {
      await api.post('/api/products', product);
      navigate('/');
    } catch (err) {
      console.error('Ошибка при создании товара', err);
      const msg = err.response?.data?.message
                  || (err.response?.data?.errors
                      ? JSON.stringify(err.response.data.errors)
                      : 'Не удалось создать товар');
      alert(msg);
    }
  };

  return (
    <div>
      <h2>Create New Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label>Product Name: </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required maxLength={200}
          />
        </div>

        {/* Description */}
        <div>
          <label>Description: </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Price */}
        <div>
          <label>Price: </label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required step="0.01"
          />
        </div>

        {/* Вот здесь важно: value = cat.id, а не cat.name */}
        <div>
          <label>Category: </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateProduct;
