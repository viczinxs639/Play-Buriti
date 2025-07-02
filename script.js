let jogo = null;
let requestId;

const telaInicial = document.getElementById("telaInicial");
const telaJogos = document.getElementById("telaJogos");
const btnEntrar = document.getElementById("btnEntrar");
const btnVoltar = document.getElementById("btnVoltar");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tetrisCanvas = document.getElementById("tetrisCanvas");
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
  clearTimeout(requestId);
};

// === JOGOS ===
function iniciarJogo(tipo) {
  jogo = tipo;
  telaJogos.style.display = "none";
  canvas.style.display = tipo !== "memoria" && tipo !== "tetris" ? "block" : "none";
  tetrisCanvas.style.display = tipo === "tetris" ? "block" : "none";
  memoriaContainer.style.display = tipo === "memoria" ? "block" : "none";
  mobileControls.style.display = tipo !== "memoria" ? "flex" : "none";

  cancelAnimationFrame(requestId);
  clearTimeout(requestId);

  if (tipo === "snake") iniciarSnake();
  if (tipo === "pong") iniciarPong();
  if (tipo === "memoria") iniciarMemoria();
  if (tipo === "tetris") iniciarTetris();
}

// === SNAKE ===
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let snakeInterval;

function iniciarSnake() {
  clearInterval(snakeInterval);
  snake = [{ x: 10, y: 10 }];
  dx = 1;
  dy = 0;
  score = 0;
  food = gerarComida();
  desenharSnake();
  snakeInterval = setInterval(atualizarSnake, 150);
}

function atualizarSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (colidiu(head)) {
    clearInterval(snakeInterval);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    setTimeout(iniciarSnake, 2000);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = gerarComida();
  } else {
    snake.pop();
  }

  desenharSnake();
}

function desenharSnake() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f39c12";
  snake.forEach(s => ctx.fillRect(s.x * 20, s.y * 20, 18, 18));

  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(food.x * 20, food.y * 20, 18, 18);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontuação: " + score, 10, 20);
}

function gerarComida() {
  let nova;
  do {
    nova = {
      x: Math.floor(Math.random() * (canvas.width / 20)),
      y: Math.floor(Math.random() * (canvas.height / 20))
    };
  } while (snake.some(s => s.x === nova.x && s.y === nova.y));
  return nova;
}

function colidiu(head) {
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
  btn.addEventListener("touchstart", () => {
    if (jogo !== "snake") return;
    const dir = btn.getAttribute("data-dir");
    if (dir === "UP" && dy === 0) { dx = 0; dy = -1; }
    else if (dir === "DOWN" && dy === 0) { dx = 0; dy = 1; }
    else if (dir === "LEFT" && dx === 0) { dx = -1; dy = 0; }
    else if (dir === "RIGHT" && dx === 0) { dx = 1; dy = 0; }
  });
});


// Controles Snake
document.addEventListener("keydown", e => {
  if (jogo !== "snake") return;
  if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
  else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
  else if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
  else if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
});

// Controles Touch Snake
document.querySelectorAll("#mobileControls .arrow-btn").forEach(btn => {
  btn.addEventListener("touchstart", () => {
    if (jogo !== "snake") return;
    const dir = btn.getAttribute("data-dir");
    if (dir === "UP" && dy === 0) { dx = 0; dy = -1; }
    else if (dir === "DOWN" && dy === 0) { dx = 0; dy = 1; }
    else if (dir === "LEFT" && dx === 0) { dx = -1; dy = 0; }
    else if (dir === "RIGHT" && dx === 0) { dx = 1; dy = 0; }
  });
});


// === Controles Snake e Pong ===
document.addEventListener("keydown", e => {
  if (jogo === "snake") {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
    else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
    else if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
    else if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
  }

  if (jogo === "pong") {
    if (e.key === "ArrowUp") jogador.y -= 20;
    if (e.key === "ArrowDown") jogador.y += 20;
  }
});

document.querySelectorAll("#mobileControls .arrow-btn").forEach(btn => {
  btn.addEventListener("touchstart", () => {
    const dir = btn.getAttribute("data-dir");
    if (jogo === "snake") {
      if (dir === "UP" && dy === 0) { dx = 0; dy = -1; }
      else if (dir === "DOWN" && dy === 0) { dx = 0; dy = 1; }
      else if (dir === "LEFT" && dx === 0) { dx = -1; dy = 0; }
      else if (dir === "RIGHT" && dx === 0) { dx = 1; dy = 0; }
    }

    if (jogo === "pong") {
      if (dir === "UP") jogador.y -= 20;
      if (dir === "DOWN") jogador.y += 20;
    }
  });
});

// === PONG ===
let bola, jogador, ia;

function iniciarPong() {
  bola = { x: 200, y: 200, dx: 3, dy: 2 };
  jogador = { y: 150 };
  ia = { y: 150 };
  loopPong();
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

  // IA com 60% de chance de seguir
  if (Math.random() < 0.6) {
    if (bola.y < ia.y + 40) ia.y -= 4;
    else if (bola.y > ia.y + 40) ia.y += 4;
  }

  requestId = requestAnimationFrame(loopPong);
}

