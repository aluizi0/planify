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
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função Toastify (Alertas)
const showToast = (msg, type="success") => {
    Toastify({ text: msg, duration: 3000, style: { background: type === "error" ? "#ff4444" : "#00ff99", color: type === "error" ? "#fff" : "#000" } }).showToast();
};

// 1. ADICIONAR (CREATE)
document.getElementById('btnAdd').addEventListener('click', async () => {
    const day = document.getElementById('dayInput').value; // seg, ter, qua...
    const time = document.getElementById('timeInput').value;
    const task = document.getElementById('taskInput').value;

    if (!task || !time) return showToast("Preencha horário e atividade!", "error");

    try {
        await addDoc(collection(db, "cronograma"), {
            dia: day,
            hora: time,
            atividade: task,
            criadoEm: new Date() // Para garantir ordem interna
        });
        document.getElementById('taskInput').value = "";
        showToast("Adicionado ao cronograma!");
    } catch (e) {
        console.error(e);
        showToast("Erro ao salvar", "error");
    }
});

// 2. LER E DISTRIBUIR (READ)
// Ordenamos por hora para ficar organizado na coluna
const q = query(collection(db, "cronograma"), orderBy("hora"));

onSnapshot(q, (snapshot) => {
    // 1. Limpa todas as colunas antes de renderizar
    ['seg','ter','qua','qui','sex','sab','dom'].forEach(d => {
        document.getElementById(`list-${d}`).innerHTML = "";
    });

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        // Cria o HTML do cartãozinho
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <span class="task-time">${data.hora}</span>
            <span class="task-name">${data.atividade}</span>
            <button class="btn-delete-mini" onclick="deleteItem('${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        // A MÁGICA: Joga na coluna certa baseada no ID (ex: list-seg)
        const colunaCerta = document.getElementById(`list-${data.dia}`);
        if (colunaCerta) {
            colunaCerta.appendChild(card);
        }
    });
});

// 3. DELETAR
window.deleteItem = async (id) => {
    if(confirm("Remover esta atividade?")) {
        await deleteDoc(doc(db, "cronograma", id));
    }
};