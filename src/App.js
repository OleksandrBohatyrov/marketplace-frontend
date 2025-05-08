import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CookieConsent from 'react-cookie-consent'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

// leheküljed
import Home from './pages/Home'
import SellPage from './pages/SellPage'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyProducts from './pages/MyProducts'
import ProductDetail from './pages/ProductDetail'
import CreateProduct from './pages/CreateProduct'

// chat
import Chats from './pages/Chats'
import ChatDetail from './pages/ChatDetail'

// admin
import AdminDashboard from './pages/AdminDashboard'
import CategoryManagement from './pages/CategoryManagement'
import ProductManagement from './pages/ProductManagement'

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

          {/* chat routes */}
          <Route
            path="/chats"
            element={
              <PrivateRoute>
                <Chats />
              </PrivateRoute>
            }
          />
          <Route
            path="/chats/:chatId"
            element={
              <PrivateRoute>
                <ChatDetail />
              </PrivateRoute>
            }
          />

          <Route path="/create-product" element={<CreateProduct />} />

          {/* admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
        </Routes>
      </main>

      {/* Cookie nõusoleku banner */}
      <CookieConsent
        location="bottom"
        buttonText="Nõustun kõigega"
        declineButtonText="Ainult vajalik"
        enableDeclineButton
        cookieName="site_cookie_consent"
        style={{
          background: '#222',
          color: '#fff',
          fontSize: '14px',
          textAlign: 'left',
        }}
        buttonStyle={{
          background: '#0b79d0',
          color: '#fff',
          fontSize: '13px',
          padding: '8px 16px',
          borderRadius: '4px',
        }}
        declineButtonStyle={{
          background: '#555',
          color: '#fff',
          fontSize: '13px',
          padding: '8px 16px',
          borderRadius: '4px',
        }}
        expires={150}
      >
        Me hindame teie privaatsust. Me kasutame küpsiseid, et parandada teie sirvimiskogemust, pakkuda
        isikupärastatud sisu ning analüüsida liiklust.{' '}
      </CookieConsent>

      <Footer />
    </BrowserRouter>
  )
}
