// === Variáveis gerais ===
let canvas, ctx, gameLoop;
let d = "";
let snake = [];
let food;
let score = 0;

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
  document.getElementById("mobileControls").style.display = "none";
  clearInterval(gameLoop);
  d = "";
  snake = [];

  if (jogo === "snake") {
    document.getElementById("controlesSnake").style.display = "block";
  } else if (jogo === "pong") {
    document.getElementById("controlesPong").style.display = "block";
  } else if (jogo === "memoria") {
    startMemoria();
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
  gameLoop = setInterval(drawSnake, 150);
}

function swipeSnake(direction) {
  if (direction === "LEFT" && d !== "RIGHT") d = "LEFT";
  else if (direction === "UP" && d !== "DOWN") d = "UP";
  else if (direction === "RIGHT" && d !== "LEFT") d = "RIGHT";
  else if (direction === "DOWN" && d !== "UP") d = "DOWN";
}

function drawSnake() {
  const box = 20;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(snake[i].x * box, snake[i].y * box, box, box);
  }

  ctx.fillStyle = "red";
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
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("💀 Game Over", 120, 200);
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

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontuação: " + score, 10, 390);
}

// === JOGO DO PONG ===
let pongPlayerY = 150;
let pongAIY = 150;
let pongBallX = 200, pongBallY = 200;
let pongBallVX = 3, pongBallVY = 3;
let pongPlayerScore = 0, pongAIScore = 0;

function startPong() {
  document.getElementById("controlesPong").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("mobileControls").style.display = "block";
  setupSwipeControls(canvas, pongSwipeHandler);
  setupArrowButtons(pongSwipeHandler);
  pongBallX = 200; pongBallY = 200;
  pongBallVX = 3; pongBallVY = 3;
  pongPlayerScore = 0; pongAIScore = 0;
  gameLoop = setInterval(drawPong, 30);
}

function pongSwipeHandler(direction) {
  if (direction === "UP") pongPlayerY -= 20;
  else if (direction === "DOWN") pongPlayerY += 20;
}

function drawPong() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(10, pongPlayerY, 10, 80); // jogador
  ctx.fillRect(380, pongAIY, 10, 80); // computador
  ctx.beginPath();
  ctx.arc(pongBallX, pongBallY, 10, 0, Math.PI * 2);
  ctx.fill();

  pongBallX += pongBallVX;
  pongBallY += pongBallVY;

  if (pongBallY < 0 || pongBallY > 400) pongBallVY *= -1;

  if (
    pongBallX < 20 && pongBallY > pongPlayerY && pongBallY < pongPlayerY + 80 ||
    pongBallX > 370 && pongBallY > pongAIY && pongBallY < pongAIY + 80
  ) pongBallVX *= -1;

  if (pongBallX < 0) {
    pongAIScore++;
    resetBall();
  }
  if (pongBallX > 400) {
    pongPlayerScore++;
    resetBall();
  }

  if (pongBallY > pongAIY + 40) pongAIY += 2;
  else pongAIY -= 2;

  ctx.font = "16px Arial";
  ctx.fillText("Você: " + pongPlayerScore, 20, 20);
  ctx.fillText("IA: " + pongAIScore, 320, 20);
}

function resetBall() {
  pongBallX = 200;
  pongBallY = 200;
  pongBallVX = Math.random() > 0.5 ? 3 : -3;
  pongBallVY = Math.random() > 0.5 ? 3 : -3;
}

// === JOGO DA MEMÓRIA ===
let emojis = ["🍎", "🍌", "🍇", "🍒", "🍉", "🍍", "🥝", "🍑"];
let cartas = [], cartasSelecionadas = [];
let fase = 1;

function startMemoria() {
  canvas.style.display = "none";
  document.getElementById("memoriaContainer").style.display = "block";
  document.getElementById("btnIniciarMemoria").onclick = iniciarFaseMemoria;
  document.getElementById("btnProximaFase").onclick = () => {
    fase++;
    iniciarFaseMemoria();
  };
  document.getElementById("memoriaFase").innerText = "Fase: " + fase;
}

function iniciarFaseMemoria() {
  cartas = [];
  cartasSelecionadas = [];
  document.getElementById("btnProximaFase").style.display = "none";

  let totalPares = Math.min(fase + 2, emojis.length);
  let selecionados = emojis.slice(0, totalPares);
  let todos = [...selecionados, ...selecionados].sort(() => 0.5 - Math.random());

  let container = document.getElementById("cartasContainer");
  container.innerHTML = "";

  todos.forEach((emoji, i) => {
    let carta = document.createElement("div");
    carta.className = "card-memoria";
    carta.dataset.valor = emoji;
    carta.innerHTML = "❓";
    carta.onclick = () => revelarCarta(carta);
    container.appendChild(carta);
    cartas.push(carta);
  });
}

function revelarCarta(carta) {
  if (cartasSelecionadas.length < 2 && !carta.classList.contains("revelada")) {
    carta.innerHTML = carta.dataset.valor;
    carta.classList.add("revelada");
    cartasSelecionadas.push(carta);

    if (cartasSelecionadas.length === 2) {
      setTimeout(() => {
        const [c1, c2] = cartasSelecionadas;
        if (c1.dataset.valor === c2.dataset.valor) {
          c1.onclick = null;
          c2.onclick = null;
        } else {
          c1.innerHTML = "❓";
          c2.innerHTML = "❓";
          c1.classList.remove("revelada");
          c2.classList.remove("revelada");
        }
        cartasSelecionadas = [];

        if ([...document.querySelectorAll(".card-memoria")].every(c => c.classList.contains("revelada"))) {
          document.getElementById("btnProximaFase").style.display = "inline-block";
        }
      }, 800);
    }
  }
}
