// --------------------
// CONFIG INICIAL
// --------------------
let jogo = "";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");

document.getElementById("btnEntrar").addEventListener("click", () => {
  document.getElementById("telaInicial").style.display = "none";
  document.getElementById("telaJogos").style.display = "block";
});

document.getElementById("btnVoltar").addEventListener("click", () => {
  resetDisplays();
  document.getElementById("telaJogos").style.display = "block";
});

function resetDisplays() {
  canvas.style.display = "none";
  tetrisCanvas.style.display = "none";
  document.getElementById("memoriaContainer").style.display = "none";
  document.getElementById("mobileControls").style.display = "none";
  clearInterval(snakeLoop);
  clearInterval(pongLoopInt);
  clearInterval(tetrisLoopInt);
  document.removeEventListener("keydown", keydownHandler);
}

function iniciarJogo(nome) {
  resetDisplays();
  jogo = nome;

  if (nome === "snake") startSnake();
  if (nome === "pong") startPong();
  if (nome === "memoria") startMemoria();
  if (nome === "tetris") startTetris();
}

// --------------------
// SNAKE (COBRINHA)
// --------------------
let snake = [{ x: 10, y: 10 }];
let apple = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let gridSize = 20;
let snakeLength = 1;
let snakeLoop;
let pontos = 0;
let gameOverSnake = false;

function startSnake() {
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = "block";
  ctx.clearRect(0, 0, 400, 400);
  snake = [{ x: 10, y: 10 }];
  apple = { x: 5, y: 5 };
  dx = dy = 0;
  snakeLength = 1;
  pontos = 0;
  gameOverSnake = false;
  document.addEventListener("keydown", keydownHandler);
  clearInterval(snakeLoop);
  snakeLoop = setInterval(updateSnake, 150);
}

function updateSnake() {
  if (gameOverSnake) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  if (head.x === apple.x && head.y === apple.y) {
    apple.x = Math.floor(Math.random() * 20);
    apple.y = Math.floor(Math.random() * 20);
    snakeLength++;
    pontos++;
  } else {
    while (snake.length > snakeLength) snake.pop();
  }

  if (
    head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 ||
    snake.slice(1).some(s => s.x === head.x && s.y === head.y)
  ) {
    gameOverSnake = true;
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", 110, 200);
    return;
  }

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = "limegreen";
  snake.forEach(s => ctx.fillRect(s.x * gridSize, s.y * gridSize, gridSize - 2, gridSize - 2));

  ctx.fillStyle = "red";
  ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontos: " + pontos, 10, 390);
}
let pongBallX = 200, pongBallY = 200;
let pongBallVX = 3, pongBallVY = 3;
let pongPlayerY = 170, pongAIY = 170;
let pongPlayerScore = 0, pongAIScore = 0;
let pongLoopInt;

function startPong() {
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = "block";
  pongBallX = 200; pongBallY = 200;
  pongPlayerY = 170; pongAIY = 170;
  pongPlayerScore = 0; pongAIScore = 0;
  document.addEventListener("keydown", keydownHandler);
  clearInterval(pongLoopInt);
  pongLoopInt = setInterval(updatePong, 30);
}

