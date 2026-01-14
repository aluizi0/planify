import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaRedo, FaClock, FaPen } from 'react-icons/fa';
// 👇 Verifique se o caminho está correto. Se criou na pasta contexts, use '../contexts/ToastContext'
import { useToast } from '../components/ToastContext'; 

export function FocusTimer() {
  const { addToast } = useToast();
  
  // --- MUDANÇA AQUI: Inicia com 30 minutos ---
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // --- MUDANÇA AQUI: Valor de edição padrão também é 30 ---
  const [editValue, setEditValue] = useState(30);
  
  const [dragStart, setDragStart] = useState(null);

  // --- FUNÇÃO PARA GERAR O SOM BIP BIP ---
  const playDoubleBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const beep = (startTime) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine'; 
        osc.frequency.value = 880; 
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
        osc.start(startTime);
        osc.stop(startTime + 0.15);
      };

      const now = ctx.currentTime;
      beep(now);          
      beep(now + 0.25);   
      
    } catch (e) {
      console.error("Erro ao tocar som:", e);
    }
  };

  // --- LÓGICA DO TIMER ---
  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // ACABOU
            clearInterval(interval);
            setIsActive(false);
            playDoubleBeep();
            addToast("Tempo de foco finalizado! Parabéns!", "info");
          } else {
            setMinutes((prev) => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((prev) => prev - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, addToast]); 

  // --- CONTROLES ---
  const toggleTimer = () => setIsActive(!isActive);

  // --- MUDANÇA AQUI: Reset volta para o valor editado (agora padrão 30) ---
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(parseInt(editValue) || 30); // Garante voltar para 30 se der erro
    setSeconds(0);
  };

  // --- EDIÇÃO ---
  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(minutes);
    setDragStart(null);
  };

  const handleEditChange = (e) => {
    const val = e.target.value;
    if (val === '' || parseInt(val) >= 0) {
        setEditValue(val);
    }
  };

  const handleEditSave = () => {
    setIsEditing(false);
    let newMin = parseInt(editValue);
    
    // Validação
    if (isNaN(newMin) || newMin < 1) newMin = 1;
    newMin = Math.min(999, newMin);

    setMinutes(newMin);
    setEditValue(newMin);
    setSeconds(0);
    setIsActive(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave();
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  // --- ARRASTAR (DRAG) ---
  const handleMouseDown = (e) => setDragStart(e.clientY);

  const handleMouseMove = (e) => {
    if (dragStart === null || !isEditing) return;
    const delta = dragStart - e.clientY;
    const step = Math.floor(delta / 10);
    
    if (step !== 0) {
      const currentVal = parseInt(editValue) || 0;
      let newValue = currentVal + step;
      newValue = Math.max(1, Math.min(999, newValue));
      setEditValue(newValue);
      setDragStart(e.clientY);
    }
  };

  const handleMouseUp = () => setDragStart(null);

  // --- RENDER ---
  return (
    <div className="timer-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height:'100%', justifyContent:'center'}}>
      <h3 className="timer-label">Tempo de Foco</h3>
      
      <div className="timer-wrapper" style={{margin: '20px 0'}}>
        {isEditing ? (
          <div 
            className="timer-edit-box"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{display: 'flex', alignItems: 'center', gap: '5px'}}
          >
            <input 
              type="number" 
              className="timer-input-edit"
              value={editValue} 
              onChange={handleEditChange}
              onBlur={handleEditSave}
              onKeyDown={handleKeyDown}
              onMouseDown={handleMouseDown}
              autoFocus
              min="1"
              style={{ cursor: 'ns-resize' }}
            />
            <button className="btn-ok" onClick={handleEditSave} style={{fontSize: '0.8rem'}}>OK</button>
          </div>
        ) : (
          <div 
            className="timer-display-group" 
            onClick={handleEditClick} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
            title="Clique para editar"
          >
            <FaClock size={20} color="#fff" style={{opacity: 0.5}} />
            <span className="timer-display">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div className="timer-controls">
        <button className={`timer-btn-primary ${isActive ? 'active' : ''}`} onClick={toggleTimer}>
          {isActive ? <FaPause /> : <FaPlay style={{marginLeft:'4px'}}/>}
        </button>
        <button className="timer-btn-secondary" onClick={resetTimer} title="Reiniciar Timer">
          <FaRedo />
        </button>
      </div>
    </div>
  );
}