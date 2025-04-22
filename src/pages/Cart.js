// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCartCount } = useCart();

  // Загрузка текущих товаров из корзины на сервере
  useEffect(() => {
    api.get('/api/cart')
      .then(res => setCart(res.data))
      .catch(console.error);
  }, []);

  // Обработка «оплаты»: очищаем локальный список и обновляем контекст
  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
    } else {
      alert('The payment was successful!');
      setCart([]);            // очищаем отображение списка
      refreshCartCount();     // сбрасываем бейджик в Navbar
      // здесь можно добавить вызов API для создания заказа:
      // await api.post('/api/orders', { /* данные заказа */ });
    }
  };

  // Подсчёт общей суммы
  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <section className="vh-100">
      <div className="container my-4">
        <h2>Cart</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="list-group mb-3">
              {cart.map(item => (
                <li
                  key={item.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    {item.productName}
                    <br />
                    <small className="text-muted">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </small>
                  </div>
                  <span className="fw-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Total:</h5>
              <h5>${total.toFixed(2)}</h5>
            </div>

            <button className="btn btn-primary w-100" onClick={handleCheckout}>
              Pay
            </button>
          </>
        )}
      </div>
    </section>
  );
}
