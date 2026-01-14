import React from 'react';
import '../styles/Login.css';
import { FaGoogle, FaCheckCircle } from 'react-icons/fa'; // Ícone de Check para lista de benefícios
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";

export function Login() {

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Erro ao logar: " + error.message);
    }
  };

  return (
    <div className="login-container">
      {/* Círculos de fundo (Manti o efeito visual) */}
      <div className="glow-circle circle-1"></div>
      <div className="glow-circle circle-2"></div>

      <div className="glass-card">
        {/* Cabeçalho */}
        <div className="login-header">
            <h2>Planify <span className="highlight">.</span></h2>
            <p className="tagline">Organize sua rotina com nosso cronograma intuitivo, focado na sua produtividade.</p>
        </div>

        <div className="login-header">
            <p className="tagline">Acesse sua conta usando o Google.</p>
        </div>

        {/* Divisor Visual */}
        <div className="spacer"></div>

        {/* Botão Único e Poderoso */}
        <button onClick={handleGoogleLogin} className="btn-google-glass big-btn">
            <FaGoogle className="google-icon" /> 
            <span>Continuar com Google</span>
        </button>

        <p className="footer-text">
            Ambiente seguro autenticado pelo Google.
        </p>
      </div>
    </div>
  );
}