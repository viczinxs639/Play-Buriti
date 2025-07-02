// Variáveis globais para os jogos
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let gameLoop;
let d = "";
let snake = [];
let food;
let score = 0;

let pongPlayerY = 150;
let pongAIY = 150;
let pongBallX = 200, pongBallY = 200;
let pongBallVX = 3, pongBallVY = 3;
let pongPlayerScore = 0, pongAIScore = 0;

let emojis = ["🍎", "🍌", "🍇", "🍒", "🍉", "🍍", "🥝", "🍑"];
let cartas = [], cartasSelecionadas = [];
let fase = 1;

// Tetris variáveis
const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;
let board = [];
let currentPiece;
let currentX, currentY;
let gameOver = false;
let tetrisInterval;

const PIECES = [
  { shape: [[1,1,1,1]], color: 'cyan' },           // I
  { shape: [[1,1],[1,1]], color: 'yellow' },       // O
  { shape: [[0,1,0],[1,1,1]], color: 'purple' },   // T
  { shape: [[1,1,0],[0,1,1]], color: 'green' },    // S
  { shape: [[0,1,1],[1,1,0]], color: 'red' },      // Z
  { shape: [[1,0,0],[1,1,1]], color: 'blue' },     // J
  { shape: [[0,0,1],[1,1,1]], color: 'orange' }    // L
];

// Variável para identificar o jogo ativo
let jogoAtivo = null;

// Mostra a galeria de jogos (chamado na tela inicial)
function iniciarJogo(jogo) {
  clearInterval(gameLoop);
  gameLoop = null;
  d = "";
  snake = [];
  cartasSelecionadas = [];
  cartas = [];
  fase = 1;
  score = 0;
  jogoAtivo = jogo;

  canvas.style.display = "none";
  tetrisCanvas.style.display = "none";
  document.getElementById("memoriaContainer").style.display = "none";
  document.getElementById("mobileControls").style.display = "none";
  document.getElementById("controlesSnake").style.display = "none";
  document.getElementById("controlesPong").style.display = "none";
  document.getElementById("controlesTetris").style.display = "none";

  if (jogo === "snake") {
    document.getElementById("controlesSnake").style.display = "block";
  } else if (jogo === "pong") {
    document.getElementById("controlesPong").style.display = "block";
  } else if (jogo === "memoria") {
    startMemoria();
  } else if (jogo === "tetris") {
    document.getElementById("controlesTetris").style.display = "block";
  }
}

// --- CONTROLES CELULAR ---
function setupSwipeControls(element, callbackSwipe) {
  let startX, startY;
  element.addEventListener("touchstart", e => {
    let t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  });
  element.addEventListener("touchend", e => {
    let t = e.changedTouches[0];
    let dx = t.clientX - startX;
    let dy = t.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20) callbackSwipe("RIGHT");
      else if (dx < -20) callbackSwipe("LEFT");
    } else {
      if (dy > 20) callbackSwipe("DOWN");
      else if (dy < -20) callbackSwipe("UP");
    }
  });
}

function setupArrowButtons(callback) {
  const buttons = document.querySelectorAll(".arrow-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      let dir = btn.getAttribute("data-dir");
      callback(dir);
    });
  });
}

// FUNÇÃO QUE ESCUTA O TECLADO PARA TODOS OS JOGOS
document.addEventListener("keydown", function (e) {
  // Se no celular, ignore o teclado para não conflitar
  if (isMobile()) return;

  if (jogoAtivo === "snake") {
    switch (e.key) {
      case "ArrowLeft":
        if (d !== "RIGHT") d = "LEFT";
        break;
      case "ArrowUp":
        if (d !== "DOWN") d = "UP";
        break;
      case "ArrowRight":
        if (d !== "LEFT") d = "RIGHT";
        break;
      case "ArrowDown":
        if (d !== "UP") d = "DOWN";
        break;
    }
  } else if (jogoAtivo === "pong") {
    const step = 15;
    if (e.key === "ArrowUp") pongPlayerY -= step;
    else if (e.key === "ArrowDown") pongPlayerY += step;
  } else if (jogoAtivo === "tetris") {
    switch (e.key) {
      case "ArrowLeft":
        if (!collides(currentPiece.shape, currentX - 1, currentY)) currentX--;
        break;
      case "ArrowRight":
        if (!collides(currentPiece.shape, currentX + 1, currentY)) currentX++;
        break;
      case "ArrowDown":
        if (!collides(currentPiece.shape, currentX, currentY + 1)) currentY++;
        break;
      case "ArrowUp":
        const rotated = rotate(currentPiece.shape);
        if (!collides(rotated, currentX, currentY)) currentPiece.shape = rotated;
        break;
    }
    drawBoard();
  }
});

// Função para detectar celular (simplificada)
function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// === SNAKE ===
function startSnake() {
  jogoAtivo = "snake";
  document.getElementById("controlesSnake").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = isMobile() ? "block" : "none";

  if (isMobile()) {
    setupSwipeControls(canvas, swipeSnake);
    setupArrowButtons(swipeSnake);
  }

  score = 0;
  d = "RIGHT";
  snake = [];
  for (let i = 4; i >= 0; i--) snake.push({ x: i, y: 0 });
  food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };

  clearInterval(gameLoop);
  gameLoop = setInterval(drawSnake, 250);
}

