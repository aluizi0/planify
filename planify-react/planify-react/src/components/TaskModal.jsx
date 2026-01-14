import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export function TaskModal({ isOpen, onClose, onSave, day }) {
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!activity.trim()) {
      alert("Por favor, digite o nome da atividade.");
      return;
    }

    // Envia para o Dashboard: 1º Nome, 2º Horário
    onSave(activity, time);

    // Limpa
    setTime('');
    setActivity('');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
            {/* toUpperCase garante que apareça SEG, TER, etc */}
            <h3>Nova tarefa para {day ? day.toUpperCase() : '...'}</h3> 
            <button onClick={onClose} style={styles.closeBtn}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={{width: '100%'}}>
                <label style={styles.label}>Defina o seu horário:</label>
                <input 
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={styles.input} 
                />
            </div>

            <div style={{width: '100%'}}>
                <label style={styles.label}>Digite sua atividade:</label>
                <input 
                    type="text" 
                    placeholder="Ex: Estudar, Correr, Praticar exercícios..." 
                    required
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    style={styles.input} 
                />
            </div>

            <button type="submit" style={styles.saveBtn}>Salvar Atividade</button>
        </form>
      </div>
    </div>
  );
}

// Seus estilos originais (mantidos)
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modal: {
    background: '#111', // Forcei um fundo escuro sólido para garantir contraste
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
    padding: '40px',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '480px',
    color: 'white'
  },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#dbdbdb', cursor: 'pointer', fontSize: '1.2rem' },
  form: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  label: { display: 'block', fontSize: '0.85rem', color: '#b3b3b3', marginBottom: '6px', fontWeight: '500', textAlign: 'left' },
  input: {
    padding: '14px',
    background: '#0f0f0f',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'white',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '1rem',
    colorScheme: 'white'
  },
  saveBtn: {
    marginTop: '10px',
    width: '100%',
    padding: '12px',
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.95rem'
  }
};