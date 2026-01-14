import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaRedo, FaPen } from 'react-icons/fa';

export function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(25);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            clearInterval(interval);
            // Opcional: Tocar um som aqui
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(editValue);
    setSeconds(0);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(minutes);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    const newMin = parseInt(editValue) || 25;
    setMinutes(newMin);
    setSeconds(0);
    setIsActive(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave();
  };

  return (
    <div className="timer-container">
      <h3 className="timer-label">Tempo de Foco</h3>
      
      <div className="timer-wrapper">
        {isEditing ? (
          <div className="timer-edit-box">
            <input 
              type="number" 
              className="timer-input-edit"
              value={editValue} 
              onChange={handleEditChange}
              onBlur={handleEditSave}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <span className="timer-unit">min</span>
            <button onClick={handleEditSave} className="btn-ok">OK</button>
          </div>
        ) : (
          <div className="timer-display-group">
            <span className="timer-display">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <button onClick={handleEditClick} className="btn-edit-timer">
              <FaPen size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="timer-controls">
        <button className={`timer-btn-primary ${isActive ? 'active' : ''}`} onClick={toggleTimer}>
          {isActive ? <FaPause /> : <FaPlay />}
        </button>
        <button className="timer-btn-secondary" onClick={resetTimer}>
          <FaRedo />
        </button>
      </div>
    </div>
  );
}