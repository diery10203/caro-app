import React, { useState, useEffect } from 'react';
import './App.css';

const BOARD_SIZE = 15;
const WIN_LENGTH = 5;

const PLAYER_X = 'X';
const PLAYER_O = 'O';
const EMPTY = null;

// Hàm AI heuristic đơn giản
function getBestMove(board, aiPlayer = 'O', humanPlayer = 'X') {
  const size = board.length;
  let bestScore = -Infinity;
  let bestMove = null;

  // Scoring system
  const scores = {
    5: 100000, // win
    4: 10000,
    3: 1000,
    2: 100,
    1: 10
  };

  // Check score of a move
  function evaluateLine(line, player) {
    let count = 0;
    for (let cell of line) {
      if (cell === player) count++;
      else if (cell !== null) return 0; // bị chặn bởi đối thủ
    }
    return scores[count] || 0;
  }

  function getLines(r, c) {
    const lines = [];
    // horizontal
    if (c <= size - 5) lines.push(board[r].slice(c, c + 5));
    // vertical
    if (r <= size - 5) lines.push(board.slice(r, r + 5).map(row => row[c]));
    // diagonal \
    if (r <= size - 5 && c <= size - 5)
      lines.push([0,1,2,3,4].map(i => board[r + i][c + i]));
    // diagonal /
    if (r >= 4 && c <= size - 5)
      lines.push([0,1,2,3,4].map(i => board[r - i][c + i]));
    return lines;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) continue;
      let score = 0;
      const lines = getLines(r, c);
      for (let line of lines) {
        score += evaluateLine(line, aiPlayer);       // Tấn công
        score += evaluateLine(line, humanPlayer) * 0.9; // Phòng thủ
      }
      if (score > bestScore) {
        bestScore = score;
        bestMove = { row: r, col: c };
      }
    }
  }
  // Nếu không tìm được gì, chọn random
  if (!bestMove) {
    const emptyCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === null) emptyCells.push({ row: r, col: c });
      }
    }
    bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  return bestMove;
}

// Local AI move
function getLocalAIMove(board) {
  const move = getBestMove(board, 'O', 'X');
  if (move) return [move.row, move.col];
  return null;
}

// Hàm kiểm tra nước thắng (giữ nguyên)
function checkWinner(board, row, col, player) {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1]   // diagonal down-left
  ];
  for (const [dx, dy] of directions) {
    let count = 1;
    let cells = [[row, col]];
    // Check in positive direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
      if (board[newRow][newCol] !== player) break;
      count++;
      cells.push([newRow, newCol]);
    }
    // Check in negative direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
      if (board[newRow][newCol] !== player) break;
      count++;
      cells.push([newRow, newCol]);
    }
    if (count >= WIN_LENGTH) return cells;
  }
  return null;
}

// Hàm kiểm tra nước thắng hoặc chặn thắng ngay lập tức
function findImmediateWinOrBlock(board, aiPlayer = 'O', humanPlayer = 'X') {
  const moves = getAvailableMoves(board);
  // Ưu tiên nước thắng cho AI
  for (const [row, col] of moves) {
    board[row][col] = aiPlayer;
    if (checkWinner(board, row, col, aiPlayer)) {
      board[row][col] = null;
      return [row, col];
    }
    board[row][col] = null;
  }
  // Nếu không có, thử chặn thắng đối thủ
  for (const [row, col] of moves) {
    board[row][col] = humanPlayer;
    if (checkWinner(board, row, col, humanPlayer)) {
      board[row][col] = null;
      return [row, col];
    }
    board[row][col] = null;
  }
  return null;
}

