import React, { useState } from 'react';
import GameModal from './components/GameModal';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
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
    margin: '20px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  };
  
  return (
    <div className="App">
      <div className="game-container">
        <h1>Bienvenido a Doodle Jump</h1>
        <button 
          style={buttonStyle}
          onClick={openModal}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#45a049';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#4CAF50';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Jugar
        </button>
      </div>
      
      <GameModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

export default App;