// === JOGO DA MEMÓRIA ===
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
  if (carta.classList.contains("virada") || carta === cartaVirada) return;

  carta.innerHTML = carta.dataset.valor;
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
  '#00f0f0', // I - cyan
  '#0000f0', // J - blue
  '#f0a000', // L - orange
  '#f0f000', // O - yellow
  '#00f000', // S - green
  '#a000f0', // T - purple
  '#f00000'  // Z - red
];

// Formas das peças
const SHAPES = [
  [],
  [[1,1,1,1]],              // I
  [[2,0,0],[2,2,2]],        // J
  [[0,0,3],[3,3,3]],        // L
  [[4,4],[4,4]],            // O
  [[0,5,5],[5,5,0]],        // S
  [[0,6,0],[6,6,6]],        // T
  [[7,7,0],[0,7,7]]         // Z
];

let board = [];
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let dropInterval = 500;
let dropCounter = 0;
let lastTime = 0;
let score = 0;

function createBoard() {
  board = [];
  for(let r=0; r<ROWS; r++) {
    board.push(new Array(COLS).fill(0));
  }
}

function drawBlock(x, y, colorIndex) {
  if (colorIndex) {
    tetrisCtx.fillStyle = COLORS[colorIndex];
    tetrisCtx.fillRect(x, y, 1, 1);
    tetrisCtx.strokeStyle = 'black';
    tetrisCtx.lineWidth = 0.1;
    tetrisCtx.strokeRect(x, y, 1, 1);
  }
}

function drawBoard() {
  for(let r=0; r<ROWS; r++) {
    for(let c=0; c<COLS; c++) {
      drawBlock(c, r, board[r][c]);
    }
  }
}

function drawPiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawBlock(currentX + x, currentY + y, value);
      }
    });
  });
}

function collide(board, piece, posX, posY) {
  for(let y=0; y < piece.length; y++) {
    for(let x=0; x < piece[y].length; x++) {
      if (piece[y][x]) {
        let boardX = posX + x;
        let boardY = posY + y;
        if (
          boardX < 0 ||
          boardX >= COLS ||
          boardY >= ROWS ||
          (boardY >= 0 && board[boardY][boardX] !== 0)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge(board, piece, posX, posY) {
  piece.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value && posY + y >= 0) {
        board[posY + y][posX + x] = value;
      }
    });
  });
}

function rotate(matrix) {
  // Rotaciona matriz 90 graus no sentido horário
  const N = matrix.length;
  const result = [];
  for(let x=0; x<N; x++) {
    const row = [];
    for(let y=N-1; y>=0; y--) {
      row.push(matrix[y][x] || 0);
    }
    result.push(row);
  }
  return result;
}

function clearLines() {
  let linesCleared = 0;
  outer: for(let y=ROWS-1; y>=0; y--) {
    for(let x=0; x<COLS; x++) {
      if(board[y][x] === 0) {
        continue outer;
      }
    }
    // linha cheia
    board.splice(y,1);
    board.unshift(new Array(COLS).fill(0));
    linesCleared++;
    y++;
  }
  if(linesCleared > 0) {
    score += linesCleared * 10;
    updateScore();
  }
}

function updateScore() {
  // Você pode criar um elemento para mostrar a pontuação se quiser
  console.log("Score:", score);
}

function newPiece() {
  const id = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
  return {
    shape: SHAPES[id],
    id: id
  };
}

function resetPiece() {
  currentPiece = newPiece();
  currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
  currentY = -1; // começa fora da tela para cair de cima

  if(collide(board, currentPiece.shape, currentX, currentY)) {
    alert("Game Over! Sua pontuação: " + score);
    createBoard();
    score = 0;
    updateScore();
  }
}

function drop() {
  if(!collide(board, currentPiece.shape, currentX, currentY +1)) {
    currentY++;
  } else {
    merge(board, currentPiece.shape, currentX, currentY);
    clearLines();
    resetPiece();
  }
  dropCounter = 0;
}

function move(dir) {
  const newX = currentX + dir;
  if(!collide(board, currentPiece.shape, newX, currentY)) {
    currentX = newX;
  }
}

function rotatePiece() {
  const rotated = rotate(currentPiece.shape);
  if(!collide(board, rotated, currentX, currentY)) {
    currentPiece.shape = rotated;
  }
}

function update(time = 0) {
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

// Controles do teclado
document.addEventListener('keydown', e => {
  if(jogo !== 'tetris') return; // só funciona se o jogo atual for tetris

  if(e.key === 'ArrowLeft') {
    move(-1);
  } else if(e.key === 'ArrowRight') {
    move(1);
  } else if(e.key === 'ArrowDown') {
    drop();
  } else if(e.key === 'ArrowUp') {
    rotatePiece();
  }
});

function iniciarTetris() {
  createBoard();
  score = 0;
  updateScore();
  resetPiece();
  lastTime = 0;
  dropCounter = 0;
  update();
}
