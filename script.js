// Variáveis globais
let jogo = null;

const telaInicial = document.getElementById("telaInicial");
const telaJogos = document.getElementById("telaJogos");
const btnEntrar = document.getElementById("btnEntrar");
const btnVoltar = document.getElementById("btnVoltar");
const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");

const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnDown = document.getElementById("btnDown");
const btnRotate = document.getElementById("btnRotate");
const tetrisControls = document.getElementById("tetrisControls");

btnEntrar.onclick = () => {
  telaInicial.style.display = "none";
  telaJogos.style.display = "block";
};

btnVoltar.onclick = () => {
  telaInicial.style.display = "block";
  telaJogos.style.display = "none";
  tetrisCanvas.style.display = "none";
  tetrisControls.style.display = "none";
  cancelAnimationFrame(animationId);
};

function iniciarJogo(tipo) {
  jogo = tipo;

  telaJogos.style.display = "none";

  if (tipo === "tetris") {
    tetrisCanvas.style.display = "block";
    tetrisControls.style.display = "flex";
    iniciarTetris();
  } else {
    tetrisCanvas.style.display = "none";
    tetrisControls.style.display = "none";
  }
}

// Tetris - Constantes
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

tetrisCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

const COLORS = [
  null,
  '#00f0f0', // I
  '#0000f0', // J
  '#f0a000', // L
  '#f0f000', // O
  '#00f000', // S
  '#a000f0', // T
  '#f00000'  // Z
];

const SHAPES = [
  [],
  [[1,1,1,1]],             // I
  [[2,0,0],[2,2,2]],       // J
  [[0,0,3],[3,3,3]],       // L
  [[4,4],[4,4]],           // O
  [[0,5,5],[5,5,0]],       // S
  [[0,6,0],[6,6,6]],       // T
  [[7,7,0],[0,7,7]]        // Z
];

// Tetris - Variáveis
let board = [];
let currentPiece;
let currentX;
let currentY;
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;
let animationId;

// Funções Tetris
function createBoard() {
  board = [];
  for(let i=0; i<ROWS; i++) {
    board.push(new Array(COLS).fill(0));
  }
}

function drawBlock(x, y, colorIndex) {
  if(colorIndex) {
    tetrisCtx.fillStyle = COLORS[colorIndex];
    tetrisCtx.fillRect(x, y, 1, 1);
    tetrisCtx.strokeStyle = 'black';
    tetrisCtx.lineWidth = 0.05;
    tetrisCtx.strokeRect(x, y, 1, 1);
  }
}

function drawBoard() {
  for(let y=0; y<ROWS; y++) {
    for(let x=0; x<COLS; x++) {
      drawBlock(x, y, board[y][x]);
    }
  }
}

function drawPiece() {
  currentPiece.forEach((row, y) => {
    row.forEach((val, x) => {
      if(val !== 0) {
        drawBlock(currentX + x, currentY + y, val);
      }
    });
  });
}

function collide(board, piece, posX, posY) {
  for(let y=0; y<piece.length; y++) {
    for(let x=0; x<piece[y].length; x++) {
      if(piece[y][x] !== 0) {
        const newX = posX + x;
        const newY = posY + y;
        if(newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if(newY >= 0 && board[newY][newX] !== 0) return true;
      }
    }
  }
  return false;
}

function merge(board, piece, posX, posY) {
  piece.forEach((row, y) => {
    row.forEach((val, x) => {
      if(val !== 0 && posY + y >= 0) {
        board[posY + y][posX + x] = val;
      }
    });
  });
}

function rotate(piece) {
  const N = piece.length;
  const rotated = [];
  for(let x=0; x<N; x++) {
    const newRow = [];
    for(let y=N-1; y>=0; y--) {
      newRow.push(piece[y][x] || 0);
    }
    rotated.push(newRow);
  }
  return rotated;
}

function clearLines() {
  for(let y=ROWS-1; y>=0; y--) {
    if(board[y].every(cell => cell !== 0)) {
      board.splice(y,1);
      board.unshift(new Array(COLS).fill(0));
      y++;
    }
  }
}

function newPiece() {
  const id = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
  return SHAPES[id];
}

function resetPiece() {
  currentPiece = newPiece();
  currentX = Math.floor(COLS/2) - Math.floor(currentPiece[0].length/2);
  currentY = -1;

  if(collide(board, currentPiece, currentX, currentY)) {
    alert("Game Over");
    createBoard();
  }
}

function drop() {
  if(!collide(board, currentPiece, currentX, currentY + 1)) {
    currentY++;
  } else {
    merge(board, currentPiece, currentX, currentY);
    clearLines();
    resetPiece();
  }
  dropCounter = 0;
}

function update(time=0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if(dropCounter > dropInterval) {
    drop();
  }

  tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
  drawBoard();
  drawPiece();

  animationId = requestAnimationFrame(update);
}

// Controles teclado
document.addEventListener("keydown", e => {
  if(jogo !== "tetris") return;

  if(e.key === "ArrowLeft") {
    if(!collide(board, currentPiece, currentX - 1, currentY)) currentX--;
  } else if(e.key === "ArrowRight") {
    if(!collide(board, currentPiece, currentX + 1, currentY)) currentX++;
  } else if(e.key === "ArrowDown") {
    drop();
  } else if(e.key === "ArrowUp") {
    const rotated = rotate(currentPiece);
    if(!collide(board, rotated, currentX, currentY)) currentPiece = rotated;
  }
});

// Controles touch para celular
btnLeft.addEventListener("touchstart", e => {
  e.preventDefault();
  if(jogo !== "tetris") return;
  if(!collide(board, currentPiece, currentX - 1, currentY)) currentX--;
});

btnRight.addEventListener("touchstart", e => {
  e.preventDefault();
  if(jogo !== "tetris") return;
  if(!collide(board, currentPiece, currentX + 1, currentY)) currentX++;
});

btnDown.addEventListener("touchstart", e => {
  e.preventDefault();
  if(jogo !== "tetris") return;
  drop();
});

btnRotate.addEventListener("touchstart", e => {
  e.preventDefault();
  if(jogo !== "tetris") return;
  const rotated = rotate(currentPiece);
  if(!collide(board, rotated, currentX, currentY)) currentPiece = rotated;
});

function iniciarTetris() {
  createBoard();
  resetPiece();
  lastTime = 0;
  dropCounter = 0;
  update();
}
