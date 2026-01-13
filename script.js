// --- CONFIGURAÇÃO DO FIREBASE (SEUS DADOS REAIS) ---
const firebaseConfig = {
  apiKey: "AIzaSyBWOK0YMzg8ZKc-dIJk0xYfeuQOahoMEfQ",
  authDomain: "task-manager-portfolio-4b57f.firebaseapp.com",
  projectId: "task-manager-portfolio-4b57f",
  storageBucket: "task-manager-portfolio-4b57f.firebasestorage.app",
  messagingSenderId: "379822677100",
  appId: "1:379822677100:web:c2d5f4a736f8b30a46cc49"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// Adicionei 'updateDoc' nos imports
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const taskList = document.getElementById('taskList');
const btnAdd = document.getElementById('btnAdd');
const input = document.getElementById('taskInput');

// Função para mostrar alertas bonitos
const showToast = (msg, type = "success") => {
    Toastify({
        text: msg,
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
            background: type === "error" ? "#ff4444" : "#00ff99",
            color: type === "error" ? "#fff" : "#000",
        }
    }).showToast();
};

// 1. CREATE
btnAdd.addEventListener('click', async () => {
    const text = input.value;
    if (text === "") return showToast("⚠️ Digite uma tarefa!", "error");

    try {
        await addDoc(collection(db, "tarefas"), {
            nome: text,
            concluida: false, // Novo campo para controlar o status
            data: new Date()
        });
        input.value = "";
        showToast("Tarefa adicionada!");
    } catch (e) {
        console.error("Erro: ", e);
        showToast("Erro ao salvar.", "error");
    }
});

// 2. READ (Com Status)
const q = query(collection(db, "tarefas"), orderBy("data", "desc"));

onSnapshot(q, (snapshot) => {
    taskList.innerHTML = "";
    
    if(snapshot.empty) {
        taskList.innerHTML = "<p style='text-align:center; color:#444; margin-top:20px;'>Nenhuma tarefa... que tal adicionar uma? 🚀</p>";
        return;
    }

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        
        // Verifica se está concluída para adicionar a classe CSS
        const isDone = data.concluida ? "done" : "";

        const li = document.createElement('li');
        li.className = `task-item ${isDone}`;
        li.innerHTML = `
            <span class="task-text" onclick="toggleTask('${id}', ${data.concluida})">${data.nome}</span>
            <button class="btn-delete" onclick="deleteTask('${id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        taskList.appendChild(li);
    });
});

// 3. UPDATE (Novo: Marcar como Feito)
window.toggleTask = async (id, currentStatus) => {
    const docRef = doc(db, "tarefas", id);
    await updateDoc(docRef, {
        concluida: !currentStatus // Inverte o status (True vira False, e vice-versa)
    });
};

// 4. DELETE
window.deleteTask = async (id) => {
    // Usamos Toastify com confirmação simples visual
    await deleteDoc(doc(db, "tarefas", id));
    showToast("Tarefa removida!", "error");
};