// Hàm kiểm tra nước tạo 4 hoặc 3 liên tiếp không bị chặn
function findStrongAttackOrBlock(board, aiPlayer = 'O', humanPlayer = 'X') {
  const moves = getAvailableMoves(board);
  // Tìm nước tạo 4 hoặc 3 liên tiếp cho AI
  for (const [row, col] of moves) {
    board[row][col] = aiPlayer;
    if (countOpenLine(board, row, col, aiPlayer, 4) || countOpenLine(board, row, col, aiPlayer, 3)) {
      board[row][col] = null;
      return [row, col];
    }
    board[row][col] = null;
  }
  // Chặn đối thủ tạo 4 hoặc 3 liên tiếp
  for (const [row, col] of moves) {
    board[row][col] = humanPlayer;
    if (countOpenLine(board, row, col, humanPlayer, 4) || countOpenLine(board, row, col, humanPlayer, 3)) {
      board[row][col] = null;
      return [row, col];
    }
    board[row][col] = null;
  }
  return null;
}

// Đếm số dãy liên tiếp length chưa bị chặn ở hai đầu
function countOpenLine(board, row, col, player, length) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (const [dx, dy] of directions) {
    let count = 1;
    let block1 = false, block2 = false;
    // forward
    for (let i = 1; i < length; i++) {
      const nr = row + i * dx, nc = col + i * dy;
      if (nr < 0 || nr >= board.length || nc < 0 || nc >= board.length) { block1 = true; break; }
      if (board[nr][nc] === player) count++;
      else if (board[nr][nc] === null) break;
      else { block1 = true; break; }
    }
    // backward
    for (let i = 1; i < length; i++) {
      const nr = row - i * dx, nc = col - i * dy;
      if (nr < 0 || nr >= board.length || nc < 0 || nc >= board.length) { block2 = true; break; }
      if (board[nr][nc] === player) count++;
      else if (board[nr][nc] === null) break;
      else { block2 = true; break; }
    }
    if (count >= length && !block1 && !block2) return true;
  }
  return false;
}

// Hàm kiểm tra nước tạo 4 liên tiếp bị chặn 1 đầu (semi-open four)
function findSemiOpenFour(board, aiPlayer = 'O', humanPlayer = 'X') {
  const moves = getAvailableMoves(board);
  for (const [row, col] of moves) {
    board[row][col] = aiPlayer;
    if (countSemiOpenLine(board, row, col, aiPlayer, 4)) {
      board[row][col] = null;
      return [row, col];
    }
    board[row][col] = null;
  }
  for (const [row, col] of moves) {
    board[row][col] = humanPlayer;
    if (countSemiOpenLine(board, row, col, humanPlayer, 4)) {
      board[row][col] = null;
      return [row, col];
    }
    board[row][col] = null;
  }
  return null;
}

// Đếm số dãy liên tiếp length bị chặn 1 đầu
function countSemiOpenLine(board, row, col, player, length) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (const [dx, dy] of directions) {
    let count = 1;
    let block1 = false, block2 = false;
    // forward
    for (let i = 1; i < length; i++) {
      const nr = row + i * dx, nc = col + i * dy;
      if (nr < 0 || nr >= board.length || nc < 0 || nc >= board.length) { block1 = true; break; }
      if (board[nr][nc] === player) count++;
      else if (board[nr][nc] === null) break;
      else { block1 = true; break; }
    }
    // backward
    for (let i = 1; i < length; i++) {
      const nr = row - i * dx, nc = col - i * dy;
      if (nr < 0 || nr >= board.length || nc < 0 || nc >= board.length) { block2 = true; break; }
      if (board[nr][nc] === player) count++;
      else if (board[nr][nc] === null) break;
      else { block2 = true; break; }
    }
    if (count >= length && (block1 !== block2)) return true;
  }
  return false;
}

// Hàm kiểm tra double threat (2 đường thắng cùng lúc)
function findDoubleThreat(board, aiPlayer = 'O', humanPlayer = 'X') {
  const moves = getAvailableMoves(board);
  // Ưu tiên tạo double threat cho AI
  for (const [row, col] of moves) {
    board[row][col] = aiPlayer;
    let winCount = 0;
    for (const [r2, c2] of getAvailableMoves(board)) {
      board[r2][c2] = aiPlayer;
      if (checkWinner(board, r2, c2, aiPlayer)) winCount++;
      board[r2][c2] = null;
      if (winCount >= 2) break;
    }
    board[row][col] = null;
    if (winCount >= 2) return [row, col];
  }
  // Chặn double threat của đối thủ
  for (const [row, col] of moves) {
    board[row][col] = humanPlayer;
    let winCount = 0;
    for (const [r2, c2] of getAvailableMoves(board)) {
      board[r2][c2] = humanPlayer;
      if (checkWinner(board, r2, c2, humanPlayer)) winCount++;
      board[r2][c2] = null;
      if (winCount >= 2) break;
    }
    board[row][col] = null;
    if (winCount >= 2) return [row, col];
  }
  return null;
}

