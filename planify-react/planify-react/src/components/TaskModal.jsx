import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export function TaskModal({ isOpen, onClose, onSave, day, taskToEdit }) {
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');
  // 1. Novo estado para descrição
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (taskToEdit) {
            setTime(taskToEdit.time || '');
            setActivity(taskToEdit.text || '');
            // 2. Carrega a descrição se existir
            setDescription(taskToEdit.description || '');
        } else {
            setTime('');
            setActivity('');
            setDescription('');
        }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activity.trim()) {
      alert("Por favor, digite o nome da atividade.");
      return;
    }
    // 3. Envia a descrição junto com os outros dados
    onSave(activity, time, description);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
            <h3>{taskToEdit ? 'Editar Tarefa' : `Nova tarefa para ${day ? day.toUpperCase() : '...'}`}</h3> 
            <button onClick={onClose} style={styles.closeBtn}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
            {/* Linha 1: Horário e Nome lado a lado para economizar espaço */}
            <div style={{display:'flex', gap:'15px', width:'100%'}}>
                <div style={{flex: 1}}>
                    <label style={styles.label}>Horário:</label>
                    <input 
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={styles.input} 
                    />
                </div>
                <div style={{flex: 2}}>
                    <label style={styles.label}>Atividade:</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Estudar" 
                        required
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        style={styles.input} 
                    />
                </div>
            </div>

            {/* Linha 2: Descrição (Textarea) */}
            <div style={{width: '100%'}}>
                <label style={styles.label}>Descrição / Detalhes:</label>
                <textarea 
                    placeholder="Ex: Estudar matemática, fazer treino de perna..." 
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{...styles.input, resize: 'none', height: '100px'}} 
                />
            </div>

            <button type="submit" style={styles.saveBtn}>
                {taskToEdit ? 'Salvar Alterações' : 'Criar Atividade'}
            </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modal: {
    background: '#111', 
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
    padding: '30px',
    borderRadius: '20px',
    width: '90%', maxWidth: '500px', color: 'white'
  },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#dbdbdb', cursor: 'pointer', fontSize: '1.2rem' },
  form: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  label: { display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '5px', fontWeight: '500', textAlign: 'left' },
  input: {
    padding: '12px', background: '#0f0f0f', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px', color: 'white', outline: 'none', width: '100%', fontSize: '0.95rem',
    fontFamily: 'inherit'
  },
  saveBtn: {
    marginTop: '10px', width: '100%', padding: '12px', background: '#fff', color: '#000',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem'
  }
};