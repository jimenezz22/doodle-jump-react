import { useEffect, useRef } from 'react';
import doodlerRightImg from '../assets/doodler-right.png';
import doodlerLeftImg from '../assets/doodler-left.png';
import platformImg from '../assets/platform.png';
import bgImage from '../assets/doodlejumpbg.png';

const DoodleGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const gameRef = useRef({
    // Canvas dimensions
    boardWidth: 360,
    boardHeight: 576,
    
    // Camera properties
    cameraY: 0,
    
    // Doodler properties
    doodlerWidth: 46,
    doodlerHeight: 46,
    doodler: {
      img: null as HTMLImageElement | null,
      x: 0,
      y: 0,
      worldY: 0, // Posición absoluta en el mundo
      width: 46,
      height: 46
    },
    
    // Platform properties
    platformWidth: 60,
    platformHeight: 18,
    platforms: [] as any[],
    
    // Physics
    velocityX: 0,
    velocityY: 0,
    initialVelocityY: -5.5,
    gravity: 0.2,
    
    // Game state
    score: 0,
    maxScore: 0,
    gameOver: false,
    animationFrameId: 0,
    
    // Images
    doodlerRightImg: new Image(),
    doodlerLeftImg: new Image(),
    platformImg: new Image(),

    // Nuevas propiedades para el sistema de puntuación
    lastTouchedPlatform: null as any,
    platformPoints: 10, // Puntos base por tocar una plataforma
    heightMultiplier: 0.1, // Multiplicador de puntos basado en la altura
    touchedPlatforms: new Set() as Set<string>,
  });

  useEffect(() => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Inicializa la posición del doodler
    game.doodler.x = game.boardWidth / 2 - game.doodlerWidth / 2;
    game.doodler.y = game.boardHeight * 7 / 8 - game.doodlerHeight;
    game.doodler.worldY = game.doodler.y;

    // Cargar imágenes
    game.doodlerRightImg.src = doodlerRightImg;
    game.doodlerLeftImg.src = doodlerLeftImg;
    game.platformImg.src = platformImg;
    game.doodler.img = game.doodlerRightImg;
    game.velocityY = game.initialVelocityY;

    // Coloca las plataformas iniciales
    const placePlatforms = () => {
      game.platforms = [];
      
      // Plataforma inicial (centrada)
      game.platforms.push({
        img: game.platformImg,
        x: game.boardWidth / 2 - game.platformWidth / 2,
        y: game.boardHeight - 50,
        worldY: game.boardHeight - 50,
        width: game.platformWidth,
        height: game.platformHeight
      });

      // Genera plataformas adicionales
      for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * (game.boardWidth * 3 / 4));
        let worldY = game.boardHeight - 75 * i - 150;
        game.platforms.push({
          img: game.platformImg,
          x: randomX,
          y: worldY,
          worldY: worldY,
          width: game.platformWidth,
          height: game.platformHeight
        });
      }
    };

    const newPlatform = () => {
      let randomX = Math.floor(Math.random() * (game.boardWidth * 3 / 4));
      let worldY = game.platforms[game.platforms.length - 1].worldY - 75;
      return {
        img: game.platformImg,
        x: randomX,
        y: worldY,
        worldY: worldY,
        width: game.platformWidth,
        height: game.platformHeight
      };
    };

    const detectCollision = (a: any, b: any) => {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.worldY < b.worldY + b.height &&
        a.worldY + a.height > b.worldY
      );
    };

    const updateScore = (platform: any) => {
      // Crea un identificador único para la plataforma basado en su posición mundial
      const platformId = `${platform.worldY}`; // Usando la posición Y como identificador
      
      // Solo actualiza la puntuación si no hemos tocado esta plataforma antes
      if (!game.touchedPlatforms.has(platformId)) {
        // Aumenta la puntuación en 1
        game.score += 1;
        game.maxScore = Math.max(game.score, game.maxScore);
        
        // Marca esta plataforma como tocada
        game.touchedPlatforms.add(platformId);
      }
    };

    // Actualiza la cámara usando una zona muerta para evitar movimientos constantes
    const updateCamera = () => {
      const cameraThreshold = 150; // Umbral en píxeles desde la parte superior
      // Calcula la posición en pantalla del doodler
      game.doodler.y = game.doodler.worldY - game.cameraY;
      
      // Si el doodler se acerca demasiado a la parte superior, mueve la cámara
      if (game.doodler.y < cameraThreshold) {
        const diff = cameraThreshold - game.doodler.y;
        game.cameraY -= diff; // Mueve la cámara para mantener al doodler en la zona visible
      }
      
      // Actualiza las posiciones en pantalla de las plataformas
      game.platforms.forEach(platform => {
        platform.y = platform.worldY - game.cameraY;
      });
      
      // Recalcula la posición en pantalla del doodler
      game.doodler.y = game.doodler.worldY - game.cameraY;
    };

    const update = () => {
      if (game.gameOver) {
        context.fillStyle = "black";
        context.font = "16px sans-serif";
        context.fillText(
          "Game Over: Press 'Space' to Restart",
          game.boardWidth / 7,
          game.boardHeight * 7 / 8
        );
        game.animationFrameId = requestAnimationFrame(update);
        return;
      }

      context.clearRect(0, 0, game.boardWidth, game.boardHeight);

      // Actualiza posición horizontal del doodler
      game.doodler.x += game.velocityX;
      if (game.doodler.x > game.boardWidth) {
        game.doodler.x = 0;
      } else if (game.doodler.x + game.doodler.width < 0) {
        game.doodler.x = game.boardWidth;
      }

      // Física vertical: aplicar gravedad y actualizar la posición absoluta
      game.velocityY = Math.min(game.velocityY + game.gravity, 8);
      game.doodler.worldY += game.velocityY;

      // Actualiza la cámara según la posición del doodler (con zona muerta)
      updateCamera();

      // Condición de Game Over: si el doodler cae fuera de la vista
      if (game.doodler.worldY > game.cameraY + game.boardHeight) {
        game.gameOver = true;
      }
      
      // Primero, dibuja las plataformas
      for (let i = 0; i < game.platforms.length; i++) {
        let platform = game.platforms[i];

        // Dibuja solo las plataformas que están en pantalla
        if (platform.y >= -platform.height && platform.y <= game.boardHeight) {
          context.drawImage(
            platform.img,
            platform.x,
            platform.y,
            platform.width,
            platform.height
          );
        }

        // Detecta colisión solo cuando el doodler está cayendo
        if (detectCollision(game.doodler, platform) && game.velocityY >= 0) {
          game.velocityY = game.initialVelocityY;
          game.doodler.worldY = platform.worldY - game.doodler.height;
          updateScore(platform);
        }
      }

      // Ahora, dibuja el doodler sobre las plataformas
      context.drawImage(
        game.doodler.img!,
        game.doodler.x,
        game.doodler.y,
        game.doodler.width,
        game.doodler.height
      );

      // Elimina plataformas fuera de la vista y agrega nuevas
      while (
        game.platforms.length > 0 &&
        game.platforms[0].worldY > game.cameraY + game.boardHeight
      ) {
        game.platforms.shift();
        game.platforms.push(newPlatform());
      }

      context.fillStyle = "black";
      context.font = "16px sans-serif";
      context.fillText(game.score.toString(), 5, 20);

      game.animationFrameId = requestAnimationFrame(update);
    };

    const moveDoodler = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        game.velocityX = 4;
        game.doodler.img = game.doodlerRightImg;
      } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        game.velocityX = -4;
        game.doodler.img = game.doodlerLeftImg;
      } else if (e.code === "Space" && game.gameOver) {
        game.score = 0;
        game.maxScore = 0;
        game.touchedPlatforms.clear();
        if (game.animationFrameId) {
          cancelAnimationFrame(game.animationFrameId);
        }
        // Reinicia el juego
        game.doodler = {
          img: game.doodlerRightImg,
          x: game.boardWidth / 2 - game.doodlerWidth / 2,
          y: game.boardHeight * 7 / 8 - game.doodlerHeight,
          worldY: game.boardHeight * 7 / 8 - game.doodlerHeight,
          width: game.doodlerWidth,
          height: game.doodlerHeight
        };
        game.velocityX = 0;
        game.velocityY = game.initialVelocityY;
        game.score = 0;
        game.maxScore = 0;
        game.gameOver = false;
        game.cameraY = 0;
        placePlatforms();
        
        game.animationFrameId = requestAnimationFrame(update);
      }
    };

    const stopDoodler = (e: KeyboardEvent) => {
      if ((e.code === "ArrowRight" || e.code === "KeyD") && game.velocityX > 0) {
        game.velocityX = 0;
      } else if ((e.code === "ArrowLeft" || e.code === "KeyA") && game.velocityX < 0) {
        game.velocityX = 0;
      }
    };

    // Inicializa el juego
    placePlatforms();
    requestAnimationFrame(update);

    // Event listeners
    document.addEventListener("keydown", moveDoodler);
    document.addEventListener("keyup", stopDoodler);

    return () => {
      document.removeEventListener("keydown", moveDoodler);
      document.removeEventListener("keyup", stopDoodler);
      if (game.animationFrameId) {
        cancelAnimationFrame(game.animationFrameId);
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <canvas
        ref={canvasRef}
        width={gameRef.current.boardWidth}
        height={gameRef.current.boardHeight}
        style={{ 
          backgroundImage: `url(${bgImage})`,
          border: '2px solid #000'
        }}
      />
    </div>
  );
};

export default DoodleGame;
