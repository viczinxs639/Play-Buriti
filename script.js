// Variáveis e setup
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let gameLoop, d = "", snake = [], food, score = 0;

let pongPlayerY = 150, pongAIY = 150, pongBallX = 200, pongBallY = 200;
let pongBallVX = 3, pongBallVY = 3;
let pongPlayerScore = 0, pongAIScore = 0;

let emojis = ["🍎","🍌","🍇","🍒","🍉","🍍","🥝","🍑"], cartas = [], cartasSel = [], fase = 1;

const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");
const ROWS=20, COLS=10, B=20;
let board=[], currentPiece, currentX, currentY, gameOver=false, tetrisLoopInt;
const PIECES=[
  {shape:[[1,1,1,1]],color:'cyan'},
  {shape:[[1,1],[1,1]],color:'yellow'},
  {shape:[[0,1,0],[1,1,1]],color:'purple'},
  {shape:[[1,1,0],[0,1,1]],color:'green'},
  {shape:[[0,1,1],[1,1,0]],color:'red'},
  {shape:[[1,0,0],[1,1,1]],color:'blue'},
  {shape:[[0,0,1],[1,1,1]],color:'orange'}
];
let jogo=null;

// Detecta celular
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Tela inicial - botão entrar
document.getElementById("btnEntrar").addEventListener("click", () => {
  document.getElementById("telaInicial").style.display = "none";
  document.getElementById("telaJogos").style.display = "block";
});

// Botão voltar na tela jogos
document.getElementById("btnVoltar").addEventListener("click", () => {
  document.getElementById("telaJogos").style.display = "none";
  document.getElementById("telaInicial").style.display = "block";
  resetDisplays();
});

// Reset visores
function resetDisplays() {
  ["gameCanvas","tetrisCanvas","memoriaContainer","mobileControls","controlesSnake","controlesPong","controlesTetris"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
  clearInterval(gameLoop);
  clearInterval(tetrisLoopInt);
}

// Iniciar jogo
function iniciarJogo(j) {
  jogo = j;
  resetDisplays();
  if (j === "snake") {
    document.getElementById("gameCanvas").style.display = "block";
    document.getElementById("controlesSnake").style.display = "block";
    document.getElementById("mobileControls").style.display = isMobile() ? "block" : "none";
  }
  if (j === "pong") {
    document.getElementById("gameCanvas").style.display = "block";
    document.getElementById("controlesPong").style.display = "block";
    document.getElementById("mobileControls").style.display = isMobile() ? "block" : "none";
  }
  if (j === "memoria") {
    document.getElementById("memoriaContainer").style.display = "block";
  }
  if (j === "tetris") {
    document.getElementById("tetrisCanvas").style.display = "block";
    document.getElementById("controlesTetris").style.display = "block";
  }
}

// CONTROLES

// Swipe
function setupSwipe(el, cb) {
  let x0, y0;
  el.addEventListener("touchstart", e => {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  });
  el.addEventListener("touchend", e => {
    let dx = e.changedTouches[0].clientX - x0;
    let dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20) cb("RIGHT");
      else if (dx < -20) cb("LEFT");
    } else {
      if (dy > 20) cb("DOWN");
      else if (dy < -20) cb("UP");
    }
  });
}

function setupBtns(cb) {
  document.querySelectorAll(".arrow-btn").forEach(btn => {
    btn.onclick = () => cb(btn.getAttribute("data-dir"));
  });
}

// Teclado
document.addEventListener("keydown", e => {
  if (isMobile()) return;
  if (jogo === "snake") {
    if (e.key === "ArrowLeft" && d !== "RIGHT") d = "LEFT";
    if (e.key === "ArrowUp" && d !== "DOWN") d = "UP";
    if (e.key === "ArrowRight" && d !== "LEFT") d = "RIGHT";
    if (e.key === "ArrowDown" && d !== "UP") d = "DOWN";
  }
  if (jogo === "pong") {
    if (e.key === "ArrowUp") pongPlayerY -= 15;
    if (e.key === "ArrowDown") pongPlayerY += 15;
  }
  if (jogo === "tetris") {
    if (e.key === "ArrowLeft" && !collides(currentPiece.shape,currentX-1,currentY)) currentX--;
    if (e.key === "ArrowRight" && !collides(currentPiece.shape,currentX+1,currentY)) currentX++;
    if (e.key === "ArrowDown" && !collides(currentPiece.shape,currentX,currentY+1)) currentY++;
    if (e.key === "ArrowUp") {
      let r = rotate(currentPiece.shape);
      if (!collides(r,currentX,currentY)) currentPiece.shape = r;
    }
    drawBoard();
  }
});

// --------------------
// JOGO DA COBRINHA
// --------------------

function startSnake() {
  score = 0;
  d = "RIGHT";
  snake = [];
  for (let i = 4; i >= 0; i--) snake.push({ x: i, y: 0 });
  food = { x: rand(), y: rand() };
  clearInterval(gameLoop);
  gameLoop = setInterval(drawSnake, 200);

  if (isMobile()) {
    setupSwipe(canvas, swipeSnake);
    setupBtns(swipeSnake);
  }
}