function swipeSnake(direction) {
  if (direction === "LEFT" && d !== "RIGHT") d = "LEFT";
  else if (direction === "UP" && d !== "DOWN") d = "UP";
  else if (direction === "RIGHT" && d !== "LEFT") d = "RIGHT";
  else if (direction === "DOWN" && d !== "UP") d = "DOWN";
}

function drawSnake() {
  const box = 20;
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#39FF14" : "#0B610B";
    ctx.fillRect(snake[i].x * box, snake[i].y * box, box, box);
    ctx.strokeStyle = "#040";
    ctx.strokeRect(snake[i].x * box, snake[i].y * box, box, box);
  }

  ctx.fillStyle = "#FF4500";
  ctx.fillRect(food.x * box, food.y * box, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (d === "LEFT") headX--;
  if (d === "UP") headY--;
  if (d === "RIGHT") headX++;
  if (d === "DOWN") headY++;

  if (
    headX < 0 || headX >= 20 ||
    headY < 0 || headY >= 20 ||
    snake.some(seg => seg.x === headX && seg.y === headY)
  ) {
    clearInterval(gameLoop);
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 90, 200);
    return;
  }

  if (headX === food.x && headY === food.y) {
    score++;
    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
  } else {
    snake.pop();
  }

  snake.unshift({ x: headX, y: headY });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Pontuação: " + score, 10, 390);
}

// === PONG ===
let pongBallSpeed = 3;
function startPong() {
  jogoAtivo = "pong";
  document.getElementById("controlesPong").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = isMobile() ? "block" : "none";

  pongPlayerY = canvas.height / 2 - 35;
  pongAIY = canvas.height / 2 - 35;
  pongBallX = canvas.width / 2;
  pongBallY = canvas.height / 2;
  pongBallVX = pongBallSpeed * (Math.random() > 0.5 ? 1 : -1);
  pongBallVY = (Math.random() * 4) - 2;
  pongPlayerScore = 0;
  pongAIScore = 0;

  if (isMobile()) {
    setupSwipeControls(canvas, swipePong);
    setupArrowButtons(swipePong);
  }

  clearInterval(gameLoop);
  gameLoop = setInterval(drawPong, 20);
}

function swipePong(direction) {
  const step = 15;
  if (direction === "UP") pongPlayerY -= step;
  else if (direction === "DOWN") pongPlayerY += step;
}

