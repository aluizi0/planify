import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard'; // Importamos o novo Dashboard

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <div className="loading-screen">Carregando...</div>;

  return (
    // Se tem usuário -> Dashboard. Se não -> Login.
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      {!user ? (
        <Login />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;