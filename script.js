function mostrarGaleria() {
  document.getElementById("telaInicial").style.display = "none";
  document.getElementById("galeriaJogos").style.display = "block";
}

let canvas = null;
let ctx = null;
let box = 20;
let snake = [];
let food = {};
let d = "";
let score = 0;
let gameLoop = null;
let gameStarted = false;
let gameOverAnim = false;

let memoriaFaseAtual = 1;
let cartas = [];
let cartasReveladas = [];
let paresEncontrados = 0;
let memoriaJogando = false;

// Iniciar jogo
function iniciarJogo(jogo) {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  document.getElementById("memoriaContainer").style.display = "none";
  canvas.style.display = "none";
  clearInterval(gameLoop);
  gameStarted = false;
  d = "";
  snake = [];

  if (jogo === "snake") startSnake();
  else if (jogo === "memoria") startMemoria();
  else if (jogo === "pong") startPong();
  else alert("Em breve...");
}

// --- SNAKE ---
function startSnake() {
  canvas.style.display = "block";
  score = 0;
  gameOverAnim = false;
  snake = [{ x: 9 * box, y: 9 * box }];
  food = {
    x: Math.floor(Math.random() * 19) * box,
    y: Math.floor(Math.random() * 19) * box,
  };

  document.addEventListener("keydown", direction);
  setupSwipeControls(canvas);
  gameStarted = true;
  gameLoop = setInterval(drawSnake, 200);
}

function direction(event) {
  if (!gameStarted || gameOverAnim) return;
  if (event.keyCode === 37 && d !== "RIGHT") d = "LEFT";
  if (event.keyCode === 38 && d !== "DOWN") d = "UP";
  if (event.keyCode === 39 && d !== "LEFT") d = "RIGHT";
  if (event.keyCode === 40 && d !== "UP") d = "DOWN";
}

// Controle por swipe (celular)
function setupSwipeControls(element) {
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
      if (dx > 20 && d !== "LEFT") d = "RIGHT";
      else if (dx < -20 && d !== "RIGHT") d = "LEFT";
    } else {
      if (dy > 20 && d !== "UP") d = "DOWN";
      else if (dy < -20 && d !== "DOWN") d = "UP";
    }
  });
}

function drawSnake() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 400, 400);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#00ff88" : "#00cc66";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let head = { x: snake[0].x, y: snake[0].y };
  if (d === "LEFT") head.x -= box;
  if (d === "UP") head.y -= box;
  if (d === "RIGHT") head.x += box;
  if (d === "DOWN") head.y += box;

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = {
      x: Math.floor(Math.random() * 19) * box,
      y: Math.floor(Math.random() * 19) * box,
    };
  } else {
    snake.pop();
  }

  if (
    head.x < 0 || head.x >= 400 ||
    head.y < 0 || head.y >= 400 ||
    collision(head, snake)
  ) {
    clearInterval(gameLoop);
    gameOverAnim = true;
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", 120, 200);
    return;
  }

  snake.unshift(head);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Pontuação: " + score, 10, 390);
}

function collision(head, array) {
  return array.some(part => part.x === head.x && part.y === head.y);
}

// --- MEMÓRIA ---
function startMemoria() {
  document.getElementById("memoriaContainer").style.display = "block";
  canvas.style.display = "none";
  document.getElementById("btnIniciarMemoria").style.display = "inline-block";
  document.getElementById("btnProximaFase").style.display = "none";
  document.getElementById("memoriaFase").textContent = "Fase: " + memoriaFaseAtual;
  document.getElementById("cartasContainer").innerHTML = "";
  memoriaJogando = false;

  document.getElementById("btnIniciarMemoria").onclick = () => iniciarFaseMemoria();
  document.getElementById("btnProximaFase").onclick = () => proximaFaseMemoria();
}

function iniciarFaseMemoria() {
  memoriaJogando = true;
  paresEncontrados = 0;
  cartasReveladas = [];

  const nPares = Math.min(3 + memoriaFaseAtual, 10); // Cresce até 10 pares max
  const simbolos = ['🍎','🍌','🍇','🍓','🍍','🥝','🍉','🍒','🥥','🍑'];
  let usados = simbolos.slice(0, nPares);
  cartas = usados.concat(usados).sort(() => 0.5 - Math.random());

  const container = document.getElementById("cartasContainer");
  container.innerHTML = "";

  cartas.forEach(() => {
    const card = document.createElement("div");
    card.className = "card-memoria";
    card.textContent = "❓";
    card.onclick = virarCartaMemoria;
    container.appendChild(card);
  });

  document.getElementById("btnIniciarMemoria").style.display = "none";
  document.getElementById("btnProximaFase").style.display = "none";
  document.getElementById("memoriaFase").textContent = "Fase: " + memoriaFaseAtual;
}

function virarCartaMemoria() {
  if (!memoriaJogando) return;
  if (this.classList.contains("revelada") || cartasReveladas.length >= 2) return;

  const index = Array.from(this.parentNode.children).indexOf(this);
  this.textContent = cartas[index];
  this.classList.add("revelada");
  cartasReveladas.push(this);

  if (cartasReveladas.length === 2) {
    if (cartas[Array.from(this.parentNode.children).indexOf(cartasReveladas[0])] ===
        cartas[Array.from(this.parentNode.children).indexOf(cartasReveladas[1])]) {
      // Acertou par
      paresEncontrados++;
      cartasReveladas = [];
      if (paresEncontrados === cartas.length / 2) {
        memoriaJogando = false;
        document.getElementById("btnProximaFase").style.display = "inline-block";
      }
    } else {
      // Errou par - esconde depois
      memoriaJogando = false;
      setTimeout(() => {
        cartasReveladas.forEach(c => {
          c.textContent = "❓";
          c.classList.remove("revelada");
        });
        cartasReveladas = [];
        memoriaJogando = true;
      }, 800);
    }
  }
}

