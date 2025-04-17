import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/api/products/${id}`)
       .then(res => setProduct(res.data))
       .catch(err => console.error(err));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Сначала зарегистрируйтесь');
      return navigate('/register');
    }
    if (user.id === String(product.sellerId)) {
      return alert('Нельзя добавить свой товар в корзину');
    }
    try {
      await api.post(`/api/cart/add/${product.id}`);
      alert('Товар добавлен в корзину');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Ошибка при добавлении в корзину');
    }
  };

  if (!product) return <p>Loading…</p>;

  return (
    <div>
      <h2>{product.name}</h2>
      <p><strong>Price:</strong> {product.price} ₽</p>
      <p>{product.description}</p>
      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}

export default ProductDetail;
