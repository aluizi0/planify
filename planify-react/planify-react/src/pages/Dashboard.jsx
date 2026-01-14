import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, where, getDocs, writeBatch 
} from 'firebase/firestore';
import { FaSignOutAlt, FaPlus, FaTrash, FaCopy } from 'react-icons/fa';
import '../styles/Dashboard.css';
import { FocusTimer } from '../components/FocusTimer'; 
import { Notes } from '../components/Notes';
import { TaskModal } from '../components/TaskModal';
import { CopyModal } from '../components/CopyModal';
import { DeleteModal } from '../components/DeleteModal';

export function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  
  // Estados para Criar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [taskToEdit, setTaskToEdit] = useState(null); // <--- NOVO: Guarda a tarefa que está sendo editada

  // Estados dos outros modais
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [taskToCopy, setTaskToCopy] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // 1. CARREGAR TAREFAS
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedTasks = tasksData.sort((a, b) => {
         if (a.time < b.time) return -1;
         if (a.time > b.time) return 1;
         return 0;
      });
      setTasks(sortedTasks);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. SALVAR TAREFA (CRIA OU EDITA) <--- LÓGICA MUDADA
  const handleSaveTask = async (taskText, time) => {
    if (!taskText) return;

    try {
        if (taskToEdit) {
            // --- MODO EDIÇÃO ---
            const taskRef = doc(db, "tasks", taskToEdit.id);
            await updateDoc(taskRef, {
                text: taskText,
                time: time || ''
            });
        } else {
            // --- MODO CRIAÇÃO ---
            await addDoc(collection(db, "tasks"), {
                text: taskText, 
                day: selectedDay, 
                time: time || '',
                userId: user.uid, 
                createdAt: new Date().toISOString()
            });
        }
        
        // Fecha tudo e limpa
        setIsModalOpen(false);
        setTaskToEdit(null);

    } catch (error) { 
        console.error("Erro ao salvar:", error); 
        alert("Erro ao salvar tarefa.");
    }
  };

  // 3. ABRIR MODAL PARA CRIAR (Botão +)
  const openCreateModal = (day) => {
    setTaskToEdit(null); // Garante que não está editando
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  // 4. ABRIR MODAL PARA EDITAR (Clique no texto)
  const handleOpenEdit = (task) => {
    setTaskToEdit(task);      // Define quem vamos editar
    setSelectedDay(task.day); // Mantém o dia
    setIsModalOpen(true);     // Abre o mesmo modal
  };

  // --- LÓGICAS DE COPIAR/DELETAR (MANTIDAS IGUAIS) ---
  const handleOpenCopy = (task) => {
    setTaskToCopy(task);
    setIsCopyModalOpen(true);
  };
  const handleConfirmCopy = async (targetDays) => {
    if (!taskToCopy) return;
    try {
        const copyPromises = targetDays.map(day => {
            return addDoc(collection(db, "tasks"), {
                text: taskToCopy.text, time: taskToCopy.time,
                day: day, userId: user.uid, createdAt: new Date().toISOString()
            });
        });
        await Promise.all(copyPromises);
        setIsCopyModalOpen(false); setTaskToCopy(null);
    } catch (error) { console.error("Erro ao copiar:", error); }
  };
  const handleOpenDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async (targetDays) => {
    if (!taskToDelete) return;
    try {
        const batch = writeBatch(db);
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid), where("text", "==", taskToDelete.text));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            if (targetDays.includes(doc.data().day)) batch.delete(doc.ref);
        });
        await batch.commit();
        setIsDeleteModalOpen(false); setTaskToDelete(null);
    } catch (error) { console.error("Erro ao excluir:", error); }
  };

  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  return (
    <div className="dashboard-container">
      <span className="orb orb-1"></span>
      <span className="orb orb-2"></span>

      <header className="dashboard-header">
        <div className="user-info">
          {user.photoURL && <img src={user.photoURL} alt="User" className="user-avatar" referrerPolicy="no-referrer" />}
          <div><span className="greeting">Olá,</span><h2>{user.displayName}</h2></div>
        </div>
        <button onClick={onLogout} className="btn-logout"><FaSignOutAlt /> Sair</button>
      </header>

      <div className="main-grid">
        <section className="schedule-section">
          <div className="week-grid">
            {daysOfWeek.map(day => (
              <div key={day} className="day-column">
                <h3 className="day-title">{day}</h3>
                <div className="task-list">
                  {tasks.filter(t => t.day === day).map(task => (
                    <div key={task.id} className="task-card-item">
                      
                      {/* Clique no horário também abre edição */}
                      {task.time && (
                          <span 
                            className="task-time" 
                            onClick={() => handleOpenEdit(task)}
                            style={{cursor: 'pointer'}}
                          >
                              {task.time}
                          </span>
                      )}
                      
                      {/* CLIQUE NO NOME ABRE A EDIÇÃO */}
                      <span 
                        className="task-text" 
                        onClick={() => handleOpenEdit(task)}
                        title="Clique para editar"
                        style={{ cursor: 'pointer' }} // Mãozinha ao passar o mouse
                      >
                        {task.text}
                      </span>
                      
                      <div className="task-actions">
                        <button onClick={(e) => { e.stopPropagation(); handleOpenCopy(task); }} className="btn-action" title="Copiar"><FaCopy /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleOpenDelete(task); }} className="btn-action" title="Excluir"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-add" onClick={() => openCreateModal(day)}><FaPlus /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="timer-section">
          <div className="focus-card"><FocusTimer /></div>
        </section>
        <section className="notes-section">
          <div className="notes-card">
            <h3>Anotações Importantes</h3>
            <Notes userId={user.uid} />
          </div>
        </section>
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask} 
        day={selectedDay}
        taskToEdit={taskToEdit} // Passamos a tarefa atual para preencher os dados
      />

      <CopyModal 
        isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)}
        onConfirm={handleConfirmCopy} task={taskToCopy}
      />
      <DeleteModal 
        isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete} task={taskToDelete}
      />
    </div>
  );
}