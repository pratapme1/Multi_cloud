import { createContext, useContext, useState } from 'react';
import { login as apiLogin } from '../api/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('mc_token');
    const role = localStorage.getItem('mc_role');
    const username = localStorage.getItem('mc_username');
    return token ? { token, role, username } : null;
  });

  const signIn = async (username, password) => {
    const data = await apiLogin(username, password);
    localStorage.setItem('mc_token', data.token);
    localStorage.setItem('mc_role', data.role);
    localStorage.setItem('mc_username', data.username);
    setUser(data);
    return data;
  };

  const signOut = () => {
    ['mc_token', 'mc_role', 'mc_username'].forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