// Sửa getCandidateMoves: topN = 40
function getCandidateMoves(board, aiPlayer = 'O', humanPlayer = 'X', topN = 40) {
  const size = board.length;
  const candidates = new Set();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === null) {
              candidates.add(nr + ',' + nc);
            }
          }
        }
      }
    }
  }
  if (candidates.size === 0) {
    const mid = Math.floor(size / 2);
    candidates.add(mid + ',' + mid);
  }
  const scoredMoves = Array.from(candidates).map(s => {
    const [row, col] = s.split(',').map(Number);
    board[row][col] = aiPlayer;
    const score = evaluateBoard(board, aiPlayer, humanPlayer);
    board[row][col] = null;
    return { row, col, score };
  });
  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves.slice(0, topN).map(m => [m.row, m.col]);
}

// Heuristic mạnh hơn cho evaluateBoard
function evaluateBoard(board, aiPlayer = 'O', humanPlayer = 'X') {
  const size = board.length;
  const scores = { 5: 100000, 4: 20000, 3: 2000, 2: 100, 1: 10 };
  let score = 0;
  function evaluateLine(line, player) {
    let count = 0;
    let block1 = false, block2 = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === player) count++;
      else if (line[i] === null) {
        if (i === 0) block1 = true;
        else block2 = true;
      } else {
        if (i === 0) block1 = true;
        else block2 = true;
        break;
      }
    }
    if (count === 4 && !block1 && !block2) return 20000; // 4 mở hai đầu
    if (count === 4 && (block1 !== block2)) return 8000; // 4 bị chặn 1 đầu
    if (count === 3 && !block1 && !block2) return 2000; // 3 mở hai đầu
    if (count === 3 && (block1 !== block2)) return 500; // 3 bị chặn 1 đầu
    return scores[count] || 0;
  }
  function getLines(r, c) {
    const lines = [];
    if (c <= size - 5) lines.push(board[r].slice(c, c + 5));
    if (r <= size - 5) lines.push(board.slice(r, r + 5).map(row => row[c]));
    if (r <= size - 5 && c <= size - 5)
      lines.push([0,1,2,3,4].map(i => board[r + i][c + i]));
    if (r >= 4 && c <= size - 5)
      lines.push([0,1,2,3,4].map(i => board[r - i][c + i]));
    return lines;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) continue;
      const lines = getLines(r, c);
      for (let line of lines) {
        if (board[r][c] === aiPlayer) score += evaluateLine(line, aiPlayer);
        else score -= evaluateLine(line, humanPlayer);
      }
    }
  }
  return score;
}

// Hàm kiểm tra bàn cờ đã đầy chưa
function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== null));
}

// Minimax với alpha-beta pruning, chỉ xét top 3 nước đi mỗi node, depth tối đa 2
function minimax(board, depth, isMaximizing, alpha, beta, aiPlayer, humanPlayer, topN = 8) {
  // Log depth và trạng thái board
  // console.log('Minimax depth:', depth, 'isMax:', isMaximizing);
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      if (board[r][c] !== null) {
        if (checkWinner(board, r, c, aiPlayer)) return { score: 100000 - (5 - depth) };
        if (checkWinner(board, r, c, humanPlayer)) return { score: -100000 + (5 - depth) };
      }
    }
  }
  if (depth === 0 || isBoardFull(board)) {
    return { score: evaluateBoard(board, aiPlayer, humanPlayer) };
  }
  const moves = getCandidateMoves(board, aiPlayer, humanPlayer, topN); // chỉ lấy top 3 nước đi
  let bestMove = null;
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const [row, col] of moves) {
      board[row][col] = aiPlayer;
      const evalResult = minimax(board, depth - 1, false, alpha, beta, aiPlayer, humanPlayer, topN);
      board[row][col] = null;
      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = { row, col };
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const [row, col] of moves) {
      board[row][col] = humanPlayer;
      const evalResult = minimax(board, depth - 1, true, alpha, beta, aiPlayer, humanPlayer, topN);
      board[row][col] = null;
      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = { row, col };
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

// Hàm tìm tất cả nước chặn thắng của đối thủ (không chỉ topN)
function findAllBlockOpponentWin(board, aiPlayer = 'O', humanPlayer = 'X') {
  const moves = getAvailableMoves(board);
  for (const [row, col] of moves) {
    board[row][col] = humanPlayer;
    if (checkWinner(board, row, col, humanPlayer)) {
      board[row][col] = null;
      // Nếu AI đi vào đây sẽ chặn thắng đối thủ
      return [row, col];
    }
    board[row][col] = null;
  }
  return null;
}

// Sửa getMinimaxMove để tối ưu thực tế (depth 7, topN 40, double threat)
function getMinimaxMove(board, aiPlayer = 'O', humanPlayer = 'X') {
  // 1. Ưu tiên nước thắng hoặc chặn thắng ngay
  const immediate = findImmediateWinOrBlock(board, aiPlayer, humanPlayer);
  if (immediate) return immediate;
  // 2. Luôn duyệt toàn bộ nước chặn thắng của đối thủ
  const mustBlock = findAllBlockOpponentWin(board, aiPlayer, humanPlayer);
  if (mustBlock) return mustBlock;
  // 3. Ưu tiên double threat cho AI hoặc chặn đối thủ
  const doubleThreat = findDoubleThreat(board, aiPlayer, humanPlayer);
  if (doubleThreat) return doubleThreat;
  // 4. Ưu tiên nước tạo 4 hoặc 3 liên tiếp hoặc chặn đối thủ
  const strong = findStrongAttackOrBlock(board, aiPlayer, humanPlayer);
  if (strong) return strong;
  // 5. Ưu tiên nước tạo 4 liên tiếp bị chặn 1 đầu
  const semiOpen = findSemiOpenFour(board, aiPlayer, humanPlayer);
  if (semiOpen) return semiOpen;
  // 6. Tùy số ô trống mà chọn depth và topN
  const emptyCount = getAvailableMoves(board).length;
  let depth = 3;
  let topN = 40;
  if (emptyCount <= 4) depth = 7;
  else if (emptyCount <= 6) depth = 6;
  else if (emptyCount <= 8) depth = 5;
  else if (emptyCount <= 20) depth = 4;
  const result = minimax(board.map(row => [...row]), depth, true, -Infinity, Infinity, aiPlayer, humanPlayer, topN);
  if (result.move) return [result.move.row, result.move.col];
  // fallback random nếu không có nước đi
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length > 0) {
    const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    return move;
  }
  return null;
}

// Hàm lấy tất cả các ô trống trên bàn cờ (PHẢI đặt ở đầu file, ngoài cùng, không lồng trong bất kỳ function nào)
function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === null) {
        moves.push([i, j]);
      }
    }
  }
  return moves;
}

// Convert board to text for API
function boardToText(board) {
  let text = 'Bàn cờ caro 15x15:\n';
  for (let i = 0; i < board.length; i++) {
    let row = '';
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === 'X') {
        row += 'X ';
      } else if (board[i][j] === 'O') {
        row += 'O ';
      } else {
        row += '. ';
      }
    }
    text += row + '\n';
  }
  return text;
}

// (Đã xóa toàn bộ các dòng liên quan đến OPENAI_ENDPOINT, OPENAI_API_KEY, và getAIMove)