function proximaFaseMemoria() {
  memoriaFaseAtual++;
  iniciarFaseMemoria();
  document.getElementById("btnProximaFase").style.display = "none";
}

// --- PONG ---
let pongCanvas, pongCtx;
let pongGameLoop;
let pongPlayerY, pongAIDir;
let pongBallX, pongBallY, pongBallVX, pongBallVY;
let pongPlayerScore, pongAIScore;
const pongWidth = 400, pongHeight = 400;
const paddleHeight = 60, paddleWidth = 10;
const ballRadius = 8;

function startPong() {
  canvas = document.getElementById("gameCanvas");
  pongCanvas = canvas;
  pongCtx = canvas.getContext("2d");
  canvas.style.display = "block";
  document.getElementById("memoriaContainer").style.display = "none";

  pongPlayerY = pongHeight / 2 - paddleHeight / 2;
  pongAIDir = 2;
  pongBallX = pongWidth / 2;
  pongBallY = pongHeight / 2;
  pongBallVX = 3;
  pongBallVY = 3;
  pongPlayerScore = 0;
  pongAIScore = 0;

  document.addEventListener("keydown", pongKeyDown);
  setupSwipeControls(pongCanvas, pongSwipeHandler);

  clearInterval(gameLoop);
  gameLoop = setInterval(drawPong, 16);
}

function pongKeyDown(e) {
  const step = 20;
  if (e.key === "ArrowUp") pongPlayerY = Math.max(0, pongPlayerY - step);
  else if (e.key === "ArrowDown") pongPlayerY = Math.min(pongHeight - paddleHeight, pongPlayerY + step);
}

function pongSwipeHandler(dir) {
  const step = 20;
  if (dir === "UP") pongPlayerY = Math.max(0, pongPlayerY - step);
  else if (dir === "DOWN") pongPlayerY = Math.min(pongHeight - paddleHeight, pongPlayerY + step);
}

function drawPong() {
  pongCtx.fillStyle = "#000";
  pongCtx.fillRect(0, 0, pongWidth, pongHeight);

  // Player paddle (left)
  pongCtx.fillStyle = "#00ff88";
  pongCtx.fillRect(10, pongPlayerY, paddleWidth, paddleHeight);

  // AI paddle (right)
  pongCtx.fillStyle = "#00cc66";
  pongCtx.fillRect(pongWidth - 20, pongBallY - paddleHeight / 2, paddleWidth, paddleHeight);

  // Ball
  pongCtx.beginPath();
  pongCtx.arc(pongBallX, pongBallY, ballRadius, 0, Math.PI * 2);
  pongCtx.fillStyle = "red";
  pongCtx.fill();
  pongCtx.closePath();

  // Scores
  pongCtx.fillStyle = "white";
  pongCtx.font = "20px Arial";
  pongCtx.fillText("Você: " + pongPlayerScore, 20, 30);
  pongCtx.fillText("CPU: " + pongAIScore, pongWidth - 120, 30);

  // Move ball
  pongBallX += pongBallVX;
  pongBallY += pongBallVY;

  // Bounce top/bottom
  if (pongBallY + ballRadius > pongHeight || pongBallY - ballRadius < 0) {
    pongBallVY = -pongBallVY;
  }

  // Bounce player paddle
  if (pongBallX - ballRadius < 20 &&
      pongBallY > pongPlayerY &&
      pongBallY < pongPlayerY + paddleHeight) {
    pongBallVX = -pongBallVX;
    // Slightly increase speed
    pongBallVX *= 1.05;
    pongBallVY *= 1.05;
  }

  // Bounce AI paddle
  if (pongBallX + ballRadius > pongWidth - 20 &&
      pongBallY > pongBallY - paddleHeight / 2 &&
      pongBallY < pongBallY - paddleHeight / 2 + paddleHeight) {
    pongBallVX = -pongBallVX;
  }

  // AI Movement simple follow ball Y
  if (pongBallY > pongBallY - paddleHeight / 2 + paddleHeight / 2) {
    pongBallY -= 2;
  } else {
    pongBallY += 2;
  }

  // Score update
  if (pongBallX - ballRadius < 0) {
    pongAIScore++;
    resetBall();
  } else if (pongBallX + ballRadius > pongWidth) {
    pongPlayerScore++;
    resetBall();
  }
}

function resetBall() {
  pongBallX = pongWidth / 2;
  pongBallY = pongHeight / 2;
  pongBallVX = (Math.random() > 0.5 ? 3 : -3);
  pongBallVY = (Math.random() > 0.5 ? 3 : -3);
}

// Reuso do setupSwipeControls para Pong com callback diferente
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
      if (dx > 20) callbackSwipe && callbackSwipe("RIGHT");
      else if (dx < -20) callbackSwipe && callbackSwipe("LEFT");
    } else {
      if (dy > 20) callbackSwipe && callbackSwipe("DOWN");
      else if (dy < -20) callbackSwipe && callbackSwipe("UP");
    }
  });
}
