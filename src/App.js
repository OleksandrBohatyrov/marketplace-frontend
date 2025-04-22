// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RequireAdmin from './components/RequireAdmin'

import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import CreateProduct from './pages/CreateProduct'
import SellPage from './pages/SellPage'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import AdminDashboard from './pages/AdminDashboard'
import CategoryManagement from './pages/CategoryManagement'
import ProductManagement from './pages/ProductManagement'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />

          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/create-product" element={<CreateProduct />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />

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
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
