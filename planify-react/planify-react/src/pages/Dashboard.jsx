import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy 
} from 'firebase/firestore';
import { FaSignOutAlt, FaPlus, FaTrash, FaCopy, FaPlay, FaRedo, FaStop } from 'react-icons/fa';
import '../styles/Dashboard.css';
import { FocusTimer } from '../components/FocusTimer'; 
import { Notes } from '../components/Notes';
import { TaskModal } from '../components/TaskModal';

export function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');

  // Carregar tarefas do Firestore em Tempo Real
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid), // Garante que só carrega as tarefas DESSE usuário
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user]);

  // Adicionar Tarefa
  const handleAddTask = async (taskText, time) => {
    if (!taskText.trim()) return;
    try {
      await addDoc(collection(db, "tasks"), {
        text: taskText,
        day: selectedDay,
        time: time || '',
        userId: user.uid,
        createdAt: new Date()
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar:", error);
    }
  };

  // Deletar Tarefa
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir?")) {
      await deleteDoc(doc(db, "tasks", id));
    }
  };

  // Copiar Tarefa
  const handleCopy = async (task) => {
    const newText = `${task.text} (Cópia)`;
    await addDoc(collection(db, "tasks"), {
      text: newText,
      day: task.day,
      time: task.time,
      userId: user.uid,
      createdAt: new Date()
    });
  };

  const openModal = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  return (
    <div className="dashboard-container">
      {/* --- Luzes Atmosféricas de Fundo --- */}
      <span className="orb orb-1"></span>
      <span className="orb orb-2"></span>
      <span className="orb orb-3"></span>

      {/* Header Transparente */}
      <header className="dashboard-header">
        <div className="user-info">
          {user.photoURL && <img src={user.photoURL} alt="User" className="user-avatar" referrerPolicy="no-referrer" />}
          <div style={{ textAlign: 'center' }}>
            <span className="greeting">Olá,</span>
            <h2>{user.displayName}</h2>
          </div>
        </div>
        <button onClick={onLogout} className="btn-logout">
          <FaSignOutAlt /> Sair
        </button>
      </header>

      {/* Grid Principal */}
      <div className="main-grid">
        
        {/* Seção Cronograma (Vidro) */}
        <section className="schedule-section">
          <div className="week-grid">
            {daysOfWeek.map(day => (
              <div key={day} className="day-column glass-panel">
                <h3 className="day-title">{day}</h3>
                <div className="task-list">
                  {tasks.filter(t => t.day === day).map(task => (
                    <div key={task.id} className="task-card-item">
                      {task.time && <span className="task-time">{task.time}</span>}
                      <span className="task-text">{task.text}</span>
                      <div className="task-actions">
                        <button onClick={() => handleCopy(task)} className="btn-action btn-copy"><FaCopy /></button>
                        <button onClick={() => handleDelete(task.id)} className="btn-action btn-delete"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.day === day).length === 0 && (
                    <p className="empty-msg">Vazio</p>
                  )}
                </div>
                <button className="btn-add" onClick={() => openModal(day)}>
                  <FaPlus />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Seção Timer (Vidro) */}
        <section className="timer-section">
          <div className="focus-card glass-panel">
            <FocusTimer />
          </div>
        </section>

        {/* Seção Notas (Vidro) */}
        <section className="notes-section">
          <div className="notes-card glass-panel">
            <Notes userId={user.uid} />
          </div>
        </section>

      </div>

      {isModalOpen && (
        <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAddTask} 
          day={selectedDay}
        />
      )}
    </div>
  );
}