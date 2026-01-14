import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export function DeleteModal({ isOpen, onClose, onConfirm, task }) {
  // Já inicia com o dia da tarefa selecionado, pois se clicou em excluir,
  // no mínimo quer excluir do dia atual.
  const [selectedDays, setSelectedDays] = useState(task ? [task.day] : []);
  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  if (!isOpen) return null;

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      // Impede desmarcar tudo (tem que excluir de pelo menos um lugar)
      if (selectedDays.length === 1) return; 
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDays);
    setSelectedDays([]); 
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
            <h3>Excluir "{task?.text}" de:</h3> 
            <button onClick={onClose} style={styles.closeBtn}><FaTimes /></button>
        </div>

        <div style={styles.grid}>
            {daysOfWeek.map(day => {
                const isSelected = selectedDays.includes(day);
                
                return (
                    <div 
                        key={day} 
                        onClick={() => toggleDay(day)}
                        style={{
                            ...styles.dayBox,
                            // Visual de "selecionado para morte": Branco
                            background: isSelected ? '#fff' : '#1a1a1a',
                            color: isSelected ? '#000' : '#fff',
                            borderColor: isSelected ? '#fff' : '#333'
                        }}
                    >
                        {day}
                    </div>
                );
            })}
        </div>

        <button onClick={handleConfirm} style={styles.deleteBtn}>
            Confirmar Exclusão
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200
  },
  modal: {
    background: '#111', 
    border: '1px solid #333',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
    padding: '30px',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '400px',
    color: 'white'
  },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', gap: '10px' },
  closeBtn: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  dayBox: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: '0.2s', height: '50px'
  },
  deleteBtn: {
    width: '100%', padding: '12px',
    background: '#ff3333', // Vermelho para indicar perigo
    color: '#fff', border: 'none', borderRadius: '8px',
    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
  }
};