import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { FocusTimer } from '../components/FocusTimer';
import { Notes } from '../components/Notes';
import { TaskModal } from '../components/TaskModal';
import { FaPlus, FaTrash, FaCopy, FaPaste } from 'react-icons/fa'; // Adicionei FaCopy e FaPaste
import '../styles/Dashboard.css';

import { db } from '../services/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import Toastify from 'toastify-js'; // Importação do Toastify

const daysOfWeek = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

export function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // NOVO: Estado para guardar a tarefa copiada
  const [copiedTask, setCopiedTask] = useState(null);

  // --- 0. FUNÇÃO AUXILIAR DE TOAST ---
  const showToast = (message, type) => {
    let bg;
    if (type === "success") bg = "#00b09b"; // Verde
    else if (type === "error") bg = "#ff5f6d"; // Vermelho
    else bg = "#444"; // Neutro (para copiar)

    Toastify({
      text: message,
      duration: 3000,
      gravity: "top", // top or bottom
      position: "right", // left, center or right
      style: {
        background: bg,
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        fontWeight: "600"
      }
    }).showToast();
  };

  // 1. CARREGAR TAREFAS
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksArray = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTasks(tasksArray);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. MODAL E SALVAR
  const handleOpenModal = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (day, time, activity) => {
    try {
      await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        day, time, activity, createdAt: new Date()
      });
      setIsModalOpen(false);
      showToast("Tarefa adicionada com sucesso!", "success"); // Toast Verde
    } catch (error) {
      showToast("Erro ao salvar.", "error");
    }
  };

  // 3. DELETAR
  const handleDeleteTask = async (id) => {
    // Removemos o window.confirm para ficar mais ágil, ou pode manter se preferir
    // O toast já serve como feedback visual
    try {
      await deleteDoc(doc(db, "tasks", id));
      showToast("Tarefa removida.", "error"); // Toast Vermelho
    } catch (error) {
      console.error(error);
    }
  };

  // 4. COPIAR TAREFA
  const handleCopyTask = (task) => {
    setCopiedTask({ time: task.time, activity: task.activity });
    showToast("Tarefa copiada! Escolha onde colar.", "neutral");
  };

  // 5. COLAR TAREFA
  const handlePasteTask = async (targetDay) => {
    if (!copiedTask) return;
    try {
      await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        day: targetDay,
        time: copiedTask.time,
        activity: copiedTask.activity,
        createdAt: new Date()
      });
      showToast(`Colado em ${targetDay.toUpperCase()}!`, "success");
      setCopiedTask(null); // Limpa a memória depois de colar (opcional)
    } catch (error) {
      showToast("Erro ao colar.", "error");
    }
  };

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      <div className="main-grid">
        <div className="schedule-section">
          <div className="week-grid">
            {daysOfWeek.map((day) => (
              <div key={day} className="day-column">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #444', marginBottom:'10px', paddingBottom:'5px'}}>
                    <h3 className="day-title" style={{border:'none', margin:0, padding:0}}>{day}</h3>
                    
                    {/* Botão de Colar (Só aparece se tiver algo copiado) */}
                    {copiedTask && (
                        <button 
                            onClick={() => handlePasteTask(day)}
                            className="btn-paste"
                            title="Colar aqui"
                        >
                            <FaPaste /> Colar
                        </button>
                    )}
                </div>
                
                <div className="task-list">
                  {tasks
                    .filter(t => t.day === day)
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(task => (
                        <div key={task.id} className="task-card-item">
                            <span className="task-time">{task.time}</span>
                            <span className="task-text">{task.activity}</span>
                            
                            <div className="task-actions">
                                {/* Botão Copiar */}
                                <button onClick={() => handleCopyTask(task)} className="btn-action btn-copy" title="Copiar">
                                    <FaCopy />
                                </button>
                                {/* Botão Deletar */}
                                <button onClick={() => handleDeleteTask(task.id)} className="btn-action btn-delete" title="Excluir">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                  }
                  {tasks.filter(t => t.day === day).length === 0 && (
                     <p className="empty-msg">Vazio</p>
                  )}
                </div>

                <button className="btn-add" onClick={() => handleOpenModal(day)}>
                    <FaPlus />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="timer-section">
          <FocusTimer />
        </div>

        <div className="notes-section">
          <Notes userId={user.uid} />
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        day={selectedDay}
        onSave={handleSaveTask}
      />
    </div>
  );
}