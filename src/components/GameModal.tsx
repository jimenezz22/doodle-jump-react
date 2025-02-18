import React, { useState } from 'react';
import DoodleGame from '../components/DoodleGame';

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '30px',
  maxWidth: '500px',
  width: '90%',
  textAlign: 'center',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  position: 'relative'
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  padding: '15px 32px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
  margin: '10px 2px',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'all 0.3s ease'
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#555'
};

const titleStyle: React.CSSProperties = {
  marginBottom: '20px',
  color: '#333',
  fontFamily: 'Arial, sans-serif'
};

const gameContainerStyle: React.CSSProperties = {
  marginTop: '20px'
};

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose }) => {
  const [isGameActive, setIsGameActive] = useState(false);

  if (!isOpen) return null;

  const handlePlayClick = () => {
    setIsGameActive(true);
  };

  const handleStopGame = () => {
    setIsGameActive(false);
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        
        {!isGameActive ? (
          <>
            <h2 style={titleStyle}>Doodle Jump</h2>
            <p>¡Prepárate para jugar! Usa las flechas para moverte.</p>
            <button 
              style={buttonStyle} 
              onClick={handlePlayClick}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#45a049';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#4CAF50';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ¡Jugar Ahora!
            </button>
          </>
        ) : (
          <div style={gameContainerStyle}>
            <DoodleGame />
            <button 
              style={{
                ...buttonStyle,
                backgroundColor: '#f44336',
                marginTop: '20px'
              }} 
              onClick={handleStopGame}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#d32f2f';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f44336';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Detener Juego
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModal;