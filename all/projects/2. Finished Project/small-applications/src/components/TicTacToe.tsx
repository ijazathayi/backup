import React, { useState } from 'react';
import './css/project.css';

type Player = 'X' | 'O' | null;

const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  
  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const result = calculateWinner(board);
  const winner = result?.winner;
  const winningLine = result?.line || [];
  const isDraw = !winner && board.every(square => square !== null);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="project-page" style={{ maxWidth: '500px', textAlign: 'center' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Tic-Tac-Toe</h2>
      
      <div style={{
        fontSize: '1.25rem',
        margin: '1.5rem 0',
        fontWeight: '500',
        color: winner ? 'var(--success)' : isDraw ? 'var(--warning)' : 'var(--text-primary)'
      }}>
        {winner ? `Winner: ${winner}` : isDraw ? "It's a Draw!" : `Next Player: ${xIsNext ? 'X' : 'O'}`}
      </div>

      <style>{`
        .ttt-cell {
          aspect-ratio: 1 / 1;
          width: 100%;
          border: none;
          border-radius: 12px;
          font-size: 3.5rem;
          font-weight: 800;
          font-family: var(--font-heading);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ttt-cell:not(:disabled):hover {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .ttt-cell:active {
          transform: scale(0.95);
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        maxWidth: '350px',
        margin: '0 auto 2rem',
        background: 'var(--bg-surface)',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)'
      }}>
        {board.map((square, index) => {
          const isWinningSquare = winningLine.includes(index);
          return (
            <button
              key={index}
              className="ttt-cell"
              onClick={() => handleClick(index)}
              style={{
                background: isWinningSquare ? 'var(--success)' : 'rgba(255, 255, 255, 0.05)',
                color: square === 'X' ? 'var(--accent-color)' : square === 'O' ? 'var(--danger)' : 'transparent',
                cursor: square || winner ? 'default' : 'pointer',
                boxShadow: isWinningSquare ? '0 0 20px var(--success)' : 'inset 0 2px 4px rgba(0,0,0,0.1)',
                textShadow: square ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'
              }}
              disabled={!!square || !!winner}
            >
              {square}
            </button>
          );
        })}
      </div>

      <button className="project-btn" onClick={handleReset} style={{ minWidth: '150px' }}>
        Restart Game
      </button>
    </div>
  );
};

export default TicTacToe;
