// --------------------
// VARIÁVEIS GLOBAIS
// --------------------
let jogo = null;
const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");
const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");

// --------------------
// TELA INICIAL E NAVEGAÇÃO
// --------------------
document.getElementById("btnEntrar").addEventListener("click", () => {
  document.getElementById("telaInicial").style.display = "none";
  document.getElementById("telaJogos").style.display = "block";
  hideAllGames();
  hideMobileControls();
});

document.getElementById("btnVoltar").addEventListener("click", () => {
  document.getElementById("telaJogos").style.display = "block";
  hideAllGames();
  document.getElementById("memoriaContainer").style.display = "none";
  jogo = null;
  hideMobileControls();
});

function iniciarJogo(tipo) {
  jogo = tipo;
  document.getElementById("telaJogos").style.display = "none";
  hideAllGames();
  if (tipo === "snake") startSnake();
  else if (tipo === "pong") startPong();
  else if (tipo === "memoria") startMemoria();
  else if (tipo === "tetris") startTetris();
}

// --------------------
// AUXILIARES
// --------------------
function hideAllGames() {
  gameCanvas.style.display = "none";
  tetrisCanvas.style.display = "none";
  document.getElementById("memoriaContainer").style.display = "none";
}

function showMobileControls() {
  document.getElementById("mobileControls").style.display = "flex";
}

function hideMobileControls() {
  document.getElementById("mobileControls").style.display = "none";
}

// Detecta se é celular pelo userAgent simplificado
function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
}

// --------------------
// JOGO SNAKE
// --------------------
let snake = [];
let food = {};
let dx = 0, dy = 0;
let snakeLoop;
let snakeScore = 0;

function startSnake() {
  gameCanvas.style.display = "block";
  showMobileControls();
  snake = [{x: 10, y: 10}];
  dx = 1; dy = 0;
  food = randomPosition();
  snakeScore = 0;
  clearInterval(snakeLoop);
  snakeLoop = setInterval(updateSnake, 200);
}

function randomPosition() {
  return { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
}

function updateSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Colisão com paredes ou corpo
  if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) {
    clearInterval(snakeLoop);
    alert("Game Over! Pontuação: " + snakeScore);
    startSnake();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    snakeScore++;
    food = randomPosition();
  } else {
    snake.pop();
  }

  // Desenhar fundo com textura quadriculada
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? "#2c3e50" : "#34495e";
      ctx.fillRect(i * 20, j * 20, 20, 20);
    }
  }

  // Desenhar comida
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Desenhar cobra com textura verde
  ctx.fillStyle = "#0f0";
  snake.forEach(part => ctx.fillRect(part.x * 20, part.y * 20, 20, 20));

  // Pontuação
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontos: " + snakeScore, 10, 20);
}

// Controles teclado
window.addEventListener("keydown", e => {
  if (jogo !== "snake") return;
  if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
  else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
  else if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
  else if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
});

// Controles mobile
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

// --------------------
// JOGO PONG COM IA 60% DE ACERTO
// --------------------
let pongLoop;
let pongBall = { x: 200, y: 200, vx: 4, vy: 4, radius: 10 };
let pongPlayer = { x: 10, y: 175, width: 10, height: 50, dy: 0 };
let pongAI = { x: 380, y: 175, width: 10, height: 50, dy: 0 };
let pongScore = { player: 0, ai: 0 };
const pongSpeed = 4;

function startPong() {
  gameCanvas.style.display = "block";
  showMobileControls();
  pongBall = { x: 200, y: 200, vx: 4, vy: 4, radius: 10 };
  pongPlayer = { x: 10, y: 175, width: 10, height: 50, dy: 0 };
  pongAI = { x: 380, y: 175, width: 10, height: 50, dy: 0 };
  pongScore = { player: 0, ai: 0 };
  clearInterval(pongLoop);
  pongLoop = setInterval(updatePong, 20);
}

