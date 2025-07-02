let jogo = null;

const telaInicial = document.getElementById("telaInicial");
const telaJogos = document.getElementById("telaJogos");
const btnEntrar = document.getElementById("btnEntrar");
const btnVoltar = document.getElementById("btnVoltar");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");
const memoriaContainer = document.getElementById("memoriaContainer");
const mobileControls = document.getElementById("mobileControls");

// === NAVEGAÇÃO ===
btnEntrar.onclick = () => {
  telaInicial.style.display = "none";
  telaJogos.style.display = "block";
};

btnVoltar.onclick = () => {
  telaInicial.style.display = "block";
  telaJogos.style.display = "none";
  canvas.style.display = "none";
  tetrisCanvas.style.display = "none";
  memoriaContainer.style.display = "none";
  mobileControls.style.display = "none";
  cancelAnimationFrame(requestId);
};

// Chama o jogo escolhido
function iniciarJogo(tipo) {
  jogo = tipo;
  telaJogos.style.display = "none";
  canvas.style.display = tipo !== "memoria" && tipo !== "tetris" ? "block" : "none";
  tetrisCanvas.style.display = tipo === "tetris" ? "block" : "none";
  memoriaContainer.style.display = tipo === "memoria" ? "block" : "none";
  mobileControls.style.display = tipo !== "memoria" ? "flex" : "none";

  // Para limpar animações antigas
  if(requestId) cancelAnimationFrame(requestId);

  if (tipo === "snake") iniciarSnake();
  if (tipo === "pong") iniciarPong();
  if (tipo === "memoria") iniciarMemoria();
  if (tipo === "tetris") iniciarTetris();
}

/* ---------------- SNAKE ---------------- */
let snake, food, dx, dy, score, requestId;

function iniciarSnake() {
  snake = [{ x: 10, y: 10 }];
  food = gerarComida();
  dx = 0;
  dy = 0;
  score = 0;
  desenharSnake();
}

function desenharSnake() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f39c12";
  snake.forEach((s) => {
    ctx.fillRect(s.x * 20, s.y * 20, 18, 18);
  });

  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(food.x * 20, food.y * 20, 18, 18);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontuação: " + score, 10, 20);

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (colisao(head)) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = gerarComida();
  } else {
    snake.pop();
  }

  requestId = requestAnimationFrame(() => setTimeout(desenharSnake, 150));
}

function gerarComida() {
  let newFood;
  while(true) {
    newFood = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    };
    if(!snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
  }
  return newFood;
}

function colisao(head) {
  return (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width / 20 ||
    head.y >= canvas.height / 20 ||
    snake.some(s => s.x === head.x && s.y === head.y)
  );
}

document.addEventListener("keydown", e => {
  if (jogo !== "snake") return;
  if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
  else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
  else if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
  else if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
});

document.querySelectorAll("#mobileControls .arrow-btn").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    if (jogo !== "snake") return;
    const dir = btn.getAttribute("data-dir");
    if (dir === "UP" && dy === 0) { dx = 0; dy = -1; }
    else if (dir === "DOWN" && dy === 0) { dx = 0; dy = 1; }
    else if (dir === "LEFT" && dx === 0) { dx = -1; dy = 0; }
    else if (dir === "RIGHT" && dx === 0) { dx = 1; dy = 0; }
  });
});

/* ---------------- PONG ---------------- */
let bola, jogador, ia;

function iniciarPong() {
  bola = { x: 200, y: 200, dx: 3, dy: 2 };
  jogador = { y: 150 };
  ia = { y: 150 };
  requestId = requestAnimationFrame(loopPong);
}

function loopPong() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = "white";
  ctx.fillRect(10, jogador.y, 10, 80);
  ctx.fillRect(380, ia.y, 10, 80);
  ctx.beginPath();
  ctx.arc(bola.x, bola.y, 8, 0, Math.PI * 2);
  ctx.fill();

  bola.x += bola.dx;
  bola.y += bola.dy;

  if (bola.y < 0 || bola.y > 400) bola.dy *= -1;

  if (bola.x < 20 && bola.y > jogador.y && bola.y < jogador.y + 80) bola.dx *= -1;
  if (bola.x > 370 && bola.y > ia.y && bola.y < ia.y + 80) bola.dx *= -1;

  if (bola.x < 0 || bola.x > 400) iniciarPong();

  if (Math.random() < 0.6) {
    if (bola.y < ia.y + 40) ia.y -= 4;
    else if (bola.y > ia.y + 40) ia.y += 4;
  }

  requestId = requestAnimationFrame(loopPong);
}

document.addEventListener("keydown", e => {
  if (jogo !== "pong") return;
  if (e.key === "ArrowUp") jogador.y -= 20;
  if (e.key === "ArrowDown") jogador.y += 20;
});

document.querySelectorAll("#mobileControls .arrow-btn").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    if (jogo !== "pong") return;
    const dir = btn.getAttribute("data-dir");
    if (dir === "UP") jogador.y -= 20;
    if (dir === "DOWN") jogador.y += 20;
  });
});

/* ---------------- MEMÓRIA ---------------- */
const cartasEmoji = ['🍎','🍌','🍓','🍇','🍉','🍍','🥝','🍑'];
let cartas, cartaVirada = null, travar = false, acertos = 0, fase = 1;

function iniciarMemoria() {
  const container = document.getElementById("memoriaGrid");
  document.getElementById("faseAtual").textContent = "Fase " + fase;
  container.innerHTML = "";
  document.getElementById("btnIniciarMemoria").style.display = "none";
  document.getElementById("btnProximaFase").style.display = "none";
  acertos = 0;

  const totalPares = Math.min(fase + 3, cartasEmoji.length);
  const emojisUsados = cartasEmoji.slice(0, totalPares);
  cartas = [...emojisUsados, ...emojisUsados].sort(() => 0.5 - Math.random());

  cartas.forEach((emoji, index) => {
    const carta = document.createElement("div");
    carta.classList.add("carta");
    carta.dataset.index = index;
    carta.dataset.valor = emoji;
    carta.innerHTML = "";
    carta.addEventListener("click", virarCarta);
    container.appendChild(carta);
  });
}

function virarCarta(e) {
  if (travar) return;
  const carta = e.currentTarget;
  const valor = carta.dataset.valor;
  if (carta.classList.contains("virada") || carta === cartaVirada) return;

  carta.innerHTML = valor;
  carta.classList.add("virada");

  if (!cartaVirada) {
    cartaVirada = carta;
  } else {
    travar = true;
    if (carta.dataset.valor === cartaVirada.dataset.valor) {
      acertos++;
      cartaVirada = null;
      travar = false;
      if (acertos === cartas.length / 2) {
        document.getElementById("btnProximaFase").style.display = "inline-block";
      }
    } else {
      setTimeout(() => {
        carta.innerHTML = "";
        carta.classList.remove("virada");
        cartaVirada.innerHTML = "";
        cartaVirada.classList.remove("virada");
        cartaVirada = null;
        travar = false;
      }, 800);
    }
  }
}

document.getElementById("btnIniciarMemoria").addEventListener("click", iniciarMemoria);
document.getElementById("btnProximaFase").addEventListener("click", () => {
  fase++;
  iniciarMemoria();
});

const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");

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

let board = [];
let currentPiece;
let currentX;
let currentY;
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;

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

  requestAnimationFrame(update);
}

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

function iniciarTetris() {
  jogo = "tetris";
  createBoard();
  resetPiece();
  lastTime = 0;
  dropCounter = 0;
  tetrisCanvas.style.display = "block";
  update();
}
