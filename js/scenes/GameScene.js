class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Load the sprite sheet
        this.load.spritesheet('player', '../../assets/sprites/Tiny16-ExpandedMaleSprites.png', {
            frameWidth: 16,  // Each sprite is 16 pixels wide
            frameHeight: 16  // Each sprite is 16 pixels tall
        });

        // Debug: Log when the sprite sheet starts loading
        this.load.on('filecomplete-spritesheet-player', () => {
            console.log('Player sprite sheet loaded successfully!');
        });

        // Debug: Log if the sprite sheet fails to load
        this.load.on('loaderror', (file) => {
            console.error('Failed to load file:', file.key);
        });
    }

    create() {
        // Add a colored background to confirm the scene is rendering
        this.cameras.main.setBackgroundColor('#0000ff'); // Bright blue background

        // Add the player to the scene at position (400, 300) - center of the screen
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true); // Prevent player from moving out of the game bounds

        // Scale the player sprite to make it more visible (3x larger)
        this.player.setScale(3);

        // Debug: Log when the player is created
        console.log('Player created at position:', this.player.x, this.player.y);

        // Create animations for each direction (6 frames per direction)
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }), // Row 1: frames 0-5
            frameRate: 10,
            repeat: -1 // Loop indefinitely
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }), // Row 2: frames 6-11
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 17 }), // Row 3: frames 12-17
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }), // Row 4: frames 18-23
            frameRate: 10,
            repeat: -1
        });

        // Set up keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Player movement
        const speed = 160; // Player movement speed

        // Reset velocity
        this.player.setVelocity(0);

        // Handle movement and animations
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
        }
        else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play('up', true);
        }
        else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play('down', true);
        }
        else {
            // Stop animation when no keys are pressed
            this.player.anims.stop();
        }
    }
}

export default GameScene;