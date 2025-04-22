// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart, clearCart } from '../utils/cart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemove = id => {
    removeFromCart(id);
    setCart(getCart());
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      alert('The payment was successful!');
      clearCart();
      setCart([]);
    }
  };

  const total = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <section className="vh-100">
    <div className="container my-4">
      <h2>Корзина</h2>
      {cart.length === 0 ? (
        <p>Your basket is empty.</p>
      ) : (
        <>
          <ul className="list-group mb-3">
            {cart.map(p => (
              <li key={p.id} className="list-group-item d-flex justify-content-between">
                {p.name} — ${p.price}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemove(p.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <h5>Total: ${total.toFixed(2)}</h5>
          <button className="btn btn-primary" onClick={handleCheckout}>
            Pay
          </button>
        </>
      )}
    </div>
    </section>
  );
}