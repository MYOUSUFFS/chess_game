# Chess Game

A web-based chess game with local multiplayer support and advanced features like undo/redo functionality, move history, and a responsive design.

## Live Demo

Play the game online: [https://myousuffs.github.io/chess_game/](https://myousuffs.github.io/chess_game/)

## Features

- **Local Multiplayer**: Play against another player on the same device
- **Standard Chess Rules**: Complete implementation of chess rules including special moves
- **Undo/Redo System**: Unlimited undo/redo with timer display
- **Move History**: Track and display all moves with algebraic notation
- **Responsive Design**: Mobile-friendly interface with touch support
- **Player Indicators**: Visual display of current player and game status
- **Captured Pieces**: Display captured pieces for both players
- **Custom Piece Sets**: Includes various chess piece designs and fantasy pieces

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/myousuffs/chess_game.git
   ```

2. Navigate to the project directory:
   ```bash
   cd chess_game
   ```

3. Open `index.html` in your web browser or serve it using a local web server:
   ```bash
   # Using Python's built-in server
   python -m http.server 8000
   
   # Or using Node.js http-server
   npx http-server
   ```

## How to Play

1. Open the game in your web browser
2. White player moves first
3. Click on a piece to select it, then click on a valid destination square
4. Use the undo/redo buttons to review moves
5. View move history in the sidebar or popup (on mobile)
6. Click "Reset Game" to start a new game

## File Structure

```
chess_game/
├── index.html          # Main game interface
├── script.js           # Game logic and interactions
├── style.css           # Styling and responsive design
├── docs/
│   └── LawsOfChess.pdf     # Chess Law
│   └── plan.md             # Development roadmap
│── assets/
|     images/
│     └── pieces-svg/   # Chess piece SVG files & All
└── readme.md           # Project documentation
```

## Future Plans

- Online multiplayer support with WebSocket server
- AI opponent with difficulty levels
- Game analysis and review features
- Tournament mode
- Enhanced mobile experience

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.