function drawPong() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (pongPlayerY < 0) pongPlayerY = 0;
  if (pongPlayerY > canvas.height - 70) pongPlayerY = canvas.height - 70;
  if (pongAIY < 0) pongAIY = 0;
  if (pongAIY > canvas.height - 70) pongAIY = canvas.height - 70;

  // Raquete jogador
  ctx.fillStyle = "#9b59b6";
  ctx.fillRect(10, pongPlayerY, 10, 70);

  // Raquete IA
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(canvas.width - 20, pongAIY, 10, 70);

  // Bola
  ctx.fillStyle = "#1abc9c";
  ctx.beginPath();
  ctx.arc(pongBallX, pongBallY, 10, 0, Math.PI * 2);
  ctx.fill();

  // Movimento da bola
  pongBallX += pongBallVX;
  pongBallY += pongBallVY;

  // Colisão com teto e chão
  if (pongBallY + 10 > canvas.height || pongBallY - 10 < 0) pongBallVY = -pongBallVY;

  // Colisão com raquetes
  if (
    pongBallX - 10 < 20 &&
    pongBallY > pongPlayerY && pongBallY < pongPlayerY + 70
  ) {
    pongBallVX = -pongBallVX;
  }

  if (
    pongBallX + 10 > canvas.width - 20 &&
    pongBallY > pongAIY && pongBallY < pongAIY + 70
  ) {
    pongBallVX = -pongBallVX;
  }

  // IA se move (60% chance de acertar)
  if (Math.random() < 0.6) {
    if (pongBallY > pongAIY + 35) pongAIY += 3;
    else if (pongBallY < pongAIY + 35) pongAIY -= 3;
  }

  // Pontuação
  if (pongBallX < 0) {
    pongAIScore++;
    resetPong();
  }
  if (pongBallX > canvas.width) {
    pongPlayerScore++;
    resetPong();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Jogador: ${pongPlayerScore}`, 50, 30);
  ctx.fillText(`IA: ${pongAIScore}`, canvas.width - 120, 30);
}

function resetPong() {
  pongBallX = canvas.width / 2;
  pongBallY = canvas.height / 2;
  pongBallVX = pongBallSpeed * (Math.random() > 0.5 ? 1 : -1);
  pongBallVY = (Math.random() * 4) - 2;
  pongPlayerY = canvas.height / 2 - 35;
  pongAIY = canvas.height / 2 - 35;
}

// === JOGO DA MEMÓRIA ===
function startMemoria() {
  jogoAtivo = "memoria";
  document.getElementById("memoriaContainer").style.display = "block";
  document.getElementById("galeriaJogos").style.display = "none";
  document.getElementById("mobileControls").style.display = "none";
  document.getElementById("controlesSnake").style.display = "none";
  document.getElementById("controlesPong").style.display = "none";
  document.getElementById("controlesTetris").style.display = "none";

  fase = 1;
  criarFase(fase);

  document.getElementById("btnIniciarMemoria").onclick = () => {
    cartas.forEach(c => {
      c.classList.remove("revelada");
      c.innerHTML = "❓";
      c.style.pointerEvents = "auto";
    });
    cartasSelecionadas = [];
  };

  document.getElementById("btnProximaFase").onclick = () => {
    fase++;
    criarFase(fase);
    document.getElementById("btnProximaFase").style.display = "none";
  };
}

function criarFase(fase) {
  document.getElementById("btnProximaFase").style.display = "none";
  const cartasContainer = document.getElementById("cartasContainer");
  cartasContainer.innerHTML = "";
  cartasSelecionadas = [];
  cartas = [];

  const valores = emojis.slice(0, Math.min(fase + 1, emojis.length));
  const valoresDuplicados = valores.concat(valores);
  valoresDuplicados.sort(() => 0.5 - Math.random());

  valoresDuplicados.forEach(valor => {
    const card = document.createElement("div");
    card.className = "card-memoria";
    card.dataset.valor = valor;
    card.textContent = "❓";
    card.onclick = () => selecionarCarta(card);
    cartasContainer.appendChild(card);
    cartas.push(card);
  });

  document.getElementById("memoriaFase").innerText = "Fase: " + fase;
}

function selecionarCarta(carta) {
  if (cartasSelecionadas.length >= 2 || carta.classList.contains("revelada")) return;
  carta.classList.add("revelada");
  carta.textContent = carta.dataset.valor;
  cartasSelecionadas.push(carta);

  if (cartasSelecionadas.length === 2) {
    if (cartasSelecionadas[0].dataset.valor === cartasSelecionadas[1].dataset.valor) {
      cartasSelecionadas = [];
      if (cartas.every(c => c.classList.contains("revelada"))) {
        document.getElementById("btnProximaFase").style.display = "inline-block";
      }
    } else {
      setTimeout(() => {
        cartasSelecionadas.forEach(c => {
          c.classList.remove("revelada");
          c.textContent = "❓";
        });
        cartasSelecionadas = [];
      }, 1000);
    }
  }
}

// === JOGO TETRIS ===
function startTetris() {
  jogoAtivo = "tetris";
  document.getElementById("controlesTetris").style.display = "none";
  document.getElementById("controlesSnake").style.display = "none";
  document.getElementById("controlesPong").style.display = "none";
  document.getElementById("memoriaContainer").style.display = "none";
  document.getElementById("mobileControls").style.display = isMobile() ? "block" : "none";
  canvas.style.display = "none";
  tetrisCanvas.style.display = "block";

  initBoard();
  spawnPiece();
  gameOver = false;
  clearInterval(tetrisInterval);
  tetrisInterval = setInterval(tetrisLoop, 400);
  drawBoard();
}

function initBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = 0;
    }
  }
}

function drawBlock(x, y, color) {
  tetrisCtx.fillStyle = color;
  tetrisCtx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  tetrisCtx.strokeStyle = "#222";
  tetrisCtx.lineWidth = 2;
  tetrisCtx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
  tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawBlock(c * BLOCK_SIZE, r * BLOCK_SIZE, board[r][c]);
    }
  }
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c]) drawBlock((currentX + c) * BLOCK_SIZE, (currentY + r) * BLOCK_SIZE, currentPiece.color);
    }
  }
}

function rotate(piece) {
  const result = [];
  for (let c = 0; c < piece[0].length; c++) {
    const row = [];
    for (let r = piece.length - 1; r >= 0; r--) {
      row.push(piece[r][c]);
    }
    result.push(row);
  }
  return result;
}

function spawnPiece() {
  currentPiece = JSON.parse(JSON.stringify(PIECES[Math.floor(Math.random() * PIECES.length)]));
  currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
  currentY = 0;
}

function collides(shape, x, y) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        let newX = x + c;
        let newY = y + r;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if (newY >= 0 && board[newY][newX]) return true;
      }
    }
  }
  return false;
}

function fixPiece() {
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c]) board[currentY + r][currentX + c] = currentPiece.color;
    }
  }
}

function clearLines() {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      r++;
    }
  }
}

function tetrisLoop() {
  if (gameOver) {
    tetrisCtx.fillStyle = "white";
    tetrisCtx.font = "30px Arial";
    tetrisCtx.fillText("Game Over!", 40, 200);
    clearInterval(tetrisInterval);
    return;
  }
  if (!collides(currentPiece.shape, currentX, currentY + 1)) currentY++;
  else {
    fixPiece();
    clearLines();
    spawnPiece();
    if (collides(currentPiece.shape, currentX, currentY)) gameOver = true;
  }
  drawBoard();
}
