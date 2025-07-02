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
let snake, food, dx, dy, score;
let snakeInterval;

function iniciarSnake() {
  snake = [{ x: 10, y: 10 }];
  food = gerarComida();
  dx = 1;
  dy = 0;
  score = 0;
  clearInterval(snakeInterval);
  snakeInterval = setInterval(atualizarSnake, 150);
}

function atualizarSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (colisao(head)) {
    clearInterval(snakeInterval);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
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
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cobra
  ctx.fillStyle = "#f39c12";
  snake.forEach(parte => {
    ctx.fillRect(parte.x * 20, parte.y * 20, 18, 18);
  });

  // Comida
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(food.x * 20, food.y * 20, 18, 18);

  // Pontuação
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontuação: " + score, 10, 20);
}

function gerarComida() {
  const maxX = canvas.width / 20;
  const maxY = canvas.height / 20;
  let nova;
  do {
    nova = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY)
    };
  } while (snake.some(s => s.x === nova.x && s.y === nova.y));
  return nova;
}

function colisao(head) {
  return (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width / 20 ||
    head.y >= canvas.height / 20 ||
    snake.some(parte => parte.x === head.x && parte.y === head.y)
  );
}

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

// === TETRIS (placeholder) ===
function iniciarTetris() {
  // Aqui pode entrar seu Tetris futuramente
  tetrisCanvas.getContext("2d").fillStyle = "#222";
  tetrisCanvas.getContext("2d").fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
}
