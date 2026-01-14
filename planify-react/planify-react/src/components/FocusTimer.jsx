import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaPen } from 'react-icons/fa';

export function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("25");

  const alarmAudio = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            playAlarm();
            clearInterval(interval);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const playAlarm = () => {
    alarmAudio.current.play().catch(e => console.log("Erro som:", e));
    alert("⏰ Tempo Esgotado! Foco finalizado.");
  };

  const toggle = () => setIsActive(!isActive);
  
  const reset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setEditValue("25");
  };

  const handleSaveTime = (e) => {
    e.preventDefault();
    let newMin = parseInt(editValue);

    // BLINDAGEM 1: Se não for número ou for menor que 1, força ser 1 minuto
    if (isNaN(newMin) || newMin < 1) {
        newMin = 1;
    }

    // BLINDAGEM 2: Math.abs garante que sempre será positivo (ex: -5 vira 5)
    setMinutes(Math.abs(newMin));
    setSeconds(0);
    setIsEditing(false);
  };

  // Função para controlar o que é digitado
  const handleChange = (e) => {
    const val = e.target.value;
    // Só deixa atualizar se for vazio (para poder apagar) ou se for positivo
    if (val === '' || parseInt(val) >= 0) {
        setEditValue(val);
    }
  };

  return (
    <div className="focus-card">
      <h3>Tempo de Foco</h3>
      
      {isEditing ? (
        <form onSubmit={handleSaveTime} className="timer-edit-form">
            <input 
                type="number" 
                min="1" // UI Helper
                value={editValue}
                onChange={handleChange} // Nova função de controle
                autoFocus
                className="timer-input"
                onKeyDown={(e) => {
                    // Bloqueia a tecla de menos e ponto (para não por decimal)
                    if (["-", "e", ".", ","].includes(e.key)) {
                        e.preventDefault();
                    }
                }}
            />
            <span className="timer-label">min</span>
            <button type="submit" className="btn-save-timer">OK</button>
        </form>
      ) : (
        <div 
            className="timer-display clickable" 
            onClick={() => !isActive && setIsEditing(true)}
            title="Clique para editar"
        >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            {!isActive && <FaPen className="edit-icon" />}
        </div>
      )}

      <div className="timer-controls">
        <button onClick={toggle} className="btn-timer">
          {isActive ? <FaPause /> : <FaPlay style={{marginLeft:'4px'}} />} 
        </button>
        <button onClick={reset} className="btn-timer-reset">
          <FaRedo />
        </button>
      </div>
    </div>
  );
}