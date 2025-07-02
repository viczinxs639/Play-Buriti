// Setup e variáveis
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let gameLoop, d = "", snake = [], food, score = 0;
let pongPlayerY = 150, pongAIY = 150, pongBallX = 200, pongBallY = 200;
let pongBallV = 3, pongPlayerScore = 0, pongAIScore = 0;
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

// Utilitário: detectar se é celular
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Iniciar jogo escolhido
function iniciarJogo(j) {
  jogo = j;
  clearInterval(gameLoop);
  resetDisplays();
  if (j === "snake") document.getElementById("controlesSnake").style.display = "block";
  if (j === "pong") document.getElementById("controlesPong").style.display = "block";
  if (j === "memoria") startMemoria();
  if (j === "tetris") document.getElementById("controlesTetris").style.display = "block";
}

// Reset visores
function resetDisplays() {
  ["gameCanvas","tetrisCanvas","memoriaContainer","mobileControls","controlesSnake","controlesPong","controlesTetris"]
  .forEach(id => document.getElementById(id).style.display = "none");
}
// swipe e botões
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
function startSnake() {
  jogo = "snake";
  resetDisplays();
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = isMobile() ? "block" : "none";
  if (isMobile()) {
    setupSwipe(canvas, swipeSnake);
    setupBtns(swipeSnake);
  }
  d = "RIGHT";
  snake = [];
  for (let i = 4; i >= 0; i--) snake.push({ x: i, y: 0 });
  food = { x: rand(), y: rand() };
  clearInterval(gameLoop);
  gameLoop = setInterval(drawSnake, 250);
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
function startPong() {
  jogo = "pong";
  resetDisplays();
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = isMobile() ? "block" : "none";
  if (isMobile()) setupSwipe(canvas, swipePong);
  pongPlayerY = pongAIY = 150;
  pongBallX = pongBallY = 200;
  pongPlayerScore = pongAIScore = 0;
  clearInterval(gameLoop);
  gameLoop = setInterval(drawPong, 20);
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

  pongBallX += pongBallV;
  pongBallY += pongBallV;

  // rebater
  if (pongBallY <= 0 || pongBallY >= 400) pongBallV = -pongBallV;

  if (
    pongBallX <= 20 && pongBallY > pongPlayerY && pongBallY < pongPlayerY + 60 ||
    pongBallX >= 370 && pongBallY > pongAIY && pongBallY < pongAIY + 60
  ) {
    pongBallV = -pongBallV;
  }

  // IA com 60% acerto
  if (Math.random() < 0.6) {
    if (pongAIY + 30 < pongBallY) pongAIY += 2;
    else pongAIY -= 2;
  }

  // Pontuação
  if (pongBallX < 0) {
    pongAIScore++;
    pongBallX = 200; pongBallY = 200;
  }
  if (pongBallX > 400) {
    pongPlayerScore++;
    pongBallX = 200; pongBallY = 200;
  }

  ctx.fillText("Você: " + pongPlayerScore, 10, 20);
  ctx.fillText("IA: " + pongAIScore, 320, 20);
}
function startMemoria() {
  jogo = "memoria";
  resetDisplays();
  document.getElementById("memoriaContainer").style.display = "block";
  document.getElementById("faseAtual").innerText = "Fase " + fase;
  gerarCartas(fase);
}

function gerarCartas(n) {
  let selecionados = emojis.sort(() => 0.5 - Math.random()).slice(0, n * 2);
  cartas = [...selecionados, ...selecionados].sort(() => 0.5 - Math.random());
  cartasSel = [];
  mostrarCartas();
}

function mostrarCartas() {
  let html = "";
  cartas.forEach((c, i) => {
    html += `<div class='carta' data-i='${i}' onclick='clicarCarta(${i})'>❓</div>`;
  });
  document.getElementById("memoriaGrid").innerHTML = html;
}

function clicarCarta(i) {
  if (cartasSel.length < 2 && !document.querySelectorAll(".carta")[i].classList.contains("revelada")) {
    cartasSel.push(i);
    document.querySelectorAll(".carta")[i].innerText = cartas[i];
    document.querySelectorAll(".carta")[i].classList.add("revelada");

    if (cartasSel.length === 2) {
      setTimeout(() => {
        if (cartas[cartasSel[0]] !== cartas[cartasSel[1]]) {
          cartasSel.forEach(j => {
            document.querySelectorAll(".carta")[j].innerText = "❓";
            document.querySelectorAll(".carta")[j].classList.remove("revelada");
          });
        } else {
          if (document.querySelectorAll(".revelada").length === cartas.length) {
            alert("Parabéns! Indo para próxima fase.");
            fase++;
            startMemoria();
          }
        }
        cartasSel = [];
      }, 500);
    }
  }
}
function startTetris() {
  jogo = "tetris";
  resetDisplays();
  tetrisCanvas.style.display = "block";
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  newPiece();
  gameOver = false;
  tetrisLoopInt = setInterval(tetrisLoop, 500);
}

function newPiece() {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  currentPiece = { shape: p.shape, color: p.color };
  currentX = 3;
  currentY = 0;
  if (collides(currentPiece.shape, currentX, currentY)) {
    alert("Game Over!");
    clearInterval(tetrisLoopInt);
  }
}

function collides(shape, x, y) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] && (board[y + r] && board[y + r][x + c]) !== "") return true;
    }
  }
  return false;
}

function merge() {
  currentPiece.shape.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) board[currentY + r][currentX + c] = currentPiece.color;
    });
  });
}

function rotate(shape) {
  return shape[0].map((_, i) => shape.map(row => row[i])).reverse();
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

function clearLines() {
  board = board.filter(row => row.some(cell => !cell));
  while (board.length < ROWS) board.unshift(Array(COLS).fill(""));
}

function drawBoard() {
  tetrisCtx.clearRect(0, 0, COLS * B, ROWS * B);
  board.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        tetrisCtx.fillStyle = color;
        tetrisCtx.fillRect(x * B, y * B, B, B);
      }
    });
  });
  currentPiece.shape.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        tetrisCtx.fillStyle = currentPiece.color;
        tetrisCtx.fillRect((currentX + c) * B, (currentY + r) * B, B, B);
      }
    });
  });
}
