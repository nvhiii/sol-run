# Map Component System

This directory contains the tilemaps and reusable components for the game. The system is designed to allow for easily creating new maps by reusing components.

## Tile Index Reference

Based on the Basic Tiles tileset (basictiles.png):

### Island Tiles (Rows 4-6)
- Top left corner: 25
- Top edge: 26
- Top right corner: 27
- Left edge: 33
- Island interior: 93 (grass)
- Right edge: 35
- Bottom left corner: 41
- Bottom edge: 42
- Bottom right corner: 43

### Decoration Tiles
- Tree: 39/47
- Chest (closed): 36
- Chest (open): 35
- Torch: 81
- House: 45
- Door: 53/57
- Flower: 37
- Sign: 84
- Statue: 48
- Rocks: 46

### Path/Bridge Tiles
- Wooden path (horizontal): 87
- Wooden path (vertical): 86
- Stone path (horizontal): 82
- Stone path (vertical): 83

## Components

The components are stored as JSON files and can be easily integrated into maps:

- `island.json` - Basic island platform
- `house.json` - Small house with door
- `trees.json` - Group of trees
- `dungeon.json` - Dungeon room with entrance
- `bridge.json` - Bridge crossing water
- `chest.json` - Treasure chest

## Map Structure

The main map is organized into layers:
1. Background - Water/sky
2. Ground - Main terrain
3. Decorations - Trees, plants, etc.
4. Platforms - Solid objects with collision
5. Objects - Interactive items

## Adding New Components

To create a new component:
1. Design your component using the tile indices
2. Save as a JSON file in the components directory
3. Reference in your map creation code