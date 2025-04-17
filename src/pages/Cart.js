import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Cart() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!loading && user) {
      api.get('/api/cart')
        .then(res => setItems(res.data))
        .catch(err => console.error(err));
    }
  }, [loading, user]);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/api/cart/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
      alert('Не удалось удалить');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!user)  return <p>Сначала <a href="/login">войдите</a> или <a href="/register">зарегистрируйтесь</a>.</p>;

  return (
    <div>
      <h2>Your Cart</h2>
      {items.length === 0
        ? <p>Ваша корзина пуста.</p>
        : (
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Price</th><th>Qty</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.productName}</td>
                  <td>{i.price} ₽</td>
                  <td>{i.quantity}</td>
                  <td>
                    <button onClick={() => handleRemove(i.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}

export default Cart;
