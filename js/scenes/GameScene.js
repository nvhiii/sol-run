class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.map = null;
        this.player = null;
        this.playerSpeed = 100;
        this.lastDirection = 'down';
    }

    preload() {
        // Load the tile sheet
        this.load.image('basictiles', 'assets/maps/tiles/basictiles.png');

        // Load the tilemap
        this.load.tilemapTiledJSON('map', 'assets/maps/map.json');
        
        // Load character sprites
        this.load.spritesheet('characters', 'assets/sprites/characters.png', {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        // Load the tilemap
        const map = this.make.tilemap({ key: 'map' });

        // Add the tileset to the map
        const tileset = map.addTilesetImage('Basic Tiles', 'basictiles');

        // Create all layers - order matters for rendering
        const backgroundLayer = map.createLayer('background', tileset);
        const terrainLayer = map.createLayer('terrain', tileset);
        const buildingsLayer = map.createLayer('buildings', tileset);
        const decorationsLayer = map.createLayer('decorations', tileset);
        const objectsLayer = map.createLayer('objects', tileset);
        const pathsLayer = map.createLayer('paths', tileset);

        // Set collisions for terrain, buildings, and objects
        terrainLayer.setCollisionByExclusion([-1, 8, 12]); // Non-collidable: empty, grass, dirt
        buildingsLayer.setCollisionByExclusion([-1]);       // Only empty tiles are non-collidable
        objectsLayer.setCollisionByExclusion([-1]);         // Only empty tiles are non-collidable

        // Create player character - starting with frame 0 (facing down)
        this.player = this.physics.add.sprite(200, 100, 'characters', 0);
        this.player.setScale(1.5);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        
        // Add collision between player and collidable layers
        this.physics.add.collider(this.player, terrainLayer);
        this.physics.add.collider(this.player, buildingsLayer);
        this.physics.add.collider(this.player, objectsLayer);

        // Create animations for the player
        this.createPlayerAnimations();

        // Set up camera to follow the player
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2);
        
        // Add keyboard input for player movement
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    createPlayerAnimations() {
        // For a 12-column sprite sheet:
        // Row 1: frames 0-11
        // Row 2: frames 12-23
        // Row 3: frames 24-35
        // Row 4: frames 36-47
        
        // Down animation - Row 1, Columns 1-3 (frames 0, 1, 2)
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('characters', {
                frames: [0, 1, 2]
            }),
            frameRate: 8,
            repeat: -1
        });
        
        // Left animation - Row 2, Columns 1-3 (frames 12, 13, 14)
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('characters', {
                frames: [12, 13, 14]
            }),
            frameRate: 8,
            repeat: -1
        });
        
        // Right animation - Row 3, Columns 1-3 (frames 24, 25, 26)
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('characters', {
                frames: [24, 25, 26]
            }),
            frameRate: 8,
            repeat: -1
        });
        
        // Up animation - Row 4, Columns 1-3 (frames 36, 37, 38)
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('characters', {
                frames: [36, 37, 38]
            }),
            frameRate: 8,
            repeat: -1
        });
    }

    update() {
        if (!this.player) return;
        
        // Reset player velocity
        this.player.setVelocity(0);
        
        // Handle movement and animation for one direction at a time
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
            this.player.anims.play('walk-left', true);
            this.lastDirection = 'left';
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.playerSpeed);
            this.player.anims.play('walk-right', true);
            this.lastDirection = 'right';
        }
        else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-this.playerSpeed);
            this.player.anims.play('walk-up', true);
            this.lastDirection = 'up';
        }
        else if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.playerSpeed);
            this.player.anims.play('walk-down', true);
            this.lastDirection = 'down';
        }
        else {
            // When no keys are pressed, stop animation and show static frame
            this.player.anims.stop();
            
            // Set static frame based on last direction
            switch (this.lastDirection) {
                case 'down':
                    this.player.setFrame(0);
                    break;
                case 'left':
                    this.player.setFrame(12);
                    break;
                case 'right':
                    this.player.setFrame(24);
                    break;
                case 'up':
                    this.player.setFrame(36);
                    break;
            }
        }
    }
}

export default GameScene;