import { useEffect, useRef, useState } from 'react';
import { Doodler, Platform, GameState } from '../types/game';
import doodlerRightImg from '../assets/doodler-right.png';
import doodlerLeftImg from '../assets/doodler-left.png';
import platformImg from '../assets/platform.png';
import bgImage from '../assets/doodlejumpbg.png';

const DoodleGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    maxScore: 0,
    gameOver: false
  });

  // Constantes del juego
  const BOARD_WIDTH = 360;
  const BOARD_HEIGHT = 576;
  const DOODLER_WIDTH = 46;
  const DOODLER_HEIGHT = 46;
  const PLATFORM_WIDTH = 60;
  const PLATFORM_HEIGHT = 18;
  const INITIAL_VELOCITY_Y = -8;
  const GRAVITY = 0.4;

  // Referencias para las imágenes
  const doodlerRight = new Image();
  const doodlerLeft = new Image();
  const platformImage = new Image();
  
  doodlerRight.src = doodlerRightImg;
  doodlerLeft.src = doodlerLeftImg;
  platformImage.src = platformImg;

  // Estado del juego
  const [doodler, setDoodler] = useState<Doodler>({
    img: doodlerRight,
    x: BOARD_WIDTH/2 - DOODLER_WIDTH/2,
    y: BOARD_HEIGHT*7/8 - DOODLER_HEIGHT,
    width: DOODLER_WIDTH,
    height: DOODLER_HEIGHT
  });

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [velocityX, setVelocityX] = useState(0);
  const [velocityY, setVelocityY] = useState(INITIAL_VELOCITY_Y);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Inicializar el juego
    const initGame = () => {
      // Colocar plataformas iniciales
      const initialPlatforms = [];
      
      // Plataforma inicial
      initialPlatforms.push({
        img: platformImage,
        x: BOARD_WIDTH/2,
        y: BOARD_HEIGHT - 50,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT
      });

      // Generar plataformas adicionales
      for (let i = 0; i < 6; i++) {
        const randomX = Math.floor(Math.random() * BOARD_WIDTH * 3/4);
        initialPlatforms.push({
          img: platformImage,
          x: randomX,
          y: BOARD_HEIGHT - 75*i - 150,
          width: PLATFORM_WIDTH,
          height: PLATFORM_HEIGHT
        });
      }

      setPlatforms(initialPlatforms);
    };

    initGame();
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId: number;

    const update = () => {
      if (gameState.gameOver) return;

      context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

      // Actualizar posición del doodler
      const newDoodler = { ...doodler };
      newDoodler.x += velocityX;
      
      // Límites horizontales
      if (newDoodler.x > BOARD_WIDTH) {
        newDoodler.x = 0;
      } else if (newDoodler.x + newDoodler.width < 0) {
        newDoodler.x = BOARD_WIDTH;
      }

      setDoodler(newDoodler);

      // Dibujar todo
      context.drawImage(newDoodler.img!, newDoodler.x, newDoodler.y, newDoodler.width, newDoodler.height);
      
      platforms.forEach(platform => {
        context.drawImage(platform.img!, platform.x, platform.y, platform.width, platform.height);
      });

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doodler, platforms, gameState.gameOver, velocityX]);

  // Manejo de controles
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        setVelocityX(4);
        setDoodler(prev => ({ ...prev, img: doodlerRight }));
      }
      else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        setVelocityX(-4);
        setDoodler(prev => ({ ...prev, img: doodlerLeft }));
      }
      else if (e.code === "Space" && gameState.gameOver) {
        // Reiniciar juego
        setGameState({ score: 0, maxScore: 0, gameOver: false });
        // Reiniciar otras variables del juego...
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameOver]);

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        style={{ backgroundImage: `url(${bgImage})` }}
      />
    </div>
  );
};

export default DoodleGame;