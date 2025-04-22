// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const Ctx = createContext({ user: null, login: ()=>{}, logout: ()=>{} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/api/users/me')
       .then(r => setUser(r.data))
       .catch(()=> setUser(null));
  }, []);

  const login = async (email, pwd) => {
    await api.post('/api/auth/login',{ email, pwd });
    const me = await api.get('/api/users/me');
    setUser(me.data);
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
