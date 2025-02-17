import { useEffect, useRef } from 'react';
import doodlerRightImg from '../assets/BabyWolf-idle.gif';
import doodlerLeftImg from '../assets/BabyWolf-idle.gif';
import platformImg from '../assets/platform.png';
import bgImage1 from '../assets/sky-bg.gif';
import bgImage2 from '../assets/sky-bg-2.gif';
import bgImage3 from '../assets/night-bg.gif';
import bgImage4 from '../assets/space-bg.gif';
import bgImage5 from '../assets/space-bg-2.gif';

const DoodleGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gameRef = useRef({
    // Dimensiones del canvas
    boardWidth: 360,
    boardHeight: 576,

    // Propiedades de la cámara
    cameraY: 0,

    // Propiedades del doodler
    doodlerWidth: 46,
    doodlerHeight: 46,
    doodler: {
      img: null as HTMLImageElement | null,
      x: 0,
      y: 0,
      worldY: 0,
      width:60,
      height: 60,
    },

    // Propiedades de las plataformas
    platformWidth: 60,
    platformHeight: 18,
    platforms: [] as any[],

    // Física
    velocityX: 0,
    velocityY: 0,
    initialVelocityY: -2.5,
    gravity: 0.03,

    // Estado del juego
    score: 0,
    maxScore: 0,
    gameOver: false,
    animationFrameId: 0,

    // Imágenes
    doodlerRightImg: new Image(),
    doodlerLeftImg: new Image(),
    platformImg: new Image(),

    // Sistema de puntuación
    touchedPlatforms: new Set() as Set<string>,

    // Backgrounds (cada uno tiene un umbral de puntuación)
    backgrounds: {
      current: 0,
      images: [
        { img: bgImage1, scoreThreshold: 0 },
        { img: bgImage2, scoreThreshold: 5 },
        { img: bgImage3, scoreThreshold: 10 },
        { img: bgImage4, scoreThreshold: 15 },
        { img: bgImage5, scoreThreshold: 20 },
      ],
    },
  });

  useEffect(() => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Inicialización del doodler
    game.doodler.x = game.boardWidth / 2 - game.doodlerWidth / 2;
    game.doodler.y = game.boardHeight * 7 / 8 - game.doodlerHeight;
    game.doodler.worldY = game.doodler.y;

    // Cargar imágenes
    game.doodlerRightImg.src = doodlerRightImg;
    game.doodlerLeftImg.src = doodlerLeftImg;
    game.platformImg.src = platformImg;

    game.doodler.img = game.doodlerRightImg;
    game.velocityY = game.initialVelocityY;

    // Actualiza el fondo según la puntuación y, por ende, el nivel de dificultad
    const updateBackground = (score: number) => {
      let newBackgroundIndex = 0;
      for (let i = game.backgrounds.images.length - 1; i >= 0; i--) {
        if (score >= game.backgrounds.images[i].scoreThreshold) {
          newBackgroundIndex = i;
          break;
        }
      }
      if (game.backgrounds.current !== newBackgroundIndex) {
        game.backgrounds.current = newBackgroundIndex;
        canvas.style.backgroundImage = `url(${game.backgrounds.images[newBackgroundIndex].img})`;
      }
    };

    const placePlatforms = () => {
      game.platforms = [];

      // Plataforma inicial (siempre normal)
      game.platforms.push({
        img: game.platformImg,
        x: game.boardWidth / 2 - game.platformWidth / 2,
        y: game.boardHeight - 50,
        worldY: game.boardHeight - 50,
        width: game.platformWidth,
        height: game.platformHeight,
      });

      // Plataformas iniciales adicionales
      for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * (game.boardWidth * 3 / 4));
        let worldY = game.boardHeight - 75 * i - 150;
        game.platforms.push({
          img: game.platformImg,
          x: randomX,
          y: worldY,
          worldY: worldY,
          width: game.platformWidth,
          height: game.platformHeight,
        });
      }
    };

    const newPlatform = () => {
      let randomX = Math.floor(Math.random() * (game.boardWidth * 3 / 4));
      const baseGap = 75;
      // Se usa el índice del background para aumentar la dificultad
      const difficultyMultiplier = 1 + game.backgrounds.current * 0.2;
      const gapIncrement = game.score * 0.2 * difficultyMultiplier;
      let worldY = game.platforms[game.platforms.length - 1].worldY - (baseGap + gapIncrement);

      return {
        img: game.platformImg,
        x: randomX,
        y: worldY - game.cameraY,
        worldY: worldY,
        width: game.platformWidth,
        height: game.platformHeight,
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
      const platformId = `${platform.worldY}`;
      if (!game.touchedPlatforms.has(platformId)) {
        game.score += 1;
        game.maxScore = Math.max(game.score, game.maxScore);
        game.touchedPlatforms.add(platformId);
        updateBackground(game.score);
      }
    };

    const updateCamera = () => {
      const cameraThreshold = 150;
      game.doodler.y = game.doodler.worldY - game.cameraY;
      if (game.doodler.y < cameraThreshold) {
        const diff = cameraThreshold - game.doodler.y;
        game.cameraY -= diff;
      }
      game.platforms.forEach(platform => {
        platform.y = platform.worldY - game.cameraY;
      });
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

      // Actualiza la posición horizontal
      game.doodler.x += game.velocityX;
      if (game.doodler.x > game.boardWidth) {
        game.doodler.x = 0;
      } else if (game.doodler.x + game.doodler.width < 0) {
        game.doodler.x = game.boardWidth;
      }

      // Ajusta la dificultad según el background actual
      const difficultyMultiplier = 1 + game.backgrounds.current * 0.2;
      const currentGravity = game.gravity * difficultyMultiplier;

      // Física vertical
      game.velocityY = Math.min(game.velocityY + currentGravity, 8);
      game.doodler.worldY += game.velocityY;

      updateCamera();

      // Game Over si el doodler cae fuera de la vista
      if (game.doodler.worldY > game.cameraY + game.boardHeight) {
        game.gameOver = true;
      }

      // Dibuja y verifica colisiones con cada plataforma
      for (let i = 0; i < game.platforms.length; i++) {
        let platform = game.platforms[i];
        if (platform.y >= -platform.height && platform.y <= game.boardHeight) {
          context.drawImage(
            platform.img,
            platform.x,
            platform.y,
            platform.width,
            platform.height
          );
        }

        if (detectCollision(game.doodler, platform) && game.velocityY >= 0) {
          game.velocityY = game.initialVelocityY;
          game.doodler.worldY = platform.worldY - game.doodler.height;
          updateScore(platform);
        }
      }

      // Dibuja el doodler
      context.drawImage(
        game.doodler.img!,
        game.doodler.x,
        game.doodler.y,
        game.doodler.width,
        game.doodler.height
      );

      // Repone plataformas que salen de la vista
      while (
        game.platforms.length > 0 &&
        game.platforms[0].worldY > game.cameraY + game.boardHeight
      ) {
        game.platforms.shift();
        game.platforms.push(newPlatform());
      }

      // Dibuja la puntuación
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
        // Reinicia el juego
        game.score = 0;
        game.maxScore = 0;
        game.touchedPlatforms.clear();
        game.backgrounds.current = 0;
        canvas.style.backgroundImage = `url(${game.backgrounds.images[0].img})`;

        if (game.animationFrameId) {
          cancelAnimationFrame(game.animationFrameId);
        }

        game.doodler = {
          img: game.doodlerRightImg,
          x: game.boardWidth / 2 - game.doodlerWidth / 2,
          y: game.boardHeight * 7 / 8 - game.doodlerHeight,
          worldY: game.boardHeight * 7 / 8 - game.doodlerHeight,
          width: game.doodlerWidth,
          height: game.doodlerHeight,
        };

        game.velocityX = 0;
        game.velocityY = game.initialVelocityY;
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

    // Inicialización
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
          backgroundImage: `url(${bgImage1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: '2px solid #000',
        }}
      />
    </div>
  );
};

export default DoodleGame;
