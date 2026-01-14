import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa'; // Removi o FaCheck daqui

export function CopyModal({ isOpen, onClose, onConfirm, task }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  if (!isOpen) return null;

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleConfirm = () => {
    if (selectedDays.length === 0) {
      alert("Selecione pelo menos um dia.");
      return;
    }
    onConfirm(selectedDays);
    setSelectedDays([]); 
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
            <h3>Copiar "{task?.text}" para:</h3> 
            <button onClick={onClose} style={styles.closeBtn}><FaTimes /></button>
        </div>

        <div style={styles.grid}>
            {daysOfWeek.map(day => {
                const isSelected = selectedDays.includes(day);
                const isCurrentDay = day === task?.day; 
                
                return (
                    <div 
                        key={day} 
                        onClick={() => !isCurrentDay && toggleDay(day)}
                        style={{
                            ...styles.dayBox,
                            opacity: isCurrentDay ? 0.3 : 1,
                            cursor: isCurrentDay ? 'not-allowed' : 'pointer',
                            // Se selecionado: Fundo Branco / Texto Preto
                            // Se não: Fundo Escuro / Texto Branco
                            background: isSelected ? '#fff' : '#1a1a1a',
                            color: isSelected ? '#000' : '#fff',
                            borderColor: isSelected ? '#fff' : '#333'
                        }}
                    >
                        {day}
                        {/* Ícone de check removido daqui */}
                    </div>
                );
            })}
        </div>

        <button onClick={handleConfirm} style={styles.saveBtn}>
            Confirmar Cópia
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
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
    padding: '12px', /* Aumentei um pouco o padding já que não tem ícone */
    borderRadius: '8px',
    border: '1px solid #333',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    transition: '0.2s',
    height: '50px' /* Altura fixa para ficarem uniformes */
  },
  saveBtn: {
    width: '100%', padding: '12px',
    background: '#fff', color: '#000', border: 'none', borderRadius: '8px',
    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
  }
};