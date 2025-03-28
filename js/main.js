import MainMenu from './scenes/MainMenu.js';
import GameScene from './scenes/GameScene.js';
import GameOver from './scenes/GameOver.js';
import { config } from './config.js';

// Debug: Log the config object to confirm the import
console.log('Imported config:', config);

// Set the scenes in the config
config.scene = [MainMenu, GameScene, GameOver];

// Start the game with MainMenu
const game = new Phaser.Game(config);

// Debug: Log when the game starts
console.log('Phaser game initialized, starting MainMenu...');
game.scene.start('MainMenu');