function rand() {
  return Math.floor(Math.random() * 20);
}

function swipeSnake(dir) {
  if (dir === "LEFT" && d !== "RIGHT") d = "LEFT";
  if (dir === "UP" && d !== "DOWN") d = "UP";
  if (dir === "RIGHT" && d !== "LEFT") d = "RIGHT";
  if (dir === "DOWN" && d !== "UP") d = "DOWN";
}

function drawSnake() {
  const s = 20;
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 400, 400);

  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#39FF14" : "#0B610B";
    ctx.fillRect(seg.x * s, seg.y * s, s, s);
    ctx.strokeStyle = "#040";
    ctx.strokeRect(seg.x * s, seg.y * s, s, s);
  });

  ctx.fillStyle = "#FF4500";
  ctx.fillRect(food.x * s, food.y * s, s, s);

  let hx = snake[0].x;
  let hy = snake[0].y;

  if (d === "LEFT") hx--;
  if (d === "UP") hy--;
  if (d === "RIGHT") hx++;
  if (d === "DOWN") hy++;

  if (hx < 0 || hx >= 20 || hy < 0 || hy >= 20 || snake.some(seg => seg.x === hx && seg.y === hy)) {
    clearInterval(gameLoop);
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 80, 200);
    return;
  }

  if (hx === food.x && hy === food.y) {
    score++;
    food = { x: rand(), y: rand() };
  } else {
    snake.pop();
  }

  snake.unshift({ x: hx, y: hy });

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Pontuação: " + score, 10, 390);
}

// Botão iniciar Snake
document.querySelector("#controlesSnake button").addEventListener("click", () => {
  startSnake();
});

// --------------------
// JOGO PONG
// --------------------

function startPong() {
  pongPlayerY = pongAIY = 150;
  pongBallX = 200; pongBallY = 200;
  pongBallVX = 3; pongBallVY = 3;
  pongPlayerScore = 0; pongAIScore = 0;
  clearInterval(gameLoop);
  gameLoop = setInterval(drawPong, 20);
  if (isMobile()) {
    setupSwipe(canvas, swipePong);
    setupBtns(swipePong);
  }
}

function swipePong(dir) {
  if (dir === "UP") pongPlayerY -= 20;
  if (dir === "DOWN") pongPlayerY += 20;
}

function drawPong() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = "white";
  ctx.fillRect(10, pongPlayerY, 10, 60);
  ctx.fillRect(380, pongAIY, 10, 60);

  ctx.beginPath();
  ctx.arc(pongBallX, pongBallY, 7, 0, Math.PI * 2);
  ctx.fill();

  pongBallX += pongBallVX;
  pongBallY += pongBallVY;

  if (pongBallY <= 0 || pongBallY >= 400) pongBallVY = -pongBallVY;

  // Colisão com raquetes
  if (pongBallX <= 20 && pongBallY > pongPlayerY && pongBallY < pongPlayerY + 60) pongBallVX = -pongBallVX;
  if (pongBallX >= 380 && pongBallY > pongAIY && pongBallY < pongAIY + 60) pongBallVX = -pongBallVX;

  // IA com 60% de chance de acertar
  if (Math.random() < 0.6) {
    if (pongAIY + 30 < pongBallY) pongAIY += 2;
    else pongAIY -= 2;
  }

  // Limite raquetes
  if (pongPlayerY < 0) pongPlayerY = 0;
  if (pongPlayerY > 340) pongPlayerY = 340;
  if (pongAIY < 0) pongAIY = 0;
  if (pongAIY > 340) pongAIY = 340;

  // Pontuação
  if (pongBallX < 0) {
    pongAIScore++;
    resetBall();
  }
  if (pongBallX > 400) {
    pongPlayerScore++;
    resetBall();
  }

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Você: " + pongPlayerScore, 10, 20);
  ctx.fillText("IA: " + pongAIScore, 320, 20);
}

