import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

export function Header({ user, onLogout }) {
  return (
    <header style={styles.header}>
      <div style={styles.userInfo}>
        {/* Adicionei referrerPolicy e objectFit para corrigir o bug visual */}
        <img 
            src={user.photoURL} 
            alt="User" 
            style={styles.avatar} 
            referrerPolicy="no-referrer" 
        />
        <div>
            <span style={styles.greeting}>Olá,</span>
            <h3 style={styles.name}>{user.displayName}</h3>
        </div>
      </div>
      
      <button onClick={onLogout} style={styles.btnLogout}>
        <FaSignOutAlt /> Sair
      </button>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    marginBottom: '5px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  avatar: { 
    width: '50px', 
    height: '50px', 
    borderRadius: '50%', 
    border: '2px solid white',
    objectFit: 'cover' // Garante que a foto não fique achatada
  },
  greeting: { display: 'block', fontSize: '0.8rem', color: '#888' },
  name: { margin: 0, color: 'white', fontSize: '1.2rem' },
  btnLogout: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    color: '#ff8888',
    padding: '8px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: '0.3s'
  }
};