function App() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_X);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isAITurn, setIsAITurn] = useState(false);
  const [winningCells, setWinningCells] = useState([]);

  function createEmptyBoard() {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
  }

  function handleCellClick(row, col) {
    if (gameOver || board[row][col] !== EMPTY || isAITurn) return;
    console.log('Người chơi đi:', row, col);
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    const winCells = checkWinner(newBoard, row, col, currentPlayer);
    if (winCells) {
      setGameOver(true);
      setWinner(currentPlayer);
      setWinningCells(winCells);
      return;
    }
    if (isBoardFull(newBoard)) {
      setGameOver(true);
      setWinner('draw');
      setWinningCells([]);
      return;
    }
    setCurrentPlayer(PLAYER_O); // chuyển lượt cho AI
    setIsAITurn(true);
    console.log('Sau khi người chơi đi: currentPlayer =', PLAYER_O, ', isAITurn =', true);
  }

  useEffect(() => {
    console.log('useEffect: isAITurn =', isAITurn, ', currentPlayer =', currentPlayer, ', gameOver =', gameOver);
    if (isAITurn && !gameOver && currentPlayer === PLAYER_O) {
      console.log('AI turn bắt đầu');
      const aiMove = getMinimaxMove(board, 'O', 'X');
      if (aiMove) {
        const [row, col] = aiMove;
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = PLAYER_O;
        setBoard(newBoard);
        const winCells = checkWinner(newBoard, row, col, PLAYER_O);
        if (winCells) {
          setGameOver(true);
          setWinner(PLAYER_O);
          setWinningCells(winCells);
          setIsAITurn(false);
          console.log('AI thắng!');
          return;
        }
        if (isBoardFull(newBoard)) {
          setGameOver(true);
          setWinner('draw');
          setWinningCells([]);
          setIsAITurn(false);
          console.log('Hòa!');
          return;
        }
        setCurrentPlayer(PLAYER_X);
      } else {
        console.log('AI không có nước đi, kết thúc lượt.');
      }
      setIsAITurn(false);
      console.log('AI turn kết thúc');
    }
  }, [isAITurn, board, currentPlayer, gameOver]);

  function resetGame() {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER_X);
    setGameOver(false);
    setWinner(null);
    setIsAITurn(false);
    setWinningCells([]);
  }

  function getStatusMessage() {
    if (gameOver) {
      if (winner === 'draw') return 'Hòa! 🤝';
      if (winner === PLAYER_X) return 'Bạn thắng! 🎉🎊';
      return 'AI thắng! 🤖💪';
    }
    if (isAITurn) {
      const messages = [
        'AI đang phân tích... 🤖',
        'AI đang tìm nước đi... 🧠',
        'AI đang tính toán... 💭',
        'AI đang suy nghĩ... '
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    return `Lượt của: ${currentPlayer === PLAYER_X ? 'Bạn (X)' : 'AI (O)'}`;
  }

  return (
    <div className="app">
      <div className="game-container">
        <h1 className="title">🎮 Caro AI Game</h1>
        
        <div className="status">
          <p className="status-text">{getStatusMessage()}</p>
        </div>
        
        <div className="board-container">
          <div className="board">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((cell, colIndex) => {
                  const isWinCell = winningCells.some(([r, c]) => r === rowIndex && c === colIndex);
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`cell ${cell ? `cell-${cell.toLowerCase()}` : ''} ${isAITurn ? 'disabled' : ''} ${isWinCell ? 'cell-win' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={gameOver || cell !== EMPTY || isAITurn}
                    >
                      {cell}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="controls">
          {/* Xóa selector độ khó AI */}
          <button className="reset-btn" onClick={resetGame}>
            Chơi lại
          </button>
        </div>
        
        <div className="instructions">
          <h3>Hướng dẫn:</h3>
          <ul>
            <li>Bạn chơi với ký hiệu <strong>X</strong></li>
            <li>AI chơi với ký hiệu <strong>O</strong></li>
            <li>Đặt 5 quân cờ liên tiếp để thắng</li>
            <li>Có thể đặt theo hàng ngang, dọc hoặc chéo</li>
            <li>AI sử dụng chiến thuật mạnh nhất</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App; 