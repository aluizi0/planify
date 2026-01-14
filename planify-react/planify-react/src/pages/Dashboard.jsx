import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, addDoc, deleteDoc, doc, onSnapshot, query, where 
} from 'firebase/firestore';
import { FaSignOutAlt, FaPlus, FaTrash, FaCopy } from 'react-icons/fa';
import '../styles/Dashboard.css';
import { FocusTimer } from '../components/FocusTimer'; 
import { Notes } from '../components/Notes';
import { TaskModal } from '../components/TaskModal';

export function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');

  // 1. CARREGAR TAREFAS (Correção: Ordenação feita no JavaScript para evitar erro de índice)
  useEffect(() => {
    if (!user) return;
    
    // Consulta simplificada para evitar bloqueios do Firebase
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordena aqui no cliente (mais seguro para agora)
      // Ordena por Hora e depois por Ordem de Criação
      const sortedTasks = tasksData.sort((a, b) => {
         if (a.time < b.time) return -1;
         if (a.time > b.time) return 1;
         return 0;
      });
      setTasks(sortedTasks);
    }, (error) => {
      console.error("Erro ao buscar tarefas:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. ADICIONAR TAREFA
  const handleAddTask = async (taskText, time) => {
    if (!taskText) return;
    
    try {
      await addDoc(collection(db, "tasks"), {
        text: taskText,
        day: selectedDay, // Usa o dia selecionado ao abrir o modal
        time: time || '',
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false); // Fecha o modal
    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      alert("Erro ao salvar. Verifique se você está logado.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Excluir tarefa?")) {
      await deleteDoc(doc(db, "tasks", id));
    }
  };

  const handleCopy = async (task) => {
    try {
        await addDoc(collection(db, "tasks"), {
        text: task.text, // Copia sem o sufixo (Cópia) para ficar mais limpo
        day: task.day,
        time: task.time,
        userId: user.uid,
        createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Erro ao copiar", error);
    }
  };

  const openModal = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  return (
    <div className="dashboard-container">
      {/* Orbs de fundo */}
      <span className="orb orb-1"></span>
      <span className="orb orb-2"></span>

      {/* Header */}
      <header className="dashboard-header">
        <div className="user-info">
          {user.photoURL && <img src={user.photoURL} alt="User" className="user-avatar" referrerPolicy="no-referrer" />}
          <div>
            <span className="greeting">Olá,</span>
            <h2>{user.displayName}</h2>
          </div>
        </div>
        <button onClick={onLogout} className="btn-logout">
          <FaSignOutAlt /> Sair
        </button>
      </header>

      {/* Grid */}
      <div className="main-grid">
        
        {/* Cronograma */}
        <section className="schedule-section">
          <div className="week-grid">
            {daysOfWeek.map(day => (
              <div key={day} className="day-column">
                <h3 className="day-title">{day}</h3>
                
                <div className="task-list">
                  {tasks.filter(t => t.day === day).map(task => (
                    <div key={task.id} className="task-card-item">
                      {task.time && <span className="task-time">{task.time}</span>}
                      <span className="task-text">{task.text}</span>
                      <div className="task-actions">
                        <button onClick={() => handleCopy(task)} className="btn-action"><FaCopy /></button>
                        <button onClick={() => handleDelete(task.id)} className="btn-action"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn-add" onClick={() => openModal(day)}>
                  <FaPlus />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Timer */}
        <section className="timer-section">
          <div className="focus-card">
            <FocusTimer />
          </div>
        </section>

        {/* Notas */}
        <section className="notes-section">
          <div className="notes-card">
            <Notes userId={user.uid} />
          </div>
        </section>

      </div>

      {/* Modal */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTask} 
        day={selectedDay}
      />
    </div>
  );
}