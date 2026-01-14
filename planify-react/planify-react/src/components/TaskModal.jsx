import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export function TaskModal({ isOpen, onClose, onSave, day }) {
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Envia os dados para o Dashboard salvar
    onSave(day, time, activity);
    // Limpa o form
    setTime('');
    setActivity('');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
            <h3>Nova tarefa para {day.toUpperCase()}</h3>
            <button onClick={onClose} style={styles.closeBtn}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={styles.label}>Atividade</label>
            <input 
                type="text" 
                placeholder="Ex: Reunião Daily, Estudar Java..." 
                required
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                style={styles.input} 
            />

            <label style={styles.label}>Horário</label>
            <input 
                type="time" 
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={styles.input} 
            />

            <button type="submit" style={styles.saveBtn}>Salvar Tarefa</button>
        </form>
      </div>
    </div>
  );
}

// Estilos Inline (para ser rápido e garantir que não quebre o layout)
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modal: {
    background: '#1a1a1a', border: '1px solid #333', padding: '30px',
    borderRadius: '16px', width: '90%', maxWidth: '400px', color: 'white'
  },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontSize: '0.8rem', color: '#aaa', marginBottom: '-10px' },
  input: {
    padding: '12px', background: '#0f172a', border: '1px solid #333',
    borderRadius: '8px', color: 'white', outline: 'none'
  },
  saveBtn: {
    marginTop: '10px', padding: '12px', background: '#fff', color: '#000',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
  }
};