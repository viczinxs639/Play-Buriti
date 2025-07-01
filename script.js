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

// Iniciar jogo selecionado
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
  else alert("Em breve...");
}

// Snake
function startSnake() {
  canvas.style.display = "block";
  score = 0;
  d = "";
  gameOverAnim = false;
  snake = [{ x: 9 * box, y: 9 * box }];
  food = {
    x: Math.floor(Math.random() * 19) * box,
    y: Math.floor(Math.random() * 19) * box,
  };

  document.addEventListener("keydown", direction);
  gameStarted = true;
  gameLoop = setInterval(draw, 200);
}

// Teclado
function direction(event) {
  if (!gameStarted || gameOverAnim) return;
  if (event.keyCode === 37 && d !== "RIGHT") d = "LEFT";
  if (event.keyCode === 38 && d !== "DOWN") d = "UP";
  if (event.keyCode === 39 && d !== "LEFT") d = "RIGHT";
  if (event.keyCode === 40 && d !== "UP") d = "DOWN";
}

// Toque (celular)
function setDirection(dir) {
  if (!gameStarted || gameOverAnim) return;
  if (dir === "LEFT" && d !== "RIGHT") d = "LEFT";
  if (dir === "UP" && d !== "DOWN") d = "UP";
  if (dir === "RIGHT" && d !== "LEFT") d = "RIGHT";
  if (dir === "DOWN" && d !== "UP") d = "DOWN";
}

// Desenhar Snake
function draw() {
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
    head.x < 0 ||
    head.x >= 400 ||
    head.y < 0 ||
    head.y >= 400 ||
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
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

// Memória
function startMemoria() {
  const container = document.getElementById("memoriaContainer");
  container.style.display = "flex";
  canvas.style.display = "none";
  container.innerHTML = "";

  let symbols = ['🍎','🍌','🍇','🍓','🍍','🥝'];
  let cards = symbols.concat(symbols).sort(() => 0.5 - Math.random());

  cards.forEach(simbolo => {
    const card = document.createElement("div");
    card.className = "card-memoria";
    card.textContent = "❓";
    card.dataset.simbolo = simbolo;
    card.onclick = virarCarta;
    container.appendChild(card);
  });

  let abertas = [];

  function virarCarta() {
    if (abertas.length < 2 && this.textContent === "❓") {
      this.textContent = this.dataset.simbolo;
      abertas.push(this);

      if (abertas.length === 2) {
        if (abertas[0].dataset.simbolo !== abertas[1].dataset.simbolo) {
          setTimeout(() => {
            abertas.forEach(c => c.textContent = "❓");
            abertas = [];
          }, 700);
        } else {
          abertas = [];
        }
      }
    }
  }
}
