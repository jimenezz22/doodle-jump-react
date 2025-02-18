import React, { useState } from 'react';
import DoodleGame from '../components/DoodleGame'; // Asegúrate de que la ruta sea correcta

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
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  if (!isOpen) return null;

  const handlePlayClick = () => {
    setIsGameActive(true);
    setCurrentScore(0);
  };

  const handleStopGame = () => {
    setIsGameActive(false);
  };
  
  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        
        {!isGameActive ? (
          <>
            <h2 style={titleStyle}>Doodle Jump</h2>
            {currentScore > 0 && (
              <div style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                backgroundColor: currentScore > highScore/2 ? '#e8f5e9' : '#f5f5f5',
                borderRadius: '8px',
                border: currentScore === highScore ? '2px solid #4CAF50' : 'none'
              }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                  {currentScore === highScore ? '¡Nueva mejor puntuación!' : 'Puntuación final'}
                </p>
                <p style={{ margin: '0', fontSize: '24px', color: '#333' }}>{currentScore}</p>
                {currentScore === highScore && (
                  <p style={{ margin: '5px 0 0 0', color: '#4CAF50', fontSize: '14px' }}>
                    ¡Felicidades! Has superado tu mejor marca.
                  </p>
                )}
              </div>
            )}
            <p>¡Prepárate para jugar! Usa las flechas para moverte.</p>
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              Mejor puntuación: <strong>{highScore}</strong>
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ 
                padding: '5px 10px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '4px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '14px'
              }}>
                Puntuación actual: <strong>{currentScore}</strong>
              </div>
              <div style={{ 
                padding: '5px 10px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '4px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '14px'
              }}>
                Mejor puntuación: <strong>{highScore}</strong>
              </div>
            </div>
            <DoodleGame onScoreUpdate={handleScoreUpdate} />
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