function updatePong() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 400, 400);

  pongBallX += pongBallVX;
  pongBallY += pongBallVY;

  if (pongBallY <= 0 || pongBallY >= 400) pongBallVY *= -1;

  ctx.fillStyle = "white";
  ctx.fillRect(10, pongPlayerY, 10, 60);
  ctx.fillRect(380, pongAIY, 10, 60);
  ctx.beginPath();
  ctx.arc(pongBallX, pongBallY, 8, 0, Math.PI * 2);
  ctx.fill();

  if (pongBallX <= 20 && pongBallY >= pongPlayerY && pongBallY <= pongPlayerY + 60) {
    pongBallVX *= -1;
    pongBallX = 20;
  }

  if (pongBallX >= 370 && pongBallY >= pongAIY && pongBallY <= pongAIY + 60) {
    pongBallVX *= -1;
    pongBallX = 370;
  }

  let chance = Math.random();
  if (chance < 0.6) {
    if (pongBallY > pongAIY + 30) pongAIY += 3;
    else if (pongBallY < pongAIY + 30) pongAIY -= 3;
  }

  pongAIY = Math.max(0, Math.min(340, pongAIY));
  pongPlayerY = Math.max(0, Math.min(340, pongPlayerY));

  if (pongBallX < 0) {
    pongAIScore++;
    resetBall();
  }
  if (pongBallX > 400) {
    pongPlayerScore++;
    resetBall();
  }

  ctx.font = "20px Arial";
  ctx.fillText("Você: " + pongPlayerScore, 20, 30);
  ctx.fillText("CPU: " + pongAIScore, 300, 30);
}

function resetBall() {
  pongBallX = 200;
  pongBallY = 200;
  pongBallVX = Math.random() > 0.5 ? 3 : -3;
  pongBallVY = Math.random() > 0.5 ? 3 : -3;
}
// --------------------
// JOGO DA MEMÓRIA
// --------------------
let memoriaNivel = 1;
let cartas = [];
let reveladas = [];
let acertos = 0;

function startMemoria() {
  document.getElementById("memoriaContainer").style.display = "block";
  document.getElementById("faseAtual").textContent = `Fase ${memoriaNivel}`;
  criarCartas(memoriaNivel);
  document.getElementById("btnIniciarMemoria").style.display = "inline-block";
  document.getElementById("btnProximaFase").style.display = "none";
}

function criarCartas(nivel) {
  const grid = document.getElementById("memoriaGrid");
  grid.innerHTML = "";
  const totalPares = 3 + nivel;
  const simbolos = "🍎🍌🍓🍇🍒🍍🍑🥝🥥🍉".split("").slice(0, totalPares);
  cartas = embaralhar([...simbolos, ...simbolos]);
  acertos = 0;
  reveladas = [];

  cartas.forEach((simbolo, index) => {
    const div = document.createElement("div");
    div.className = "carta";
    div.dataset.index = index;
    div.addEventListener("click", () => revelarCarta(index, div));
    grid.appendChild(div);
  });
}

function revelarCarta(index, div) {
  if (reveladas.length >= 2 || div.classList.contains("revelada")) return;
  div.textContent = cartas[index];
  div.classList.add("revelada");
  reveladas.push({ index, simbolo: cartas[index], div });

  if (reveladas.length === 2) {
    const [a, b] = reveladas;
    if (a.simbolo === b.simbolo) {
      acertos++;
      reveladas = [];
      if (acertos === cartas.length / 2) {
        document.getElementById("btnProximaFase").style.display = "inline-block";
      }
    } else {
      setTimeout(() => {
        a.div.textContent = "";
        b.div.textContent = "";
        a.div.classList.remove("revelada");
        b.div.classList.remove("revelada");
        reveladas = [];
      }, 800);
    }
  }
}

document.getElementById("btnIniciarMemoria").addEventListener("click", () => {
  criarCartas(memoriaNivel);
});

document.getElementById("btnProximaFase").addEventListener("click", () => {
  memoriaNivel++;
  startMemoria();
});

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// --------------------
// TETRIS
// --------------------
let tetrisGrid = Array.from({ length: 20 }, () => Array(10).fill(0));
let tetrisPiece;
let tetrisLoopInt;

function startTetris() {
  tetrisCanvas.style.display = "block";
  tetrisGrid = Array.from({ length: 20 }, () => Array(10).fill(0));
  novaPeca();
  document.addEventListener("keydown", keydownHandler);
  clearInterval(tetrisLoopInt);
  tetrisLoopInt = setInterval(updateTetris, 400);
}

