// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products/feed');
        setProducts(response.data);
      } catch (error) {
        console.error('Ошибка при получении товаров', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Products Feed</h2>
      {products.length === 0 && <p>No products found.</p>}
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>
              {product.name} - ${product.price}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
