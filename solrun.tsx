import React, { useState, useEffect, useRef } from 'react';

const InfiniteRunner = () => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(5);
  
  // Player state
  const [playerY, setPlayerY] = useState(300);
  const [isJumping, setIsJumping] = useState(false);
  const [isDiving, setIsDiving] = useState(false);
  const [playerHeight, setPlayerHeight] = useState(50);
  
  // Game elements - initialized with empty arrays
  const [obstacles, setObstacles] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [scenery, setScenery] = useState([]);
  
  // Animation frame reference
  const requestRef = useRef();
  const lastTimeRef = useRef(0);
  const obstacleTimerRef = useRef(0);
  
  // Game canvas dimensions
  const gameWidth = 800;
  const gameHeight = 500;
  const playerWidth = 30;
  
  // Game mechanics constants
  const gravity = 0.6;
  const jumpForce = -15;
  const diveForce = 15;
  const maxJumpHeight = 150;
  
  // Player physics
  const [playerVelocityY, setPlayerVelocityY] = useState(0);
  
  // Initialize with base platforms
  useEffect(() => {
    // Create initial ground
    setPlatforms([
      { x: 0, y: 350, width: 1200, height: 50, type: 'ground' },
      { x: 1200, y: 350, width: 1000, height: 50, type: 'ground' }
    ]);
    
    // Add some initial obstacles
    setObstacles([
      { x: 500, y: 300, width: 40, height: 50, type: 'block' },
      { x: 800, y: 300, width: 40, height: 50, type: 'pipe' },
      { x: 1100, y: 300, width: 40, height: 50, type: 'block' }
    ]);
    
    // Add some initial scenery
    setScenery([
      { x: 200, y: 250, width: 150, height: 100, type: 'bgHill' },
      { x: 700, y: 80, width: 80, height: 40, type: 'cloud' }
    ]);
  }, []);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && !gameOver) {
        setGameStarted(true);
        return;
      }
      
      if (gameOver) {
        if (e.key === 'Enter') {
          resetGame();
        }
        return;
      }
      
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
        if (!isJumping && !isDiving) {
          setIsJumping(true);
          setPlayerVelocityY(jumpForce);
        }
      }
      
      if (e.key === 'ArrowDown' || e.key === 's') {
        if (!isDiving && !isOnGround()) {
          setIsDiving(true);
          setPlayerVelocityY(diveForce);
          setPlayerHeight(25); // Player crouches when diving
        } else if (isOnGround()) {
          setPlayerHeight(25); // Player crouches on ground
        }
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown' || e.key === 's') {
        setPlayerHeight(50); // Player stands up when key is released
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, isJumping, isDiving]);
  
  // Check if player is on ground
  const isOnGround = () => {
    const playerBottom = playerY + playerHeight;
    
    for (const platform of platforms) {
      if (platform && playerBottom >= platform.y && 
          playerY + playerHeight <= platform.y + 10 && 
          50 + playerWidth >= platform.x && 
          50 <= platform.x + platform.width) {
        return true;
      }
    }
    
    return false;
  };
  
  // Generate random obstacles and terrain
  const generateObstacle = () => {
    const types = ['block', 'hole', 'platform', 'pipe', 'spinyBlock', 'tunnel', 'hill'];
    // Weight the types to make the game more interesting but not too difficult
    let type;
    const rand = Math.random();
    if (rand < 0.25) {
      type = 'block';
    } else if (rand < 0.35) {
      type = 'hole';
    } else if (rand < 0.55) {
      type = 'platform';
    } else if (rand < 0.7) {
      type = 'pipe';
    } else if (rand < 0.8) {
      type = 'spinyBlock';
    } else if (rand < 0.9) {
      type = 'tunnel';
    } else {
      type = 'hill';
    }
    
    if (type === 'block') {
      // Standard blocks to jump over
      return {
        x: gameWidth,
        y: 300,
        width: 30 + Math.random() * 30,
        height: 50,
        type: 'block'
      };
    } else if (type === 'hole') {
      // Gaps in the ground to jump across
      return {
        x: gameWidth,
        y: 350,
        width: 60 + Math.random() * 60,
        height: 50,
        type: 'hole'
      };
    } else if (type === 'platform') {
      // Elevated platforms to jump onto
      const platformY = 200 + Math.random() * 100;
      return {
        x: gameWidth,
        y: platformY,
        width: 100 + Math.random() * 100,
        height: 20,
        type: 'platform'
      };
    } else if (type === 'pipe') {
      // Mario-style pipes - can be jumped over
      return {
        x: gameWidth,
        y: 300,
        width: 40,
        height: 50,
        type: 'pipe'
      };
    } else if (type === 'spinyBlock') {
      // Blocks with spikes - must be avoided completely
      return {
        x: gameWidth,
        y: 300,
        width: 40,
        height: 50,
        type: 'spinyBlock',
        deadly: true
      };
    } else if (type === 'tunnel') {
      // Tunnels - can go over or through by crouching
      return {
        x: gameWidth,
        y: 280,
        width: 100,
        height: 70,
        type: 'tunnel',
        hasGap: true
      };
    } else if (type === 'hill') {
      // Hills - can either go over or through
      const height = 80 + Math.random() * 40;
      return {
        x: gameWidth,
        y: 350 - height,
        width: 150 + Math.random() * 50,
        height: height,
        type: 'hill',
        hasGap: Math.random() > 0.5 // 50% chance the hill has a tunnel
      };
    }
    
    // Default fallback
    return {
      x: gameWidth,
      y: 300,
      width: 40,
      height: 50,
      type: 'block'
    };
  };
  
  // Generate decorative scenery
  const generateScenery = () => {
    const types = ['hill', 'smallHill', 'cloud', 'bushes', 'castle'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (type === 'hill') {
      // Background hills
      const height = 50 + Math.random() * 80;
      return {
        x: gameWidth,
        y: 350 - height,
        width: 200 + Math.random() * 150,
        height: height,
        type: 'bgHill'
      };
    } else if (type === 'smallHill') {
      // Small hills
      const height = 30 + Math.random() * 40;
      return {
        x: gameWidth,
        y: 350 - height,
        width: 100 + Math.random() * 50,
        height: height,
        type: 'bgSmallHill'
      };
    } else if (type === 'cloud') {
      // Clouds
      return {
        x: gameWidth,
        y: 50 + Math.random() * 100,
        width: 60 + Math.random() * 40,
        height: 30 + Math.random() * 20,
        type: 'cloud'
      };
    } else if (type === 'bushes') {
      // Bushes
      return {
        x: gameWidth,
        y: 320,
        width: 80 + Math.random() * 40,
        height: 30,
        type: 'bushes'
      };
    } else if (type === 'castle') {
      // Castle (rare)
      return {
        x: gameWidth,
        y: 200,
        width: 120,
        height: 150,
        type: 'castle'
      };
    }
    
    // Default fallback
    return {
      x: gameWidth,
      y: 100,
      width: 60,
      height: 30,
      type: 'cloud'
    };
  };
  
  // Ensure there's always ground ahead by adding new segments
  const ensureGroundAhead = () => {
    if (!platforms || platforms.length === 0) return;
    
    // Filter valid ground platforms
    const groundPlatforms = platforms.filter(p => p && p.type === 'ground');
    if (groundPlatforms.length === 0) {
      // If no ground exists, add a basic segment
      setPlatforms(prev => [...prev, {
        x: 0,
        y: 350,
        width: 1200,
        height: 50,
        type: 'ground'
      }]);
      return;
    }
    
    // Find the furthest ground platform
    let furthestX = 0;
    let furthestWidth = 0;
    
    for (const platform of groundPlatforms) {
      if (platform.x + platform.width > furthestX + furthestWidth) {
        furthestX = platform.x;
        furthestWidth = platform.width;
      }
    }
    
    // Calculate where ground ends
    const groundEnd = furthestX + furthestWidth;
    
    // If we don't have enough ground ahead, add more
    if (groundEnd < gameWidth + 1200) {
      setPlatforms(prevPlatforms => [
        ...prevPlatforms,
        {
          x: groundEnd,
          y: 350,
          width: 800 + Math.random() * 400, // Make ground segments much longer
          height: 50,
          type: 'ground'
        }
      ]);
    }
  };
  
  // Game update loop
  const gameLoop = (time) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }
    
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    if (gameStarted && !gameOver) {
      // Update score
      setScore(prevScore => prevScore + deltaTime * 0.01);
      
      // Increase speed gradually
      if (score > 0 && score % 500 < 10) {
        setSpeed(prevSpeed => Math.min(prevSpeed + 0.1, 15));
      }
      
      // Update player position with gravity
      setPlayerVelocityY(prevVelocity => {
        const newVelocity = prevVelocity + gravity;
        return newVelocity;
      });
      
      setPlayerY(prevY => {
        let newY = prevY + playerVelocityY;
        
        // Check collision with platforms
        let onPlatform = false;
        
        if (platforms && platforms.length > 0) {
          for (const platform of platforms) {
            if (platform && platform.type !== 'hole') {
              const playerBottom = prevY + playerHeight;
              const newPlayerBottom = newY + playerHeight;
              
              // Check if landing on platform
              if (playerBottom <= platform.y && newPlayerBottom >= platform.y &&
                  50 + playerWidth >= platform.x && 50 <= platform.x + platform.width) {
                newY = platform.y - playerHeight;
                setPlayerVelocityY(0);
                setIsJumping(false);
                setIsDiving(false);
                onPlatform = true;
                break;
              }
            }
          }
        }
        
        // Check for ceiling collision
        if (newY < 0) {
          newY = 0;
          setPlayerVelocityY(0);
        }
        
        // Check if player falls out of bounds
        if (newY > gameHeight) {
          setGameOver(true);
        }
        
        // Check if jump is complete
        if (isJumping && playerVelocityY >= 0) {
          setIsJumping(false);
        }
        
        // Check if dive is complete
        if (isDiving && onPlatform) {
          setIsDiving(false);
        }
        
        return newY;
      });
      
      // Update obstacles
      setObstacles(prevObstacles => {
        if (!prevObstacles) return [];
        
        return prevObstacles
          .map(obstacle => {
            if (!obstacle) return null;
            return {
              ...obstacle,
              x: obstacle.x - speed
            };
          })
          .filter(obstacle => obstacle && obstacle.x + obstacle.width > -100);
      });
      
      // Update platforms
      setPlatforms(prevPlatforms => {
        if (!prevPlatforms) return [];
        
        return prevPlatforms
          .map(platform => {
            if (!platform) return null;
            return {
              ...platform,
              x: platform.x - speed
            };
          })
          .filter(platform => platform && platform.x + platform.width > -200);
      });
      
      // Update scenery with parallax effect
      setScenery(prevScenery => {
        if (!prevScenery) return [];
        
        return prevScenery
          .map(item => {
            if (!item) return null;
            const parallaxSpeed = item.type === 'cloud' ? 0.5 : 0.8;
            return {
              ...item,
              x: item.x - (speed * parallaxSpeed)
            };
          })
          .filter(item => item && item.x + item.width > -100);
      });
      
      // Add new obstacles periodically
      obstacleTimerRef.current += deltaTime;
      
      // Periodically check and ensure there's ground ahead
      if (obstacleTimerRef.current > 500) {
        ensureGroundAhead();
      }
      
      // Add new obstacles
      if (obstacleTimerRef.current > 1500) {
        obstacleTimerRef.current = 0;
        
        // Add a random obstacle
        const newObstacle = generateObstacle();
        if (newObstacle) {
          setObstacles(prevObstacles => [...prevObstacles, newObstacle]);
          
          // Special handling for platforms and holes
          if (newObstacle.type === 'platform') {
            setPlatforms(prevPlatforms => [...prevPlatforms, newObstacle]);
          }
        }
        
        // Add random scenery elements with 30% chance
        if (Math.random() < 0.3) {
          const newScenery = generateScenery();
          if (newScenery) {
            setScenery(prevScenery => [...prevScenery, newScenery]);
          }
        }
      }
      
      // Collision detection with advanced logic for different obstacle types
      if (obstacles && obstacles.length > 0) {
        for (const obstacle of obstacles) {
          if (!obstacle) continue;
          
          // Check if player is within the x-bounds of the obstacle
          const playerRight = 50 + playerWidth;
          const playerBottom = playerY + playerHeight;
          const obstacleRight = obstacle.x + obstacle.width;
          
          const horizontalOverlap = playerRight > obstacle.x && 50 < obstacleRight;
          
          if (horizontalOverlap) {
            if (obstacle.type === 'block' || obstacle.type === 'pipe' || obstacle.type === 'spinyBlock') {
              // Standard collision with blocks and pipes
              if (playerY < obstacle.y + obstacle.height &&
                  playerBottom > obstacle.y) {
                setGameOver(true);
                break;
              }
            } else if (obstacle.type === 'tunnel' && obstacle.hasGap) {
              // For tunnels, player can go through if crouching (small enough)
              if (playerHeight > 25 && // Not crouching
                  playerY < obstacle.y + obstacle.height &&
                  playerBottom > obstacle.y) {
                setGameOver(true);
                break;
              }
            } else if (obstacle.type === 'hill') {
              // For hills, check if going over or through
              if (obstacle.hasGap) {
                // Hills with gaps - can go through if crouching
                const gapTop = obstacle.y + obstacle.height - 25; // Gap is at the bottom
                
                // Check if the player is in the gap area
                const inGapX = playerRight > obstacle.x + 20 && 50 < obstacleRight - 20;
                const inGapY = playerBottom > gapTop && playerY < obstacle.y + obstacle.height;
                
                if (inGapX && inGapY) {
                  // In the gap, can pass if crouching
                  if (playerHeight > 25) { // Not crouching
                    setGameOver(true);
                    break;
                  }
                } else if (playerY < obstacle.y + obstacle.height &&
                           playerBottom > obstacle.y) {
                  // Not in the gap but colliding with the hill
                  setGameOver(true);
                  break;
                }
              } else {
                // Hills without gaps - must jump over
                if (playerY < obstacle.y + obstacle.height &&
                    playerBottom > obstacle.y) {
                  setGameOver(true);
                  break;
                }
              }
            }
          }
          
          // Check for falling into holes
          if (obstacle.type === 'hole' && horizontalOverlap && isOnGround()) {
            let onHole = true;
            
            // Check if player is on a platform above the hole
            if (platforms && platforms.length > 0) {
              for (const platform of platforms) {
                if (platform && platform.type !== 'hole' && 
                    playerRight > platform.x && 
                    50 < platform.x + platform.width &&
                    playerBottom <= platform.y + 10 &&
                    playerBottom >= platform.y) {
                  onHole = false;
                  break;
                }
              }
            }
            
            if (onHole) {
              setPlayerY(prevY => prevY + 5); // Start falling
            }
          }
        }
      }
    }
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Start/stop the game loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameStarted, gameOver, score, playerY, playerVelocityY, isJumping, isDiving, obstacles, platforms, speed]);
  
  // Reset the game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setSpeed(5);
    setPlayerY(300);
    setPlayerVelocityY(0);
    setIsJumping(false);
    setIsDiving(false);
    setPlayerHeight(50);
    
    // Clear all game elements
    setObstacles([]);
    setPlatforms([]);
    setScenery([]);
    
    // Re-initialize with base elements
    setTimeout(() => {
      setPlatforms([
        { x: 0, y: 350, width: 1200, height: 50, type: 'ground' },
        { x: 1200, y: 350, width: 1000, height: 50, type: 'ground' }
      ]);
      
      // Add some initial obstacles
      setObstacles([
        { x: 500, y: 300, width: 40, height: 50, type: 'block' },
        { x: 800, y: 300, width: 40, height: 50, type: 'pipe' },
        { x: 1100, y: 300, width: 40, height: 50, type: 'block' }
      ]);
      
      // Add some initial scenery
      setScenery([
        { x: 200, y: 250, width: 150, height: 100, type: 'bgHill' },
        { x: 700, y: 80, width: 80, height: 40, type: 'cloud' }
      ]);
    }, 100);
    
    lastTimeRef.current = 0;
    obstacleTimerRef.current = 0;
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="relative w-full max-w-4xl overflow-hidden bg-blue-100 border-4 border-blue-800 rounded-lg shadow-lg" style={{ width: gameWidth, height: gameHeight }}>
        {/* Sky background */}
        <div className="absolute inset-0 bg-blue-300"></div>
        
        {/* Background scenery */}
        {scenery && scenery.map((item, index) => {
          if (!item) return null;
          
          const styleClass = item.type === 'bgHill' ? 'bg-green-600 rounded-t-full' :
            item.type === 'bgSmallHill' ? 'bg-green-700 rounded-t-full' :
            item.type === 'cloud' ? 'bg-white rounded-full' :
            item.type === 'bushes' ? 'bg-green-500 rounded-t-full' :
            item.type === 'castle' ? 'bg-yellow-700' :
            'bg-transparent';
            
          return (
            <div
              key={`scenery-${index}`}
              className={`absolute ${styleClass}`}
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                zIndex: 1
              }}
            >
              {item.type === 'castle' && (
                <>
                  <div className="absolute w-1/3 h-1/4 bg-yellow-800 top-0 left-1/3 rounded-t-lg"></div>
                  <div className="absolute w-1/5 h-2/5 bg-yellow-900 bottom-0 left-2/5"></div>
                </>
              )}
            </div>
          );
        })}
        
        {/* Platforms */}
        {platforms && platforms.map((platform, index) => {
          if (!platform) return null;
          
          const styleClass = platform.type === 'hole' ? 'bg-transparent' : 
            platform.type === 'platform' ? 'bg-yellow-600' : 
            'bg-green-800';
            
          return (
            <div
              key={`platform-${index}`}
              className={`absolute ${styleClass}`}
              style={{
                left: platform.x,
                top: platform.y,
                width: platform.width,
                height: platform.height,
                zIndex: 2
              }}
            ></div>
          );
        })}
        
        {/* Obstacles */}
        {obstacles && obstacles.map((obstacle, index) => {
          if (!obstacle) return null;
          
          let className = "absolute ";
          let innerContent = null;
          
          switch(obstacle.type) {
            case 'block':
              className += "bg-red-600";
              break;
            case 'pipe':
              className += "bg-green-500";
              break;
            case 'spinyBlock':
              className += "bg-red-700";
              innerContent = (
                <div className="w-full h-1/3 absolute top-0 flex justify-around">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-white"></div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-white"></div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-white"></div>
                </div>
              );
              break;
            case 'tunnel':
              className += "bg-gray-700 rounded-t-lg";
              break;
            case 'hill':
              className += "bg-green-700 rounded-t-full";
              if (obstacle.hasGap) {
                innerContent = (
                  <div 
                    className="absolute bg-black rounded-t-lg"
                    style={{
                      bottom: 0,
                      left: '20px',
                      width: `calc(100% - 40px)`,
                      height: '25px'
                    }}
                  ></div>
                );
              }
              break;
            default:
              className += "bg-transparent";
          }
          
          return (
            <div
              key={`obstacle-${index}`}
              className={className}
              style={{
                left: obstacle.x,
                top: obstacle.y,
                width: obstacle.width,
                height: obstacle.height,
                zIndex: 3
              }}
            >
              {innerContent}
            </div>
          );
        })}
        
        {/* Player */}
        <div
          className="absolute bg-red-500 rounded-md"
          style={{
            left: 50,
            top: playerY,
            width: playerWidth,
            height: playerHeight,
            transition: 'height 0.1s',
            zIndex: 10
          }}
        >
          {/* Player cap */}
          <div className="absolute w-full h-1/4 bg-red-600 rounded-t-md top-0"></div>
          
          {/* Player overalls */}
          <div className="absolute w-full h-1/2 bg-blue-600 bottom-0 rounded-b-md">
            <div className="absolute w-1/3 h-1/2 bg-blue-700 bottom-0 left-1/3"></div>
          </div>
        </div>
        
        {/* Game overlay */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
            <h2 className="text-4xl font-bold mb-4">Infinite Runner</h2>
            <p className="text-xl mb-8">Press any key to start</p>
            <div className="bg-white text-black p-4 rounded-lg">
              <p className="font-bold mb-2">Controls:</p>
              <p>Jump: ↑ or Space or W</p>
              <p>Dive/Crouch: ↓ or S</p>
              <div className="mt-4 text-sm">
                <p className="font-bold">Challenge Tips:</p>
                <ul className="list-disc pl-5">
                  <li>Jump over blocks and pipes</li>
                  <li>Crouch to go through tunnels</li>
                  <li>Hills may have secret passages - try crouching!</li>
                  <li>Avoid spiky blocks completely</li>
                  <li>The game gets faster as your score increases</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
            <h2 className="text-4xl font-bold mb-4">Game Over</h2>
            <p className="text-2xl mb-6">Score: {Math.floor(score)}</p>
            <button
              className="px-6 py-3 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-700"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
        
        {/* Score display */}
        {gameStarted && !gameOver && (
          <div className="absolute top-4 right-4 px-4 py-2 bg-white rounded-lg font-bold">
            Score: {Math.floor(score)}
          </div>
        )}
        
        {/* Controls reminder */}
        {gameStarted && !gameOver && (
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-white bg-opacity-70 rounded text-sm">
            ↑: Jump | ↓: Dive
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteRunner;