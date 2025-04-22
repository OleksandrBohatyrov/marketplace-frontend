import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/api/cart')
      .then(res => setCart(res.data))
      .catch(console.error);
  }, []);

  const handleRemove = async (id) => {
    await api.delete(`/api/cart/${id}`);
    setCart(cart.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      alert('The payment was successful!');
      setCart([]);
    }
  };

  const total = cart.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  return (
    <section className="vh-100">
      <div className="container my-4">
        <h2>Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="list-group mb-3">
              {cart.map(p => (
                <li key={p.id} className="list-group-item d-flex justify-content-between">
                  {p.productName} — €{p.price} × {p.quantity}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemove(p.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <h5>Total: €{total.toFixed(2)}</h5>
            <button className="btn btn-primary" onClick={handleCheckout}>
              Pay
            </button>
          </>
        )}
      </div>
    </section>
  );
}
