import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RequireAdmin from './components/RequireAdmin';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CreateProduct from './pages/CreateProduct';
import SellPage from './pages/SellPage';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyOrders from './pages/MyOrders';

import AdminDashboard from './pages/AdminDashboard';
import CategoryManagement from './pages/CategoryManagement';
import ProductManagement from './pages/ProductManagement';

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/create-product" element={<CreateProduct />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/orders" element={<MyOrders />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <RequireAdmin>
                  <CategoryManagement />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RequireAdmin>
                  <ProductManagement />
                </RequireAdmin>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
