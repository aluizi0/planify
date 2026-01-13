// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBWOK0YMzg8ZKc-dIJk0xYfeuQOahoMEfQ",
  authDomain: "task-manager-portfolio-4b57f.firebaseapp.com",
  projectId: "task-manager-portfolio-4b57f",
  storageBucket: "task-manager-portfolio-4b57f.firebasestorage.app",
  messagingSenderId: "379822677100",
  appId: "1:379822677100:web:c2d5f4a736f8b30a46cc49"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, orderBy, query, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let unsubscribe = null;

// --- 1. SISTEMA DE LOGIN/LOGOUT ---

document.getElementById('btnLogin').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (e) {
        console.error("Erro login:", e);
        alert("Erro ao entrar: " + e.message);
    }
});

document.getElementById('btnLogout').addEventListener('click', () => {
    if (unsubscribe) unsubscribe(); // Para de ouvir o banco antes de sair
    signOut(auth).then(() => {
        window.location.reload();
    });
});

// MONITOR DE ESTADO (Auth Listener)
onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');

    if (user) {
        // --- LOGADO ---
        currentUser = user;
        
        loginScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');

        // UI Updates
        const userPhoto = document.getElementById('userPhoto');
        const userName = document.getElementById('userName');
        if(userPhoto) userPhoto.src = user.photoURL;
        if(userName) userName.innerText = user.displayName ? user.displayName.split(' ')[0] : 'Usuário';

        // Carrega dados protegidos
        loadUserTasks(user.uid);

    } else {
        // --- DESLOGADO ---
        currentUser = null;
        if (unsubscribe) unsubscribe();
        
        loginScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
    }
});

// --- 2. FUNÇÕES DO BANCO DE DADOS (SEGURANÇA APLICADA) ---

function loadUserTasks(uid) {
    // IMPORTANTE: Esta query exige um "Índice Composto" no Firebase
    // Se der erro no console, clique no link que aparecerá lá para criar o índice.
    const q = query(
        collection(db, "cronograma"), 
        where("uid", "==", uid),  // Filtra apenas tarefas deste usuário
        orderBy("hora")           // Ordena por horário
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        // Limpa as colunas antes de renderizar
        const dias = ['seg','ter','qua','qui','sex','sab','dom'];
        dias.forEach(d => {
            const el = document.getElementById(`list-${d}`);
            if(el) el.innerHTML = "";
        });

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            const card = document.createElement('div');
            card.className = 'task-card';
            // Adicionamos data-id para facilitar manipulação se necessário
            card.setAttribute('data-id', id); 
            
            card.innerHTML = `
                <div class="task-info">
                    <span class="task-time">${data.hora}</span>
                    <span class="task-name">${data.atividade}</span>
                </div>
                <button class="btn-delete-mini" onclick="deleteItem('${id}')" aria-label="Deletar tarefa">
                    <i class="fas fa-times"></i>
                </button>
            `;

            const coluna = document.getElementById(`list-${data.dia}`);
            if(coluna) coluna.appendChild(card);
        });
    }, (error) => {
        console.error("Erro ao ler dados:", error);
        if(error.message.includes("indexes")) {
            alert("Atenção Dev: Olhe o console (F12) e clique no link do Firebase para criar o índice necessário.");
        }
    });
}

document.getElementById('btnAdd').addEventListener('click', async () => {
    if (!currentUser) return alert("Você precisa estar logado!");

    const day = document.getElementById('dayInput').value;
    const time = document.getElementById('timeInput').value;
    const task = document.getElementById('taskInput').value;

    if (!task || !time) return showToast("Preencha horário e tarefa!", "error");

    try {
        await addDoc(collection(db, "cronograma"), {
            uid: currentUser.uid, // <--- CAMPO DE SEGURANÇA OBRIGATÓRIO
            dia: day,
            hora: time,
            atividade: task,
            criadoEm: new Date().toISOString()
        });
        
        document.getElementById('taskInput').value = "";
        showToast("Tarefa agendada!");
    } catch (e) {
        console.error("Erro ao adicionar:", e);
        showToast("Erro ao salvar: " + e.message, "error");
    }
});

// Função Global para o OnClick do HTML
window.deleteItem = async (id) => {
    if(!currentUser) return;
    
    if(confirm("Deseja remover esta tarefa?")) {
        try {
            await deleteDoc(doc(db, "cronograma", id));
            showToast("Tarefa removida.");
        } catch (e) {
            console.error("Erro ao deletar:", e);
            showToast("Erro: Você não tem permissão.", "error");
        }
    }
};

const showToast = (msg, type="success") => {
    // Verifica se a biblioteca Toastify foi carregada
    if (typeof Toastify === 'function') {
        Toastify({ 
            text: msg, 
            duration: 3000, 
            gravity: "bottom",
            position: "right",
            style: { 
                background: type === "error" ? "#ff4444" : "#00C851",
                borderRadius: "8px"
            } 
        }).showToast();
    } else {
        console.log("Toast:", msg); // Fallback se não tiver biblioteca
        if(type === 'error') alert(msg);
    }
};