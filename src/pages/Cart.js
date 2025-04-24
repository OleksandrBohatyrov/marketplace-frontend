// src/pages/Cart.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCartCount } = useCart();

  const stripe = useStripe();
  const elements = useElements();

  // Загрузка корзины
  const loadCart = async () => {
    try {
      const res = await api.get('/api/cart');
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Подготовка clientSecret для оплаты
  useEffect(() => {
    if (cart.length === 0) {
      setClientSecret('');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    api.post('/api/payments/create-payment-intent', {
      amount: Math.round(total * 100),
      currency: 'usd'
    })
    .then(res => setClientSecret(res.data.clientSecret))
    .catch(console.error);
  }, [cart]);

  // Удалить один айтем из корзины
  const handleRemove = async (cartItemId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
      return;
    }
    try {
      await api.delete(`/api/cart/${cartItemId}`);
      // обновляем локальный стейт и счётчик
      setCart(prev => prev.filter(i => i.id !== cartItemId));
      refreshCartCount();
    } catch (err) {
      console.error(err);
      alert('Не удалось удалить товар. Попробуйте ещё раз.');
    }
  };

  // Оплата
  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Ваша корзина пуста.');
      return;
    }

    if (!clientSecret) {
      alert('Платёж ещё не готов. Попробуйте позже.');
      return;
    }

    if (!window.confirm('Оплатить и очистить корзину?')) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (error) throw error;

      if (paymentIntent.status === 'succeeded') {
        // после успешной оплаты удаляем все айтемы
        await Promise.all(cart.map(item => api.delete(`/api/cart/${item.id}`)));
        refreshCartCount();
        alert('Оплата прошла успешно! Корзина очищена.');
        setCart([]);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Ошибка при оплате.');
    } finally {
      setProcessing(false);
    }
  };

  const total = cart
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

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
                    <strong>{item.productName}</strong>
                    <br />
                    <small className="text-muted">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="fw-bold me-3">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Total:</h5>
              <h5>${total}</h5>
            </div>

            <div className="mb-3">
              <label className="form-label">Card details</label>
              <div className="p-2 border rounded">
                <CardElement options={{ hidePostalCode: true }} />
              </div>
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={handleCheckout}
              disabled={processing || !clientSecret}
            >
              {processing ? 'Processing…' : `Pay $${total}`}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
