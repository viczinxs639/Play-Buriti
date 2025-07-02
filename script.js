// === Variáveis gerais ===
let canvas, ctx, gameLoop;
let d = "";
let snake = [];
let food;
let score = 0;

let pongPlayerY = 150;
let pongAIY = 150;
let pongBallX = 200, pongBallY = 200;
let pongBallVX = 3, pongBallVY = 3; // velocidade reduzida pra Pong
let pongPlayerScore = 0, pongAIScore = 0;

let emojis = ["🍎", "🍌", "🍇", "🍒", "🍉", "🍍", "🥝", "🍑"];
let cartas = [], cartasSelecionadas = [];
let fase = 1;

// === Função para mostrar a galeria de jogos ===
function mostrarGaleria() {
  document.getElementById("telaInicial").style.display = "none";
  document.getElementById("galeriaJogos").style.display = "block";
}

// === Função para escolher o jogo ===
function iniciarJogo(jogo) {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  canvas.style.display = "none";
  document.getElementById("memoriaContainer").style.display = "none";
  document.getElementById("controlesSnake").style.display = "none";
  document.getElementById("controlesPong").style.display = "none";
  document.getElementById("controlesTetris").style.display = "none";
  document.getElementById("mobileControls").style.display = "none";
  clearInterval(gameLoop);
  d = "";
  snake = [];

  // esconder canvas do Tetris se existir
  if(window.tetrisCanvas) window.tetrisCanvas.style.display = "none";

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

// === CONTROLES PARA CELULAR ===
function setupSwipeControls(element, callbackSwipe) {
  let startX, startY;
  element.addEventListener("touchstart", function (e) {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  });
  element.addEventListener("touchend", function (e) {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
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
      const dir = btn.getAttribute("data-dir");
      callback(dir);
    });
  });
}

// === JOGO DA COBRINHA ===
function startSnake() {
  document.getElementById("controlesSnake").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = "block";
  setupSwipeControls(canvas, swipeSnake);
  setupArrowButtons(swipeSnake);
  score = 0;
  d = "RIGHT";
  snake = [];
  for (let i = 4; i >= 0; i--) snake.push({ x: i, y: 0 });
  food = {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  };
  clearInterval(gameLoop);
  gameLoop = setInterval(drawSnake, 200);
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
    headX < 0 || headY < 0 ||
    headX >= canvas.width / box || headY >= canvas.height / box ||
    snake.some(s => s.x === headX && s.y === headY)
  ) {
    clearInterval(gameLoop);
    ctx.fillStyle = "#f00";
    ctx.font = "30px Arial";
    ctx.fillText("💀 Game Over", 110, 200);
    return;
  }

  const newHead = { x: headX, y: headY };
  snake.unshift(newHead);

  if (headX === food.x && headY === food.y) {
    score++;
    food = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    };
  } else {
    snake.pop();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("Pontuação: " + score, 10, 390);
}

// === JOGO PONG ===
function startPong() {
  document.getElementById("controlesPong").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = "block";
  setupSwipeControls(canvas, pongSwipeHandler);
  setupArrowButtons(pongSwipeHandler);
  pongBallX = 200; pongBallY = 200;
  pongBallVX = 3; pongBallVY = 3;
  pongPlayerScore = 0; pongAIScore = 0;
  pongPlayerY = 150;
  pongAIY = 150;
  clearInterval(gameLoop);
  gameLoop = setInterval(drawPong, 16);
}

function pongSwipeHandler(direction) {
  if (direction === "UP") pongPlayerY -= 20;
  else if (direction === "DOWN") pongPlayerY += 20;
}

function drawPong() {
  let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#000000");
  grad.addColorStop(1, "#222222");
  ctx.fillStyle = grad;
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
  pongBallVX = pongBallVX > 0 ? 3 : -3;
  pongBallVY = (Math.random() * 4) - 2;
  pongPlayerY = canvas.height / 2 - 35;
  pongAIY = canvas.height / 2 - 35;
}

// === JOGO DA MEMÓRIA ===
function startMemoria() {
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

  const valores = emojis.slice(0, fase + 1);
  valores.push(...valores);
  valores.sort(() => 0.5 - Math.random());

  valores.forEach(valor => {
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
  carta.innerHTML = carta.dataset.valor;
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
          c.innerHTML = "❓";
        });
        cartasSelecionadas = [];
      }, 1000);
    }
  }
}

// === JOGO TETRIS ===
let tetrisCanvas, tetrisCtx;
let tetrisInterval;
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;
let board = [];
let currentPiece;
let currentX, currentY;
let gameOver = false;

const PIECES = [
  { shape: [[1,1,1,1]], color: 'cyan' },           // I
  { shape: [[1,1],[1,1]], color: 'yellow' },       // O
  { shape: [[0,1,0],[1,1,1]], color: 'purple' },   // T
  { shape: [[1,1,0],[0,1,1]], color: 'green' },    // S
  { shape: [[0,1,1],[1,1,0]], color: 'red' },      // Z
  { shape: [[1,0,0],[1,1,1]], color: 'blue' },     // J
  { shape: [[0,0,1],[1,1,1]], color: 'orange' }    // L
];