function novaPeca() {
  const pecas = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
  ];
  const cor = Math.floor(Math.random() * 5) + 1;
  tetrisPiece = {
    shape: pecas[cor - 1],
    x: 3,
    y: 0,
    color: cor
  };
}

function updateTetris() {
  if (!moveTetris(0, 1)) {
    fixarPeca();
    limparLinhas();
    novaPeca();
    if (!validaPosicao(tetrisPiece.shape, tetrisPiece.x, tetrisPiece.y)) {
      clearInterval(tetrisLoopInt);
    }
  }
  desenharTetris();
}

function moveTetris(dx, dy) {
  if (validaPosicao(tetrisPiece.shape, tetrisPiece.x + dx, tetrisPiece.y + dy)) {
    tetrisPiece.x += dx;
    tetrisPiece.y += dy;
    return true;
  }
  return false;
}

function validaPosicao(shape, x, y) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const px = x + j;
        const py = y + i;
        if (px < 0 || px >= 10 || py >= 20 || tetrisGrid[py][px]) return false;
      }
    }
  }
  return true;
}

function fixarPeca() {
  const { shape, x, y, color } = tetrisPiece;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        tetrisGrid[y + i][x + j] = color;
      }
    }
  }
}

function limparLinhas() {
  for (let y = tetrisGrid.length - 1; y >= 0; y--) {
    if (tetrisGrid[y].every(val => val)) {
      tetrisGrid.splice(y, 1);
      tetrisGrid.unshift(Array(10).fill(0));
      y++;
    }
  }
}

function desenharTetris() {
  const colors = ["#000", "#f00", "#0f0", "#00f", "#ff0", "#f0f"];
  tetrisCtx.fillStyle = "#000";
  tetrisCtx.fillRect(0, 0, 200, 400);
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      if (tetrisGrid[y][x]) {
        tetrisCtx.fillStyle = colors[tetrisGrid[y][x]];
        tetrisCtx.fillRect(x * 20, y * 20, 18, 18);
      }
    }
  }
  const { shape, x, y, color } = tetrisPiece;
  tetrisCtx.fillStyle = colors[color];
  shape.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell) {
        tetrisCtx.fillRect((x + j) * 20, (y + i) * 20, 18, 18);
      }
    })
  );
}
// --------------------
// CONTROLES
// --------------------
function keydownHandler(e) {
  if (jogo === "snake") {
    if (e.key === "ArrowUp") dx = 0, dy = -1;
    if (e.key === "ArrowDown") dx = 0, dy = 1;
    if (e.key === "ArrowLeft") dx = -1, dy = 0;
    if (e.key === "ArrowRight") dx = 1, dy = 0;
  }

  if (jogo === "pong") {
    if (e.key === "ArrowUp") pongPlayerY -= 20;
    if (e.key === "ArrowDown") pongPlayerY += 20;
  }

  if (jogo === "tetris") {
    if (e.key === "ArrowLeft") moveTetris(-1, 0);
    if (e.key === "ArrowRight") moveTetris(1, 0);
    if (e.key === "ArrowDown") moveTetris(0, 1);
  }
}

document.querySelectorAll(".arrow-btn").forEach(btn => {
  btn.addEventListener("touchstart", () => {
    const dir = btn.dataset.dir;
    if (jogo === "snake") {
      if (dir === "UP") dx = 0, dy = -1;
      if (dir === "DOWN") dx = 0, dy = 1;
      if (dir === "LEFT") dx = -1, dy = 0;
      if (dir === "RIGHT") dx = 1, dy = 0;
    }

    if (jogo === "pong") {
      if (dir === "UP") pongPlayerY -= 20;
      if (dir === "DOWN") pongPlayerY += 20;
    }

    if (jogo === "tetris") {
      if (dir === "LEFT") moveTetris(-1, 0);
      if (dir === "RIGHT") moveTetris(1, 0);
      if (dir === "DOWN") moveTetris(0, 1);
    }
  });
});
