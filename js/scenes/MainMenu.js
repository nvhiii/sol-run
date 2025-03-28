class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Load the sprite sheet
        this.load.spritesheet('characters', '../../assets/sprites/characters.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        // Debug: Log when the sprite sheet loads
        this.load.on('filecomplete-spritesheet-characters', () => {
            console.log('Characters sprite sheet loaded successfully!');
        });

        // Debug: Log if the sprite sheet fails to load
        this.load.on('loaderror', (file) => {
            console.error('Failed to load file:', file.key);
        });
    }

    create() {
        // Get the center of the viewport
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Add a title
        this.add.text(centerX, centerY - 200, 'Select Your Character', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Character 1 (Row 1, Col 2, frame 1)
        const char1Sprite = this.add.sprite(centerX - 200, centerY, 'characters', 1);
        char1Sprite.setScale(3);
        char1Sprite.setInteractive();
        char1Sprite.on('pointerdown', () => this.selectCharacter(0));
        this.add.text(centerX - 200, centerY + 50, 'Character 1', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Character 2 (Row 1, Col 5, frame 4)
        const char2Sprite = this.add.sprite(centerX, centerY, 'characters', 4);
        char2Sprite.setScale(3);
        char2Sprite.setInteractive();
        char2Sprite.on('pointerdown', () => this.selectCharacter(1));
        this.add.text(centerX, centerY + 50, 'Character 2', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Character 3 (Row 1, Col 8, frame 7)
        const char3Sprite = this.add.sprite(centerX + 200, centerY, 'characters', 7);
        char3Sprite.setScale(3);
        char3Sprite.setInteractive();
        char3Sprite.on('pointerdown', () => this.selectCharacter(2));
        this.add.text(centerX + 200, centerY + 50, 'Character 3', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Start Game button (initially hidden)
        this.startButton = this.add.text(centerX, centerY + 150, 'Start Game', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000'
        }).setOrigin(0.5).setPadding(10);
        this.startButton.setVisible(false);
        this.startButton.setInteractive();
        this.startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }

    selectCharacter(index) {
        // Store the selected character index in the game registry
        this.registry.set('selectedCharacter', index);
        console.log('Selected character index:', index);

        // Show the Start Game button
        this.startButton.setVisible(true);
    }

    update() {}
}

export default MainMenu;