// AI com chance de acerto 60%
function aiMove() {
  let chance = Math.random();
  if (chance <= 0.6) { // 60% chance de seguir bola
    if (pongBall.y > pongAI.y + pongAI.height / 2) pongAI.dy = pongSpeed * 0.6;
    else if (pongBall.y < pongAI.y + pongAI.height / 2) pongAI.dy = -pongSpeed * 0.6;
    else pongAI.dy = 0;
  } else {
    pongAI.dy = 0; // 40% chance não se move
  }
  pongAI.y += pongAI.dy;
  if (pongAI.y < 0) pongAI.y = 0;
  if (pongAI.y + pongAI.height > 400) pongAI.y = 400 - pongAI.height;
}

function updatePong() {
  pongBall.x += pongBall.vx;
  pongBall.y += pongBall.vy;

  if (pongBall.y + pongBall.radius > 400 || pongBall.y - pongBall.radius < 0) {
    pongBall.vy = -pongBall.vy;
  }

  if (
    pongBall.x - pongBall.radius < pongPlayer.x + pongPlayer.width &&
    pongBall.y > pongPlayer.y &&
    pongBall.y < pongPlayer.y + pongPlayer.height
  ) {
    pongBall.vx = -pongBall.vx;
  }

  if (
    pongBall.x + pongBall.radius > pongAI.x &&
    pongBall.y > pongAI.y &&
    pongBall.y < pongAI.y + pongAI.height
  ) {
    pongBall.vx = -pongBall.vx;
  }

  if (pongBall.x - pongBall.radius < 0) {
    pongScore.ai++;
    resetPongBall();
  } else if (pongBall.x + pongBall.radius > 400) {
    pongScore.player++;
    resetPongBall();
  }

  pongPlayer.y += pongPlayer.dy;
  if (pongPlayer.y < 0) pongPlayer.y = 0;
  if (pongPlayer.y + pongPlayer.height > 400) pongPlayer.y = 400 - pongPlayer.height;

  aiMove();

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(pongBall.x, pongBall.y, pongBall.radius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = "#3498db";
  ctx.fillRect(pongPlayer.x, pongPlayer.y, pongPlayer.width, pongPlayer.height);
  ctx.fillStyle = "#e67e22";
  ctx.fillRect(pongAI.x, pongAI.y, pongAI.width, pongAI.height);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Jogador: ${pongScore.player}`, 10, 20);
  ctx.fillText(`IA: ${pongScore.ai}`, 300, 20);
}

function resetPongBall() {
  pongBall.x = 200;
  pongBall.y = 200;
  pongBall.vx = -pongBall.vx;
  pongBall.vy = 4 * (Math.random() > 0.5 ? 1 : -1);
}

window.addEventListener("keydown", e => {
  if (jogo !== "pong") return;
  if (e.key === "ArrowUp") pongPlayer.dy = -pongSpeed;
  else if (e.key === "ArrowDown") pongPlayer.dy = pongSpeed;
});

window.addEventListener("keyup", e => {
  if (jogo !== "pong") return;
  if (e.key === "ArrowUp" || e.key === "ArrowDown") pongPlayer.dy = 0;
});

document.querySelectorAll("#mobileControls .arrow-btn").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    if (jogo !== "pong") return;
    const dir = btn.getAttribute("data-dir");
    if (dir === "UP") pongPlayer.dy = -pongSpeed;
    else if (dir === "DOWN") pongPlayer.dy = pongSpeed;
  });
  btn.addEventListener("touchend", e => {
    if (jogo !== "pong") return;
    pongPlayer.dy = 0;
  });
});

// --------------------
// JOGO DA MEMÓRIA COM FASES E IMAGENS
// --------------------
const memoriaGrid = document.getElementById("memoriaGrid");
const btnIniciarMemoria = document.getElementById("btnIniciarMemoria");
const btnProximaFase = document.getElementById("btnProximaFase");
const faseAtualTexto = document.getElementById("faseAtual");

let memoriaFase = 1;
let cartas = [];
let cartasReveladas = [];
let paresEncontrados = 0;

const imagensMemoria = [
  "https://i.imgur.com/7v9jI5h.png", // maçã
  "https://i.imgur.com/NPz5XzT.png", // banana
  "https://i.imgur.com/EtbYTgM.png", // cereja
  "https://i.imgur.com/YChNOOe.png", // uva
  "https://i.imgur.com/5EmRyqE.png", // morango
  "https://i.imgur.com/EsH54yX.png", // limão
  "https://i.imgur.com/vjCPvPz.png", // laranja
  "https://i.imgur.com/YPhSg8p.png"  // kiwi
];

function startMemoria() {
  document.getElementById("memoriaContainer").style.display = "block";
  memoriaFase = 1;
  btnProximaFase.style.display = "none";
  faseAtualTexto.textContent = `Fase ${memoriaFase}`;
  montarTabuleiro();
}

function montarTabuleiro() {
  memoriaGrid.innerHTML = "";
  cartasReveladas = [];
  paresEncontrados = 0;

  let qtdPares = Math.min(memoriaFase + 1, imagensMemoria.length);
  let selecionadas = imagensMemoria.slice(0, qtdPares);

  cartas = [...selecionadas, ...selecionadas];
  cartas.sort(() => 0.5 - Math.random());

  memoriaGrid.style.gridTemplateColumns = `repeat(${qtdPares}, 70px)`;

  cartas.forEach((img, index) => {
    const div = document.createElement("div");
    div.classList.add("carta");
    div.dataset.index = index;
    div.innerHTML = `<img src="https://i.imgur.com/8n7vFhM.png" alt="carta" width="60" height="60">`; // verso da carta
    div.addEventListener("click", () => revelarCarta(div));
    memoriaGrid.appendChild(div);
  });
}

function revelarCarta(div) {
  if (cartasReveladas.length >= 2 || div.classList.contains("revelada")) return;
  const idx = parseInt(div.dataset.index);
  div.innerHTML = `<img src="${cartas[idx]}" alt="img" width="60" height="60">`;
  div.classList.add("revelada");
  cartasReveladas.push(div);

  if (cartasReveladas.length === 2) {
    const i1 = parseInt(cartasReveladas[0].dataset.index);
    const i2 = parseInt(cartasReveladas[1].dataset.index);
    if (cartas[i1] === cartas[i2]) {
      paresEncontrados++;
      cartasReveladas = [];
      if (paresEncontrados === cartas.length / 2) {
        btnProximaFase.style.display = "inline-block";
      }
    } else {
      setTimeout(() => {
        cartasReveladas.forEach(c => {
          c.classList.remove("revelada");
          c.innerHTML = `<img src="https://i.imgur.com/8n7vFhM.png" alt="carta" width="60" height="60">`;
        });
        cartasReveladas = [];
      }, 1000);
    }
  }
}

btnIniciarMemoria.onclick = () => {
  montarTabuleiro();
  btnProximaFase.style.display = "none";
};

btnProximaFase.onclick = () => {
  memoriaFase++;
  faseAtualTexto.textContent = `Fase ${memoriaFase}`;
  montarTabuleiro();
  btnProximaFase.style.display = "none";
};

// --------------------
// JOGO TETRIS COLORIDO SIMPLES
// --------------------
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

tetrisCanvas.width = COLS * BLOCK_SIZE;
tetrisCanvas.height = ROWS * BLOCK_SIZE;

const COLORS = [
  null,
  "#00f0f0", // cyan
  "#0000f0", // blue
  "#f0a000", // orange
  "#f0f000", // yellow
  "#00f000", // green
  "#a000f0", // purple
  "#f00000"  // red
];

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

let tetrisGrid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let tetrisLoop;
let tetrisSpeed = 600;

function startTetris() {
  tetrisCanvas.style.display = "block";
  showMobileControls();
  tetrisGrid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  spawnPiece();
  clearInterval(tetrisLoop);
  tetrisLoop = setInterval(tetrisUpdate, tetrisSpeed);
}

function spawnPiece() {
  const id = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
  currentPiece = SHAPES[id];
  currentX = Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2);
  currentY = 0;
}

function tetrisUpdate() {
  if (!movePiece(0, 1)) {
    placePiece();
    clearLines();
    spawnPiece();
    if (collision(currentX, currentY, currentPiece)) {
      clearInterval(tetrisLoop);
      alert("Fim de jogo!");
      hideMobileControls();
    }
  }
  drawTetris();
}

function collision(x, y, piece) {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (piece[r][c]) {
        let nx = x + c;
        let ny = y + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && tetrisGrid[ny][nx]) return true;
      }
    }
  }
  return false;
}

function movePiece(dx, dy) {
  if (!collision(currentX + dx, currentY + dy, currentPiece)) {
    currentX += dx;
    currentY += dy;
    return true;
  }
  return false;
}

function placePiece() {
  for (let r = 0; r < currentPiece.length; r++) {
    for (let c = 0; c < currentPiece[r].length; c++) {
      if (currentPiece[r][c]) {
        let nx = currentX + c;
        let ny = currentY + r;
        if(ny >= 0) tetrisGrid[ny][nx] = currentPiece[r][c];
      }
    }
  }
}

function clearLines() {
  for(let r = ROWS -1; r >= 0; r--) {
    if(tetrisGrid[r].every(c => c !== 0)) {
      tetrisGrid.splice(r,1);
      tetrisGrid.unshift(new Array(COLS).fill(0));
      r++;
    }
  }
}

function drawTetris() {
  tetrisCtx.fillStyle = "#222";
  tetrisCtx.fillRect(0,0,tetrisCanvas.width,tetrisCanvas.height);

  for(let r = 0; r < ROWS; r++) {
    for(let c = 0; c < COLS; c++) {
      const val = tetrisGrid[r][c];
      if(val) {
        tetrisCtx.fillStyle = COLORS[val];
        tetrisCtx.fillRect(c*BLOCK_SIZE,r*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        tetrisCtx.strokeStyle = "#111";
        tetrisCtx.strokeRect(c*BLOCK_SIZE,r*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
      }
    }
  }

  // desenha peça atual
  for(let r = 0; r < currentPiece.length; r++) {
    for(let c = 0; c < currentPiece[r].length; c++) {
      if(currentPiece[r][c]) {
        let x = (currentX + c)*BLOCK_SIZE;
        let y = (currentY + r)*BLOCK_SIZE;
        tetrisCtx.fillStyle = COLORS[currentPiece[r][c]];
        tetrisCtx.fillRect(x,y,BLOCK_SIZE,BLOCK_SIZE);
        tetrisCtx.strokeStyle = "#111";
        tetrisCtx.strokeRect(x,y,BLOCK_SIZE,BLOCK_SIZE);
      }
    }
  }
}

// Controles teclado tetris
window.addEventListener("keydown", e => {
  if(jogo !== "tetris") return;
  if(e.key === "ArrowLeft") movePiece(-1,0);
  else if(e.key === "ArrowRight") movePiece(1,0);
  else if(e.key === "ArrowDown") movePiece(0,1);
  else if(e.key === "ArrowUp") rotatePiece();
});

function rotatePiece() {
  let rotated = [];
  for(let c = 0; c < currentPiece[0].length; c++) {
    let newRow = [];
    for(let r = currentPiece.length -1; r >= 0; r--) {
      newRow.push(currentPiece[r][c]);
    }
    rotated.push(newRow);
  }
  if(!collision(currentX, currentY, rotated)) {
    currentPiece = rotated;
  }
}

// Controles mobile para tetris
document.querySelectorAll("#mobileControls .arrow-btn").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    if(jogo !== "tetris") return;
    const dir = btn.getAttribute("data-dir");
    if(dir === "LEFT") movePiece(-1,0);
    else if(dir === "RIGHT") movePiece(1,0);
    else if(dir === "DOWN") movePiece(0,1);
    else if(dir === "UP") rotatePiece();
  });
});
