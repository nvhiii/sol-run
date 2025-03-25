import React, { useState, useEffect, useCallback, useRef } from 'react';

const RunnerGame = () => {
  // Game constants
  const GAME_HEIGHT = 400;
  const GAME_WIDTH = 800;
  const GRAVITY = 1.5;
  const JUMP_FORCE = -20;
  const PLAYER_WIDTH = 50;
  const PLAYER_HEIGHT = 60;
  const PLAYER_DUCK_HEIGHT = 30;
  const GROUND_HEIGHT = 60;
  const OBSTACLE_WIDTH = 40;
  const OBSTACLE_MIN_HEIGHT = 50;
  const OBSTACLE_MAX_HEIGHT = 120;
  const OBSTACLE_MIN_DISTANCE = 400;
  const OBSTACLE_MAX_DISTANCE = 800;
  const BIRD_WIDTH = 50;
  const BIRD_HEIGHT = 40;
  const BIRD_MIN_HEIGHT = 120;
  const BIRD_MAX_HEIGHT = 200;
  const GAME_SPEED_INITIAL = 8;
  const SPEED_INCREMENT = 0.001;

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerY, setPlayerY] = useState(GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT);
  const [playerVelocity, setPlayerVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [birds, setBirds] = useState([]);
  const [backgroundPosition, setBackgroundPosition] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const gameSpeed = useRef(GAME_SPEED_INITIAL);
  const frameRef = useRef(null);
  const lastObstacleTime = useRef(0);
  const lastBirdTime = useRef(0);

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setPlayerY(GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT);
    setPlayerVelocity(0);
    setIsJumping(false);
    setIsDucking(false);
    setObstacles([]);
    setBirds([]);
    setBackgroundPosition(0);
    gameSpeed.current = GAME_SPEED_INITIAL;
    lastObstacleTime.current = 0;
    lastBirdTime.current = 0;
  };

  // Handle player jump
  const jump = useCallback(() => {
    if (!isJumping && isPlaying && !gameOver) {
      setPlayerVelocity(JUMP_FORCE);
      setIsJumping(true);
      setIsDucking(false);
    }
  }, [isJumping, isPlaying, gameOver]);
  
  // Handle player duck
  const duck = useCallback(() => {
    if (!isJumping && isPlaying && !gameOver) {
      setIsDucking(true);
    }
  }, [isJumping, isPlaying, gameOver]);
  
  // Handle stop ducking
  const stopDucking = useCallback(() => {
    setIsDucking(false);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver) {
        if (!isPlaying) {
          startGame();
        } else {
          jump();
        }
      }
      if (e.code === 'ArrowDown' && !gameOver && isPlaying) {
        duck();
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowDown' && !gameOver && isPlaying) {
        stopDucking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump, duck, stopDucking, isPlaying, gameOver]);

  // Create obstacles
  const createObstacle = useCallback(() => {
    const height = Math.floor(
      Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT) + OBSTACLE_MIN_HEIGHT
    );
    const distance = Math.floor(
      Math.random() * (OBSTACLE_MAX_DISTANCE - OBSTACLE_MIN_DISTANCE) + OBSTACLE_MIN_DISTANCE
    );

    return {
      x: GAME_WIDTH + distance,
      y: GAME_HEIGHT - GROUND_HEIGHT - height,
      width: OBSTACLE_WIDTH,
      height,
      passed: false,
      type: 'ground'
    };
  }, []);
  
  // Create birds
  const createBird = useCallback(() => {
    const height = Math.floor(
      Math.random() * (BIRD_MAX_HEIGHT - BIRD_MIN_HEIGHT) + BIRD_MIN_HEIGHT
    );
    const distance = Math.floor(
      Math.random() * (OBSTACLE_MAX_DISTANCE - OBSTACLE_MIN_DISTANCE) + OBSTACLE_MIN_DISTANCE
    );

    return {
      x: GAME_WIDTH + distance,
      y: GAME_HEIGHT - GROUND_HEIGHT - height,
      width: BIRD_WIDTH,
      height: BIRD_HEIGHT,
      passed: false,
      wingUp: true,
      wingTimer: 0,
      type: 'bird'
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const update = () => {
      // Update player position
      let newVelocity = playerVelocity + GRAVITY;
      let newY = playerY + newVelocity;
      
      // Check if player touches the ground
      if (newY > GAME_HEIGHT - GROUND_HEIGHT - (isDucking ? PLAYER_DUCK_HEIGHT : PLAYER_HEIGHT)) {
        newY = GAME_HEIGHT - GROUND_HEIGHT - (isDucking ? PLAYER_DUCK_HEIGHT : PLAYER_HEIGHT);
        newVelocity = 0;
        setIsJumping(false);
      }
      
      setPlayerY(newY);
      setPlayerVelocity(newVelocity);
      
      // Update background
      setBackgroundPosition(prev => (prev - gameSpeed.current) % 32);
      
      // Update obstacles and birds
      const currentTime = Date.now();
      if (currentTime - lastObstacleTime.current > 1500) {
        setObstacles(prev => [...prev, createObstacle()]);
        lastObstacleTime.current = currentTime;
      }
      
      if (currentTime - lastBirdTime.current > 3000) {
        setBirds(prev => [...prev, createBird()]);
        lastBirdTime.current = currentTime;
      }
      
      // Update bird wing animation
      setBirds(prev => 
        prev.map(bird => ({
          ...bird,
          wingTimer: bird.wingTimer + 1,
          wingUp: bird.wingTimer % 15 === 0 ? !bird.wingUp : bird.wingUp
        }))
      );
      
      const playerRect = {
        x: 100,
        y: newY,
        width: PLAYER_WIDTH,
        height: isDucking ? PLAYER_DUCK_HEIGHT : PLAYER_HEIGHT
      };
      
      // Update obstacles
      setObstacles(prev => 
        prev
          .map(obstacle => {
            // Move obstacle
            const newX = obstacle.x - gameSpeed.current;
            
            // Check collision
            const obstacleRect = {
              x: newX,
              y: obstacle.y,
              width: obstacle.width,
              height: obstacle.height
            };
            
            if (
              playerRect.x < obstacleRect.x + obstacleRect.width &&
              playerRect.x + playerRect.width > obstacleRect.x &&
              playerRect.y < obstacleRect.y + obstacleRect.height &&
              playerRect.y + playerRect.height > obstacleRect.y
            ) {
              setIsPlaying(false);
              setGameOver(true);
              setHighScore(prev => Math.max(prev, score));
              return null;
            }
            
            // Update score
            if (!obstacle.passed && newX < 100 - PLAYER_WIDTH) {
              setScore(prev => prev + 1);
              obstacle.passed = true;
            }
            
            return {
              ...obstacle,
              x: newX
            };
          })
          .filter(obstacle => obstacle && obstacle.x > -OBSTACLE_WIDTH)
      );
      
      // Update birds
      setBirds(prev => 
        prev
          .map(bird => {
            // Move bird
            const newX = bird.x - gameSpeed.current * 1.2; // Birds move slightly faster
            
            // Check collision - birds only hit if the player is standing (not ducking)
            const birdRect = {
              x: newX,
              y: bird.y,
              width: bird.width,
              height: bird.height
            };
            
            if (
              playerRect.x < birdRect.x + birdRect.width &&
              playerRect.x + playerRect.width > birdRect.x &&
              playerRect.y < birdRect.y + birdRect.height &&
              playerRect.y + playerRect.height > birdRect.y &&
              !isDucking // Only collide if NOT ducking
            ) {
              setIsPlaying(false);
              setGameOver(true);
              setHighScore(prev => Math.max(prev, score));
              return null;
            }
            
            // Update score
            if (!bird.passed && newX < 100 - PLAYER_WIDTH) {
              setScore(prev => prev + 1);
              bird.passed = true;
            }
            
            return {
              ...bird,
              x: newX
            };
          })
          .filter(bird => bird && bird.x > -BIRD_WIDTH)
      );
      
      // Increase game speed
      gameSpeed.current += SPEED_INCREMENT;
      
      frameRef.current = requestAnimationFrame(update);
    };
    
    frameRef.current = requestAnimationFrame(update);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying, playerY, playerVelocity, createObstacle, createBird, score, isJumping, isDucking]);

  // Styles
  const gameContainerStyle = {
    position: 'relative',
    width: `${GAME_WIDTH}px`,
    height: `${GAME_HEIGHT}px`,
    overflow: 'hidden',
    borderRadius: '8px',
    border: '2px solid #333',
    background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 70%)',
    margin: '0 auto',
  };

  const groundStyle = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: `${GROUND_HEIGHT}px`,
    background: 'linear-gradient(to bottom, #8B4513 0%, #A52A2A 40%, #8B4513 100%)',
    borderTop: '2px solid #333',
  };

  const grassStyle = {
    position: 'absolute',
    bottom: `${GROUND_HEIGHT - 10}px`,
    left: '0',
    width: '100%',
    height: '10px',
    background: '#228B22',
  };

  const textureStyle = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '30px',
    backgroundImage: 'linear-gradient(90deg, #8B4513 25%, #A52A2A 25%, #A52A2A 50%, #8B4513 50%, #8B4513 75%, #A52A2A 75%, #A52A2A 100%)',
    backgroundSize: '32px 32px',
    backgroundPosition: `${backgroundPosition}px 0`,
    opacity: '0.6',
  };

  const playerStyle = {
    position: 'absolute',
    left: '100px',
    top: `${playerY}px`,
    width: `${PLAYER_WIDTH}px`,
    height: `${isDucking ? PLAYER_DUCK_HEIGHT : PLAYER_HEIGHT}px`,
    background: '#FF0000',
    borderRadius: '8px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.1s, height 0.1s',
    transform: isJumping ? 'rotate(-10deg)' : 'rotate(0deg)',
  };

  const playerHeadStyle = {
    position: 'absolute',
    top: isDucking ? '-5px' : '-15px',
    left: '5px',
    width: '40px',
    height: '25px',
    background: '#FF0000',
    borderRadius: '50% 50% 0 0',
  };

  const playerEyeStyle = {
    position: 'absolute',
    top: '5px',
    left: '25px',
    width: '10px',
    height: '10px',
    background: '#FFFFFF',
    borderRadius: '50%',
  };

  const playerPupilStyle = {
    position: 'absolute',
    top: '7px',
    left: '30px',
    width: '5px',
    height: '5px',
    background: '#000000',
    borderRadius: '50%',
  };

  const obstacleStyle = (obstacle) => ({
    position: 'absolute',
    left: `${obstacle.x}px`,
    top: `${obstacle.y}px`,
    width: `${obstacle.width}px`,
    height: `${obstacle.height}px`,
    background: 'linear-gradient(to right, #006400, #008000)',
    borderRadius: '4px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
  });
  
  const birdStyle = (bird) => ({
    position: 'absolute',
    left: `${bird.x}px`,
    top: `${bird.y}px`,
    width: `${bird.width}px`,
    height: `${bird.height}px`,
    zIndex: 5, // Make birds appear in front of other elements
  });
  
  const birdBodyStyle = {
    position: 'absolute',
    width: '30px',
    height: '20px',
    background: '#4682B4',
    borderRadius: '50%',
    top: '10px',
    left: '10px',
    border: '1px solid #2E5984', // Add border for better visibility
  };
  
  const birdHeadStyle = {
    position: 'absolute',
    width: '20px',
    height: '20px',
    background: '#4682B4',
    borderRadius: '50%',
    top: '5px',
    left: '30px',
    border: '1px solid #2E5984', // Add border for better visibility
  };
  
  const birdBeakStyle = {
    position: 'absolute',
    width: '15px',
    height: '10px',
    background: '#FFA500',
    clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
    top: '10px',
    left: '45px',
  };
  
  const birdWingUpStyle = {
    position: 'absolute',
    width: '25px',
    height: '15px',
    background: '#87CEEB',
    borderRadius: '50%',
    top: '0px',
    left: '15px',
    transform: 'rotate(-20deg)',
    border: '1px solid #5F9EA0', // Add border for better visibility
  };
  
  const birdWingDownStyle = {
    position: 'absolute',
    width: '25px',
    height: '15px',
    background: '#87CEEB',
    borderRadius: '50%',
    top: '25px',
    left: '15px',
    transform: 'rotate(20deg)',
    border: '1px solid #5F9EA0', // Add border for better visibility
  };
  
  const birdEyeStyle = {
    position: 'absolute',
    width: '5px',
    height: '5px',
    background: '#000',
    borderRadius: '50%',
    top: '8px',
    left: '38px',
  };

  const scoreStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  };

  const gameOverStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: '#FF0000',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '10px 0',
    boxShadow: '0 4px 0 #8B0000',
  };

  const startScreenStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  };

  const cloudStyle = {
    position: 'absolute',
    width: '100px',
    height: '50px',
    background: '#FFFFFF',
    borderRadius: '25px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="flex flex-col items-center mt-8" onClick={!isPlaying ? startGame : jump}>
      <div style={gameContainerStyle}>
        <div style={{...cloudStyle, top: '40px', left: '100px'}}></div>
        <div style={{...cloudStyle, top: '80px', left: '400px', width: '150px'}}></div>
        <div style={{...cloudStyle, top: '60px', left: '650px'}}></div>
        
        {obstacles.map((obstacle, index) => (
          <div key={`obstacle-${index}`} style={obstacleStyle(obstacle)}></div>
        ))}
        
        {birds.map((bird, index) => (
          <div key={`bird-${index}`} style={birdStyle(bird)}>
            <div style={birdBodyStyle}></div>
            <div style={birdHeadStyle}></div>
            <div style={birdBeakStyle}></div>
            <div style={birdEyeStyle}></div>
            {bird.wingUp ? (
              <div style={birdWingUpStyle}></div>
            ) : (
              <div style={birdWingDownStyle}></div>
            )}
            {showDebug && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '1px solid red',
                background: 'rgba(255, 0, 0, 0.2)',
              }}></div>
            )}
          </div>
        ))}
        
        <div style={playerStyle}>
          <div style={playerHeadStyle}></div>
          <div style={playerEyeStyle}></div>
          <div style={playerPupilStyle}></div>
          {showDebug && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: '1px solid blue',
              background: 'rgba(0, 0, 255, 0.2)',
            }}></div>
          )}
        </div>
        
        <div style={groundStyle}></div>
        <div style={grassStyle}></div>
        <div style={textureStyle}></div>
        
        <div style={scoreStyle}>Score: {score}</div>
        
        {gameOver && (
          <div style={gameOverStyle}>
            <h2 style={{fontSize: '28px', margin: '0 0 10px'}}>Game Over!</h2>
            <p>Score: {score}</p>
            <p>High Score: {highScore}</p>
            <button style={buttonStyle} onClick={startGame}>
              Play Again
            </button>
          </div>
        )}
        
        {!isPlaying && !gameOver && (
          <div style={startScreenStyle}>
            <h2 style={{fontSize: '28px', margin: '0 0 10px'}}>Runner Game</h2>
            <p>Press Space or Arrow Up to jump</p>
            <p>Press Arrow Down to duck under birds</p>
            <p>Avoid obstacles to score points</p>
            <button style={buttonStyle} onClick={startGame}>
              Start Game
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 text-center text-gray-700">
        <p>Press Space or Arrow Up to jump. Press Arrow Down to duck under birds. Press Ctrl+D to toggle debug mode.</p>
      </div>
    </div>
  );
};

export default RunnerGame;