function resetBall() {
  pongBallX = 200;
  pongBallY = 200;
  pongBallVX = 3 * (Math.random() > 0.5 ? 1 : -1);
  pongBallVY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

// Botão iniciar Pong
document.querySelector("#controlesPong button").addEventListener("click", () => {
  startPong();
});

// --------------------
// JOGO DA MEMÓRIA
// --------------------

function startMemoria() {
  fase = 1;
  gerarCartas(fase);
  document.getElementById("faseAtual").innerText = "Fase " + fase;
  document.getElementById("btnIniciarMemoria").style.display = "inline-block";
  document.getElementById("btnProximaFase").style.display = "none";
}

document.getElementById("btnIniciarMemoria").addEventListener("click", () => {
  revelarTodasCartasTemporario(2000);
});

document.getElementById("btnProximaFase").addEventListener("click", () => {
  fase++;
  gerarCartas(fase);
  document.getElementById("faseAtual").innerText = "Fase " + fase;
  document.getElementById("btnIniciarMemoria").style.display = "inline-block";
  document.getElementById("btnProximaFase").style.display = "none";
});

function gerarCartas(n) {
  const total = n * 2;
  const selecionados = emojis.slice(0, total / 2);
  cartas = [...selecionados, ...selecionados];
  cartas = cartas.sort(() => Math.random() - 0.5);
  cartasSel = [];
  mostrarCartas();
  bloqueado = true;
}

function mostrarCartas() {
  let html = "";
  cartas.forEach((c, i) => {
    html += `<div class="carta" data-i="${i}">❓</div>`;
  });
  document.getElementById("memoriaGrid").innerHTML = html;
  Array.from(document.querySelectorAll(".carta")).forEach(carta => {
    carta.addEventListener("click", () => clicarCarta(parseInt(carta.dataset.i)));
  });
}

let cartasSel = [];
let bloqueado = true;

function clicarCarta(i) {
  if (bloqueado) return;
  let carta = document.querySelectorAll(".carta")[i];
  if (cartasSel.includes(i) || carta.classList.contains("revelada")) return;
  carta.innerText = cartas[i];
  cartasSel.push(i);
  if (cartasSel.length === 2) {
    bloqueado = true;
    setTimeout(() => {
      let c1 = cartasSel[0], c2 = cartasSel[1];
      if (cartas[c1] === cartas[c2]) {
        document.querySelectorAll(".carta")[c1].classList.add("revelada");
        document.querySelectorAll(".carta")[c2].classList.add("revelada");
      } else {
        document.querySelectorAll(".carta")[c1].innerText = "❓";
        document.querySelectorAll(".carta")[c2].innerText = "❓";
      }
      cartasSel = [];
      bloqueado = false;

      // Verifica vitória
      if (document.querySelectorAll(".carta.revelada").length === cartas.length) {
        alert("Parabéns, você passou a fase!");
        document.getElementById("btnProximaFase").style.display = "inline-block";
        document.getElementById("btnIniciarMemoria").style.display = "none";
      }
    }, 800);
  }
}

function revelarTodasCartasTemporario(ms) {
  bloqueado = true;
  document.querySelectorAll(".carta").forEach((carta, i) => {
    carta.innerText = cartas[i];
  });
  setTimeout(() => {
    document.querySelectorAll(".carta").forEach(carta => {
      carta.innerText = "❓";
    });
    bloqueado = false;
  }, ms);
}

// --------------------
// JOGO TETRIS
// --------------------

function startTetris() {
  jogo = "tetris";
  resetDisplays();
  tetrisCanvas.style.display = "block";
  document.getElementById("controlesTetris").style.display = "block";

  board = Array.from({length: ROWS}, () => Array(COLS).fill(""));
  newPiece();
  gameOver = false;
  clearInterval(tetrisLoopInt);
  tetrisLoopInt = setInterval(tetrisLoop, 500);
}

function newPiece() {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  currentPiece = {shape: p.shape, color: p.color};
  currentX = 3;
  currentY = 0;
  if (collides(currentPiece.shape, currentX, currentY)) {
    alert("Game Over!");
    clearInterval(tetrisLoopInt);
  }
}

function collides(shape, x, y) {
  for (let r=0; r < shape.length; r++) {
    for (let c=0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        if (y+r >= ROWS || x+c < 0 || x+c >= COLS || board[y+r][x+c] !== "") {
          return true;
        }
      }
    }
  }
  return false;
}

function merge() {
  currentPiece.shape.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) board[currentY+r][currentX+c] = currentPiece.color;
    });
  });
}

function rotate(shape) {
  return shape[0].map((_, i) => shape.map(row => row[i])).reverse();
}

function clearLines() {
  board = board.filter(row => row.some(cell => cell === ""));
  while (board.length < ROWS) board.unshift(Array(COLS).fill(""));
}

function drawBoard() {
  tetrisCtx.clearRect(0,0,COLS*B, ROWS*B);
  board.forEach((row,y) => {
    row.forEach((color,x) => {
      if (color) {
        tetrisCtx.fillStyle = color;
        tetrisCtx.fillRect(x*B,y*B,B,B);
        tetrisCtx.strokeStyle = "#222";
        tetrisCtx.strokeRect(x*B,y*B,B,B);
      }
    });
  });
  currentPiece.shape.forEach((row,r) => {
    row.forEach((val,c) => {
      if (val) {
        tetrisCtx.fillStyle = currentPiece.color;
        tetrisCtx.fillRect((currentX+c)*B,(currentY+r)*B,B,B);
        tetrisCtx.strokeStyle = "#222";
        tetrisCtx.strokeRect((currentX+c)*B,(currentY+r)*B,B,B);
      }
    });
  });
}

function tetrisLoop() {
  if (!collides(currentPiece.shape, currentX, currentY + 1)) {
    currentY++;
  } else {
    merge();
    clearLines();
    newPiece();
  }
  drawBoard();
}

// Botão iniciar Tetris
document.querySelector("#controlesTetris button").addEventListener("click", () => {
  startTetris();
});

// --------------------
// CONTROLES MÓVEIS (D-pad)
setupBtns(dir => {
  if (jogo === "snake") swipeSnake(dir);
  if (jogo === "pong") swipePong(dir);
});
