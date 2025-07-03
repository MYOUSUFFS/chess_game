document.addEventListener("DOMContentLoaded", () => {
  const chessboard = document.getElementById("chessboard");
  const movesHistory = document.getElementById("moves-history");
  const capturedPieces = document.getElementById("captured-pieces");
  const resetButton = document.getElementById("reset-button");
  const turnDisplay = document.getElementById("turn-display");

  class ChessGame {
    constructor(chessboard, movesHistory, capturedPieces) {
      this.chessboard = chessboard;
      this.movesHistory = movesHistory;
      this.capturedPieces = capturedPieces;
      this.initialBoard = [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"],
      ];
      this.board = JSON.parse(JSON.stringify(this.initialBoard));
      this.pieceImage = {
        r: "pieces-svg/rook-b.svg",
        n: "pieces-svg/knight-b.svg",
        b: "pieces-svg/bishop-b.svg",
        q: "pieces-svg/queen-b.svg",
        k: "pieces-svg/king-b.svg",
        p: "pieces-svg/pawn-b.svg",
        R: "pieces-svg/rook-w.svg",
        N: "pieces-svg/knight-w.svg",
        B: "pieces-svg/bishop-w.svg",
        Q: "pieces-svg/queen-w.svg",
        K: "pieces-svg/king-w.svg",
        P: "pieces-svg/pawn-w.svg",
      };
      this.draggedPiece = null;
      this.startSquare = null;
      this.currentPlayer = "white"; // 'white' or 'black'
      this.hasWhiteKingMoved = false;
      this.hasBlackKingMoved = false;
      this.hasWhiteRookLeftMoved = false;
      this.hasWhiteRookRightMoved = false;
      this.hasBlackRookLeftMoved = false;
      this.hasBlackRookRightMoved = false;
      this.enPassantTargetSquare = null;
      this.fiftyMoveRuleCounter = 0;
      this.boardHistory = [];
      this.selectedPiece = null;
      this.selectedSquare = null;

      this.createBoard();
      this.addDragListeners();
      this.setupResetButton();
      this.updateTurnDisplay();
    }

    updateTurnDisplay() {
      turnDisplay.textContent = `${
        this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)
      }'s Turn`;
    }

    createBoard() {
      this.chessboard.innerHTML = "";
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const square = document.createElement("div");
          square.classList.add("square");
          square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
          square.dataset.row = row;
          square.dataset.col = col;

          const piece = this.board[row][col];
          if (piece) {
            const pieceElement = document.createElement("img");
            pieceElement.classList.add("piece");
            pieceElement.src = this.pieceImage[piece];
            pieceElement.draggable = true;
            square.appendChild(pieceElement);
          }
          this.chessboard.appendChild(square);
        }
      }
    }

    addDragListeners() {
      document.querySelectorAll(".piece").forEach((piece) => {
        piece.addEventListener("click", (e) => {
          const square = piece.closest(".square");
          const row = parseInt(square.dataset.row);
          const col = parseInt(square.dataset.col);
          const pieceType = this.board[row][col];
          const isWhitePiece = pieceType === pieceType.toUpperCase();

          // Only handle clicks for current player's pieces
          if (
            (this.currentPlayer === "white" && isWhitePiece) ||
            (this.currentPlayer === "black" && !isWhitePiece)
          ) {
            e.stopPropagation();
            this.clearMoveIndicators();
            this.selectedPiece = piece;
            this.selectedSquare = square;
            this.showPossibleMoves(row, col);
          }
          // For opponent pieces, let the event bubble up to the square handler
        });

        piece.addEventListener("dragstart", (e) => {
          this.draggedPiece = piece;
          this.startSquare = piece.closest(".square");
          setTimeout(() => {
            piece.style.display = "none";
          }, 0);
        });

        piece.addEventListener("dragend", () => {
          this.draggedPiece.style.display = "block";
          this.draggedPiece = null;
          this.startSquare = null;
        });
      });

      document.querySelectorAll(".square").forEach((square) => {
        square.addEventListener("click", (e) => {
          if (this.selectedPiece && this.selectedSquare) {
            const startRow = parseInt(this.selectedSquare.dataset.row);
            const startCol = parseInt(this.selectedSquare.dataset.col);
            const endRow = parseInt(square.dataset.row);
            const endCol = parseInt(square.dataset.col);

            if (this.isValidMove(startRow, startCol, endRow, endCol)) {
              this.makeMove(startRow, startCol, endRow, endCol);
              this.clearMoveIndicators();
              this.selectedPiece = null;
              this.selectedSquare = null;
            } else {
              this.clearMoveIndicators();
              this.selectedPiece = null;
              this.selectedSquare = null;
            }
          }
        });

        square.addEventListener("dragover", (e) => {
          e.preventDefault(); // Allow drop
        });

        square.addEventListener("drop", (e) => {
          e.preventDefault();
          if (this.draggedPiece && this.startSquare !== square) {
            const startRow = parseInt(this.startSquare.dataset.row);
            const startCol = parseInt(this.startSquare.dataset.col);
            const endRow = parseInt(square.dataset.row);
            const endCol = parseInt(square.dataset.col);

            const pieceType = this.board[startRow][startCol];
            const isWhitePiece = pieceType === pieceType.toUpperCase();

            if (
              (this.currentPlayer === "white" && isWhitePiece) ||
              (this.currentPlayer === "black" && !isWhitePiece)
            ) {
              if (this.isValidMove(startRow, startCol, endRow, endCol)) {
                this.makeMove(startRow, startCol, endRow, endCol);
              }
            }
          }
        });
      });
    }

    setupResetButton() {
      resetButton.addEventListener("click", () => {
        this.board = JSON.parse(JSON.stringify(this.initialBoard)); // Reset board to initial state
        this.movesHistory.innerHTML = ""; // Clear moves history
        this.capturedPieces.innerHTML = ""; // Clear captured pieces
        this.currentPlayer = "white";
        this.hasWhiteKingMoved = false;
        this.hasBlackKingMoved = false;
        this.hasWhiteRookLeftMoved = false;
        this.hasWhiteRookRightMoved = false;
        this.hasBlackRookLeftMoved = false;
        this.hasBlackRookRightMoved = false;
        this.enPassantTargetSquare = null;
        this.boardHistory = [];
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.clearMoveIndicators();
        this.createBoard(); // Re-render the board
        this.addDragListeners(); // Re-add listeners
      });
    }

    isValidMove(startRow, startCol, endRow, endCol) {
      const piece = this.board[startRow][startCol];
      const targetPiece = this.board[endRow][endCol];

      // Basic validation: cannot move to the same square
      if (startRow === endRow && startCol === endCol) {
        return false;
      }

      // Determine piece color
      const isWhite = piece === piece.toUpperCase();
      const isBlack = piece === piece.toLowerCase();

      // Cannot capture your own piece
      if (targetPiece) {
        const isTargetWhite = targetPiece === targetPiece.toUpperCase();
        const isTargetBlack = targetPiece === targetPiece.toLowerCase();
        if ((isWhite && isTargetWhite) || (isBlack && isTargetBlack)) {
          return false;
        }
      }

      // Simulate the move to check for king safety
      const originalPiece = this.board[endRow][endCol];
      this.board[endRow][endCol] = piece;
      this.board[startRow][startCol] = "";

      const kingInCheckAfterMove = this.isKingInCheck(this.currentPlayer);

      // Revert the move
      this.board[startRow][startCol] = piece;
      this.board[endRow][endCol] = originalPiece;

      if (kingInCheckAfterMove) {
        return false;
      }

      switch (piece.toLowerCase()) {
        case "p":
          return this.isValidPawnMove(
            startRow,
            startCol,
            endRow,
            endCol,
            isWhite
          );
        case "r":
          return this.isValidRookMove(startRow, startCol, endRow, endCol);
        case "n":
          return this.isValidKnightMove(startRow, startCol, endRow, endCol);
        case "b":
          return this.isValidBishopMove(startRow, startCol, endRow, endCol);
        case "q":
          return (
            this.isValidRookMove(startRow, startCol, endRow, endCol) ||
            this.isValidBishopMove(startRow, startCol, endRow, endCol)
          );
        case "k":
          // Check for castling
          if (Math.abs(endCol - startCol) === 2 && startRow === endRow) {
            return this.isValidCastling(
              startRow,
              startCol,
              endRow,
              endCol,
              isWhite
            );
          }
          return this.isValidKingMove(startRow, startCol, endRow, endCol);
        default:
          return false; // Invalid piece type or no move validation implemented
      }
    }

    isValidPawnMove(startRow, startCol, endRow, endCol, isWhite) {
      const rowDiff = endRow - startRow;
      const colDiff = Math.abs(endCol - startCol);

      // White pawn moves (up the board, so row decreases)
      if (isWhite) {
        // Normal one-step move
        if (rowDiff === -1 && colDiff === 0 && !this.board[endRow][endCol]) {
          return true;
        }
        // Two-step move from starting position
        if (
          startRow === 6 &&
          rowDiff === -2 &&
          colDiff === 0 &&
          !this.board[endRow][endCol] &&
          !this.board[startRow - 1][endCol]
        ) {
          return true;
        }
        // Capture move
        if (
          rowDiff === -1 &&
          colDiff === 1 &&
          (this.board[endRow][endCol] ||
            (endRow === this.enPassantTargetSquare?.row &&
              endCol === this.enPassantTargetSquare?.col))
        ) {
          return true;
        }
      }
      // Black pawn moves (down the board, so row increases)
      else {
        // Normal one-step move
        if (rowDiff === 1 && colDiff === 0 && !this.board[endRow][endCol]) {
          return true;
        }
        // Two-step move from starting position
        if (
          startRow === 1 &&
          rowDiff === 2 &&
          colDiff === 0 &&
          !this.board[endRow][endCol] &&
          !this.board[startRow + 1][endCol]
        ) {
          return true;
        }
        // Capture move
        if (
          rowDiff === 1 &&
          colDiff === 1 &&
          (this.board[endRow][endCol] ||
            (endRow === this.enPassantTargetSquare?.row &&
              endCol === this.enPassantTargetSquare?.col))
        ) {
          return true;
        }
      }
      return false;
    }

    isValidRookMove(startRow, startCol, endRow, endCol) {
      const rowDiff = Math.abs(endRow - startRow);
      const colDiff = Math.abs(endCol - startCol);

      // Rook moves horizontally or vertically
      if (rowDiff === 0 && colDiff > 0) {
        // Horizontal move
        const step = endCol > startCol ? 1 : -1;
        for (let col = startCol + step; col !== endCol; col += step) {
          if (this.board[startRow][col] !== "") {
            return false; // Path is blocked
          }
        }
        return true;
      } else if (colDiff === 0 && rowDiff > 0) {
        // Vertical move
        const step = endRow > startRow ? 1 : -1;
        for (let row = startRow + step; row !== endRow; row += step) {
          if (this.board[row][startCol] !== "") {
            return false; // Path is blocked
          }
        }
        return true;
      }
      return false;
    }

    isValidKnightMove(startRow, startCol, endRow, endCol) {
      const rowDiff = Math.abs(endRow - startRow);
      const colDiff = Math.abs(endCol - startCol);

      return (
        (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      );
    }

    isValidBishopMove(startRow, startCol, endRow, endCol) {
      const rowDiff = Math.abs(endRow - startRow);
      const colDiff = Math.abs(endCol - startCol);

      if (rowDiff === colDiff) {
        // Diagonal move
        const rowStep = endRow > startRow ? 1 : -1;
        const colStep = endCol > startCol ? 1 : -1;

        let r = startRow + rowStep;
        let c = startCol + colStep;

        while (r !== endRow && c !== endCol) {
          if (this.board[r][c] !== "") {
            return false; // Path is blocked
          }
          r += rowStep;
          c += colStep;
        }
        return true;
      }
      return false;
    }

    isValidKingMove(startRow, startCol, endRow, endCol) {
      const rowDiff = Math.abs(endRow - startRow);
      const colDiff = Math.abs(endCol - startCol);

      return rowDiff <= 1 && colDiff <= 1;
    }

    isValidCastling(startRow, startCol, endRow, endCol, isWhite) {
      // King-side castling
      if (isWhite) {
        if (
          startRow === 7 &&
          startCol === 4 &&
          endRow === 7 &&
          endCol === 6 &&
          !this.hasWhiteKingMoved &&
          !this.hasWhiteRookRightMoved
        ) {
          // Check if squares between king and rook are empty
          if (this.board[7][5] === "" && this.board[7][6] === "") {
            // Check if king passes through or lands on attacked squares
            if (
              !this.isSquareAttacked(7, 4, "black") &&
              !this.isSquareAttacked(7, 5, "black") &&
              !this.isSquareAttacked(7, 6, "black")
            ) {
              return true;
            }
          }
        }
      } else {
        // Black king-side castling
        if (
          startRow === 0 &&
          startCol === 4 &&
          endRow === 0 &&
          endCol === 6 &&
          !this.hasBlackKingMoved &&
          !this.hasBlackRookRightMoved
        ) {
          if (this.board[0][5] === "" && this.board[0][6] === "") {
            if (
              !this.isSquareAttacked(0, 4, "white") &&
              !this.isSquareAttacked(0, 5, "white") &&
              !this.isSquareAttacked(0, 6, "white")
            ) {
              return true;
            }
          }
        }
      }

      // Queen-side castling
      if (isWhite) {
        if (
          startRow === 7 &&
          startCol === 4 &&
          endRow === 7 &&
          endCol === 2 &&
          !this.hasWhiteKingMoved &&
          !this.hasWhiteRookLeftMoved
        ) {
          if (
            this.board[7][1] === "" &&
            this.board[7][2] === "" &&
            this.board[7][3] === ""
          ) {
            if (
              !this.isSquareAttacked(7, 4, "black") &&
              !this.isSquareAttacked(7, 3, "black") &&
              !this.isSquareAttacked(7, 2, "black")
            ) {
              return true;
            }
          }
        }
      } else {
        // Black queen-side castling
        if (
          startRow === 0 &&
          startCol === 4 &&
          endRow === 0 &&
          endCol === 2 &&
          !this.hasBlackKingMoved &&
          !this.hasBlackRookLeftMoved
        ) {
          if (
            this.board[0][1] === "" &&
            this.board[0][2] === "" &&
            this.board[0][3] === ""
          ) {
            if (
              !this.isSquareAttacked(0, 4, "white") &&
              !this.isSquareAttacked(0, 3, "white") &&
              !this.isSquareAttacked(0, 2, "white")
            ) {
              return true;
            }
          }
        }
      }

      return false;
    }

    getPieceColor(piece) {
      if (!piece) return null;
      return piece === piece.toUpperCase() ? "white" : "black";
    }

    isKingInCheck(color) {
      const kingPos = this.findKing(color);
      if (!kingPos) return false; // Should not happen

      const opponentColor = color === "white" ? "black" : "white";
      return this.isSquareAttacked(kingPos.row, kingPos.col, opponentColor);
    }

    getAllLegalMoves(color) {
      const legalMoves = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = this.board[r][c];
          if (piece && this.getPieceColor(piece) === color) {
            for (let endR = 0; endR < 8; endR++) {
              for (let endC = 0; endC < 8; endC++) {
                if (this.isValidMove(r, c, endR, endC)) {
                  legalMoves.push({
                    startRow: r,
                    startCol: c,
                    endRow: endR,
                    endCol: endC,
                  });
                }
              }
            }
          }
        }
      }
      return legalMoves;
    }

    isCheckmate(color) {
      if (!this.isKingInCheck(color)) {
        return false; // Not in check, so cannot be checkmate
      }
      return this.getAllLegalMoves(color).length === 0;
    }

    isStalemate(color) {
      if (this.isKingInCheck(color)) {
        return false; // In check, so cannot be stalemate
      }
      return this.getAllLegalMoves(color).length === 0;
    }

    isThreefoldRepetition() {
      const currentBoardState = JSON.stringify(this.board);
      let count = 0;
      for (const pastBoardState of this.boardHistory) {
        if (pastBoardState === currentBoardState) {
          count++;
        }
      }
      return count >= 2; // +1 for the current state, so 3 occurrences total
    }

    findKing(color) {
      const kingPiece = color === "white" ? "K" : "k";
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (this.board[r][c] === kingPiece) {
            return { row: r, col: c };
          }
        }
      }
      return null; // Should not happen in a valid game
    }

    isSquareAttacked(row, col, attackingColor) {
      // Check for pawn attacks
      const pawn = attackingColor === "white" ? "P" : "p";
      const pawnDirection = attackingColor === "white" ? 1 : -1; // White pawns attack downwards, black pawns attack upwards

      if (row + pawnDirection >= 0 && row + pawnDirection < 8) {
        if (col - 1 >= 0 && this.board[row + pawnDirection][col - 1] === pawn)
          return true;
        if (col + 1 < 8 && this.board[row + pawnDirection][col + 1] === pawn)
          return true;
      }

      // Check for knight attacks
      const knight = attackingColor === "white" ? "N" : "n";
      const knightMoves = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ];
      for (const [dr, dc] of knightMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (
          newRow >= 0 &&
          newRow < 8 &&
          newCol >= 0 &&
          newCol < 8 &&
          this.board[newRow][newCol] === knight
        ) {
          return true;
        }
      }

      // Check for rook/queen (horizontal/vertical) attacks
      const rookQueenHV = attackingColor === "white" ? ["R", "Q"] : ["r", "q"];
      const directionsHV = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      for (const [dr, dc] of directionsHV) {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          const piece = this.board[r][c];
          if (piece) {
            if (rookQueenHV.includes(piece)) return true;
            break; // Path blocked by another piece
          }
          r += dr;
          c += dc;
        }
      }

      // Check for bishop/queen (diagonal) attacks
      const bishopQueenD = attackingColor === "white" ? ["B", "Q"] : ["b", "q"];
      const directionsD = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [dr, dc] of directionsD) {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          const piece = this.board[r][c];
          if (piece) {
            if (bishopQueenD.includes(piece)) return true;
            break; // Path blocked by another piece
          }
          r += dr;
          c += dc;
        }
      }

      // Check for king attacks (should not be possible in a valid game state, but for completeness)
      const king = attackingColor === "white" ? "K" : "k";
      const kingMoves = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];
      for (const [dr, dc] of kingMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (
          newRow >= 0 &&
          newRow < 8 &&
          newCol >= 0 &&
          newCol < 8 &&
          this.board[newRow][newCol] === king
        ) {
          return true;
        }
      }

      return false;
    }

    showPossibleMoves(startRow, startCol) {
      for (let endRow = 0; endRow < 8; endRow++) {
        for (let endCol = 0; endCol < 8; endCol++) {
          if (this.isValidMove(startRow, startCol, endRow, endCol)) {
            const targetSquare = document.querySelector(
              `[data-row="${endRow}"][data-col="${endCol}"]`
            );
            const indicator = document.createElement("img");
            indicator.classList.add("move-indicator");

            if (this.board[endRow][endCol]) {
              indicator.src = "red-dot.gif";
            } else {
              indicator.src = "green-dot.gif";
            }

            targetSquare.appendChild(indicator);
          }
        }
      }
    }

    clearMoveIndicators() {
      document.querySelectorAll(".move-indicator").forEach((indicator) => {
        indicator.remove();
      });
    }

    makeMove(startRow, startCol, endRow, endCol) {
      const pieceType = this.board[startRow][startCol];
      const isWhitePiece = pieceType === pieceType.toUpperCase();

      if (this.board[endRow][endCol]) {
        const capturedPieceType = this.board[endRow][endCol];
        const capturedPieceElement = document.createElement("img");
        capturedPieceElement.src = this.pieceImage[capturedPieceType];
        capturedPieceElement.classList.add("piece");
        this.capturedPieces.appendChild(capturedPieceElement);
        this.fiftyMoveRuleCounter = 0;
      }

      if (
        pieceType.toLowerCase() === "k" &&
        Math.abs(endCol - startCol) === 2
      ) {
        if (endCol === 6) {
          const rookType = this.board[startRow][7];
          this.board[startRow][5] = rookType;
          this.board[startRow][7] = "";
        } else if (endCol === 2) {
          const rookType = this.board[startRow][0];
          this.board[startRow][3] = rookType;
          this.board[startRow][0] = "";
        }
      } else if (
        pieceType.toLowerCase() === "p" &&
        Math.abs(startRow - endRow) === 2
      ) {
        this.enPassantTargetSquare = {
          row: (startRow + endRow) / 2,
          col: startCol,
        };
        this.fiftyMoveRuleCounter = 0;
      } else if (
        pieceType.toLowerCase() === "p" &&
        endCol !== startCol &&
        !this.board[endRow][endCol]
      ) {
        const capturedPawnRow = isWhitePiece ? endRow + 1 : endRow - 1;
        const capturedPawnType = this.board[capturedPawnRow][endCol];
        const capturedPieceElement = document.createElement("img");
        capturedPieceElement.src = this.pieceImage[capturedPawnType];
        capturedPieceElement.classList.add("piece");
        this.capturedPieces.appendChild(capturedPieceElement);
        this.board[capturedPawnRow][endCol] = "";
        this.fiftyMoveRuleCounter = 0;
      } else if (pieceType.toLowerCase() === "p") {
        this.fiftyMoveRuleCounter = 0;
      } else {
        this.fiftyMoveRuleCounter++;
      }

      this.board[endRow][endCol] = pieceType;
      this.board[startRow][startCol] = "";

      this.enPassantTargetSquare = null;

      if (
        pieceType.toLowerCase() === "p" &&
        Math.abs(startRow - endRow) === 2
      ) {
        this.enPassantTargetSquare = {
          row: (startRow + endRow) / 2,
          col: startCol,
        };
      }

      if (pieceType.toLowerCase() === "k") {
        if (isWhitePiece) {
          this.hasWhiteKingMoved = true;
        } else {
          this.hasBlackKingMoved = true;
        }
      } else if (pieceType.toLowerCase() === "r") {
        if (isWhitePiece) {
          if (startCol === 0) this.hasWhiteRookLeftMoved = true;
          if (startCol === 7) this.hasWhiteRookRightMoved = true;
        } else {
          if (startCol === 0) this.hasBlackRookLeftMoved = true;
          if (startCol === 7) this.hasBlackRookRightMoved = true;
        }
      }

      if (
        pieceType.toLowerCase() === "p" &&
        ((isWhitePiece && endRow === 0) || (!isWhitePiece && endRow === 7))
      ) {
        let promotedTo = prompt("Promote pawn to (Q, R, B, N):").toLowerCase();
        while (!["q", "r", "b", "n"].includes(promotedTo)) {
          promotedTo = prompt(
            "Invalid choice. Promote pawn to (Q, R, B, N):"
          ).toLowerCase();
        }
        this.board[endRow][endCol] = isWhitePiece
          ? promotedTo.toUpperCase()
          : promotedTo;
      }

      this.createBoard();
      this.addDragListeners();

      this.movesHistory.innerHTML += `<p>${pieceType} from ${startRow},${startCol} to ${endRow},${endCol}</p>`;
      this.movesHistory.scrollTop = this.movesHistory.scrollHeight;

      this.boardHistory.push(JSON.stringify(this.board));
      this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
      this.updateTurnDisplay();

      const nextPlayer = this.currentPlayer;
      if (this.isKingInCheck(nextPlayer)) {
        if (this.isCheckmate(nextPlayer)) {
          alert(
            `Checkmate! ${
              nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)
            } loses!`
          );
        } else {
          alert(
            `${
              nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)
            } is in check!`
          );
        }
      } else if (this.isStalemate(nextPlayer)) {
        alert("Stalemate! It's a draw!");
      } else if (this.fiftyMoveRuleCounter >= 100) {
        alert("Draw by Fifty-Move Rule!");
      } else if (this.isThreefoldRepetition()) {
        alert("Draw by Threefold Repetition!");
      }
    }
  }

  new ChessGame(chessboard, movesHistory, capturedPieces);
});