function startTetris() {
  document.getElementById("controlesTetris").style.display = "none";
  document.getElementById("controlesSnake").style.display = "none";
  document.getElementById("controlesPong").style.display = "none";
  document.getElementById("memoriaContainer").style.display = "none";
  document.getElementById("mobileControls").style.display = "block";

  if (!tetrisCanvas) {
    tetrisCanvas = document.createElement("canvas");
    tetrisCanvas.id = "tetrisCanvas";
    tetrisCanvas.width = COLS * BLOCK_SIZE;
    tetrisCanvas.height = ROWS * BLOCK_SIZE;
    tetrisCtx = tetrisCanvas.getContext("2d");
    document.body.appendChild(tetrisCanvas);

    // Controle toque para tetris
    let touchStartX = null;
    tetrisCanvas.addEventListener("touchstart", e => {
      touchStartX = e.touches[0].clientX;
    });
    tetrisCanvas.addEventListener("touchend", e => {
      if(!touchStartX) return;
      let touchEndX = e.changedTouches[0].clientX;
      let dx = touchEndX - touchStartX;
      if(dx > 30 && !collides(currentPiece.shape, currentX + 1, currentY)) currentX++;
      else if(dx < -30 && !collides(currentPiece.shape, currentX - 1, currentY)) currentX--;
      else {
        const rotated = rotate(currentPiece.shape);
        if(!collides(rotated, currentX, currentY)) currentPiece.shape = rotated;
      }
      touchStartX = null;
      drawBoard();
    });
  }

  tetrisCanvas.style.display = "block";
  canvas.style.display = "none";
  initBoard();
  spawnPiece();
  gameOver = false;
  clearInterval(tetrisInterval);
  tetrisInterval = setInterval(tetrisLoop, 400);
  drawBoard();
}

function initBoard() {
  board = [];
  for (let r=0; r<ROWS; r++) {
    board[r] = [];
    for (let c=0; c<COLS; c++) board[r][c] = 0;
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
  for(let r=0; r<ROWS; r++) {
    for(let c=0; c<COLS; c++) {
      if(board[r][c]) drawBlock(c*BLOCK_SIZE, r*BLOCK_SIZE, board[r][c]);
    }
  }
  for(let r=0; r<currentPiece.shape.length; r++) {
    for(let c=0; c<currentPiece.shape[r].length; c++) {
      if(currentPiece.shape[r][c]) drawBlock((currentX+c)*BLOCK_SIZE, (currentY+r)*BLOCK_SIZE, currentPiece.color);
    }
  }
}

function rotate(piece) {
  const result = [];
  for(let c=0; c < piece[0].length; c++) {
    const row = [];
    for(let r=piece.length-1; r >=0; r--) {
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
  for(let r=0; r<shape.length; r++) {
    for(let c=0; c<shape[r].length; c++) {
      if(shape[r][c]) {
        let newX = x + c;
        let newY = y + r;
        if(newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if(newY >= 0 && board[newY][newX]) return true;
      }
    }
  }
  return false;
}

function fixPiece() {
  for(let r=0; r<currentPiece.shape.length; r++) {
    for(let c=0; c<currentPiece.shape[r].length; c++) {
      if(currentPiece.shape[r][c]) board[currentY + r][currentX + c] = currentPiece.color;
    }
  }
}

function clearLines() {
  for(let r=ROWS-1; r>=0; r--) {
    if(board[r].every(cell => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      r++;
    }
  }
}

function tetrisLoop() {
  if(gameOver) {
    tetrisCtx.fillStyle = "white";
    tetrisCtx.font = "30px Arial";
    tetrisCtx.fillText("Game Over!", 70, 200);
    clearInterval(tetrisInterval);
    return;
  }
  if(!collides(currentPiece.shape, currentX, currentY + 1)) currentY++;
  else {
    fixPiece();
    clearLines();
    spawnPiece();
    if(collides(currentPiece.shape, currentX, currentY)) gameOver = true;
  }
  drawBoard();
}

// Controles teclado tetris
document.addEventListener("keydown", function(e){
  if(!tetrisCanvas || tetrisCanvas.style.display === "none") return;
  switch(e.key){
    case "ArrowLeft":
      if(!collides(currentPiece.shape, currentX - 1, currentY)) currentX--;
      break;
    case "ArrowRight":
      if(!collides(currentPiece.shape, currentX + 1, currentY)) currentX++;
      break;
    case "ArrowDown":
      if(!collides(currentPiece.shape, currentX, currentY + 1)) currentY++;
      break;
    case "ArrowUp":
      const rotated = rotate(currentPiece.shape);
      if(!collides(rotated, currentX, currentY)) currentPiece.shape = rotated;
      break;
  }
  drawBoard();
});
