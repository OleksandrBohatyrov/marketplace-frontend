import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import RequireAdmin from './components/RequireAdmin';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CreateProduct from './pages/CreateProduct';
import Login from './pages/Login';
import Register from './pages/RegisterPage';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import CategoryManagement from './pages/CategoryManagement';
import ProductManagement from './pages/ProductManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsAuthenticated(true);
      setIsAdmin(data.roles.includes('Admin')); 
    } catch {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <Navbar
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        setIsAuthenticated={setIsAuthenticated}
        refreshUser={refreshUser}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login onLogin={refreshUser} />} />
        <Route path="/register" element={<Register />} />

        {/* Admin pages */}
        <Route
          path="/admin"
          element={
            <RequireAdmin isAdmin={isAdmin}>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireAdmin isAdmin={isAdmin}>
              <CategoryManagement />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAdmin isAdmin={isAdmin}>
              <ProductManagement />
            </RequireAdmin>
          }
        />
    
      </Routes>
      <Footer /> 
    </BrowserRouter>
  );
}

export default App;
