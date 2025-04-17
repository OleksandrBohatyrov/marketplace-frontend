import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// 1) Создаём контекст
const AuthContext = createContext({
  user: null,
  loading: true,
});

// 2) Провайдер, который будет запрашивать /api/users/me и сохранять результат
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await api.get('/api/users/me');
        setUser(res.data);
      } catch (err) {
        console.error('Не удалось получить текущего пользователя', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3) Хук для удобного доступа
export function useAuth() {
  return useContext(AuthContext);
}
