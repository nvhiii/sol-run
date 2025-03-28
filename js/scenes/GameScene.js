class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Load the tile sheet
        this.load.image('basictiles', '../../assets/maps/tiles/basictiles.png');

        // Load the tilemap
        this.load.tilemapTiledJSON('map', '../../assets/maps/map.json');

        // Debug: Log when assets load
        this.load.on('filecomplete', (key) => {
            console.log(`Loaded ${key}`);
        });

        // Debug: Log if assets fail to load
        this.load.on('loaderror', (file) => {
            console.error('Failed to load file:', file.key);
        });
    }

    create() {
        // Load the tilemap
        const map = this.make.tilemap({ key: 'map' });

        // Add the tileset to the map
        const tileset = map.addTilesetImage('Basic Tiles', 'basictiles', 16, 16);

        // Create the layers
        const backgroundLayer = map.createLayer('Background', tileset, 0, 0);
        const groundLayer = map.createLayer('Ground', tileset, 0, 0);
        const decorationsLayer = map.createLayer('Decorations', tileset, 0, 0);
        const platformsLayer = map.createLayer('Platforms', tileset, 0, 0);

        // Enable camera scrolling to view the entire map
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow({ x: map.widthInPixels / 2, y: map.heightInPixels / 2 }, false);

        // Add camera controls for manual scrolling
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Camera scrolling with arrow keys
        const cameraSpeed = 200;
        if (this.cursors.left.isDown) {
            this.cameras.main.scrollX -= cameraSpeed * (this.game.loop.delta / 1000);
        }
        if (this.cameras.main.scrollX < 0) {
            this.cameras.main.scrollX = 0;
        }
        if (this.cursors.right.isDown) {
            this.cameras.main.scrollX += cameraSpeed * (this.game.loop.delta / 1000);
        }
        if (this.cameras.main.scrollX > this.cameras.main.worldView.width - this.cameras.main.width) {
            this.cameras.main.scrollX = this.cameras.main.worldView.width - this.cameras.main.width;
        }
        if (this.cursors.up.isDown) {
            this.cameras.main.scrollY -= cameraSpeed * (this.game.loop.delta / 1000);
        }
        if (this.cameras.main.scrollY < 0) {
            this.cameras.main.scrollY = 0;
        }
        if (this.cameras.main.scrollY > this.cameras.main.worldView.height - this.cameras.main.height) {
            this.cameras.main.scrollY = this.cameras.main.worldView.height - this.cameras.main.height;
        }
        if (this.cursors.down.isDown) {
            this.cameras.main.scrollY += cameraSpeed * (this.game.loop.delta / 1000);
        }
    }
}

export default GameScene;