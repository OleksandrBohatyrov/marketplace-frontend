import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// страницы
import Home from './pages/Home';
import SellPage from './pages/SellPage';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// наша новая страница
import MyProducts from './pages/MyProducts';

import ProductDetail from './pages/ProductDetail';
import CreateProduct from './pages/CreateProduct';

// админские
import AdminDashboard from './pages/AdminDashboard';
import CategoryManagement from './pages/CategoryManagement';
import ProductManagement from './pages/ProductManagement';

export default function App() {
  return (
    <BrowserRouter>
     
      <Navbar />

      
      <main className="flex-grow-1">
        <Routes>
         
          <Route path="/" element={<Home />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<Profile />} />

        
          <Route path="/my-products" element={<MyProducts />} />

        
          <Route path="/create-product" element={<CreateProduct />} />
        
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />

         
        </Routes>
      </main>

    
      <Footer />
    </BrowserRouter>
  );
}
