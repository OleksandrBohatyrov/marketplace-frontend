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

  // 1) Загрузка корзины
  useEffect(() => {
    api.get('/api/cart')
      .then(res => setCart(res.data))
      .catch(console.error);
  }, []);

  // 2) Запрос clientSecret сразу после загрузки корзины
  useEffect(() => {
    if (cart.length === 0) {
      setClientSecret('');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    api.post('/api/payments/create-payment-intent', {
      amount: Math.round(total * 100), // сумма в центах
      currency: 'usd'
    })
    .then(res => setClientSecret(res.data.clientSecret))
    .catch(console.error);
  }, [cart]);

  // 3) Обработчик клика "Pay"
  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is already empty.');
      return;
    }

    if (!clientSecret) {
      alert('Payment is not ready. Please try again later.');
      return;
    }

    if (!window.confirm('Are you sure you want to pay and clear your cart?')) {
      return;
    }

    setProcessing(true);

    try {
      // Подтверждаем платёж через Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
        // После успешного платежа — очищаем корзину на бэке
        await Promise.all(cart.map(item => api.delete(`/api/cart/${item.id}`)));
        refreshCartCount();
        alert('Оплата прошла успешно! Корзина очищена.');
        setCart([]);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Что-то пошло не так при оплате.');
    } finally {
      setProcessing(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

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
