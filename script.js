let jogo = null;
let requestId;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const telaInicial = document.getElementById("telaInicial");
const telaJogos = document.getElementById("telaJogos");
const mobileControls = document.getElementById("mobileControls");

document.getElementById("btnEntrar").onclick = () => {
  telaInicial.style.display = "none";
  telaJogos.style.display = "block";
};

document.getElementById("btnVoltar").onclick = () => {
  telaInicial.style.display = "block";
  telaJogos.style.display = "none";
  canvas.style.display = "none";
  mobileControls.style.display = "none";
  cancelAnimationFrame(requestId);
};

function iniciarJogo(tipo) {
  jogo = tipo;
  telaJogos.style.display = "none";
  canvas.style.display = "block";
  mobileControls.style.display = "flex";
  if (tipo === "snake") iniciarSnake();
  else if (tipo === "pong") iniciarPong();
}

// === SNAKE ===
let snake, food, dx, dy, score;

function iniciarSnake() {
  snake = [{ x: 10, y: 10 }];
  food = gerarComida();
  dx = 1;
  dy = 0;
  score = 0;
  desenharSnake();
}

function desenharSnake() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f0";
  snake.forEach(s => ctx.fillRect(s.x * 20, s.y * 20, 18, 18));

  ctx.fillStyle = "#f00";
  ctx.fillRect(food.x * 20, food.y * 20, 18, 18);

  ctx.fillStyle = "#fff";
  ctx.fillText("Pontuação: " + score, 10, 20);

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (colisao(head)) {
    ctx.fillText("Game Over", 150, 200);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = gerarComida();
  } else {
    snake.pop();
  }

  requestId = requestAnimationFrame(() => setTimeout(desenharSnake, 150));
}

function gerarComida() {
  return {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  };
}

function colisao(head) {
  return head.x < 0 || head.y < 0 || head.x >= 20 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y);
}

document.addEventListener("keydown", e => {
  if (jogo !== "snake") return;
  if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
  if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
  if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
  if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
});

document.querySelectorAll(".arrow-btn").forEach(btn => {
  btn.addEventListener("touchstart", () => {
    if (jogo !== "snake" && jogo !== "pong") return;
    const dir = btn.dataset.dir;
    if (jogo === "snake") {
      if (dir === "UP" && dy === 0) { dx = 0; dy = -1; }
      if (dir === "DOWN" && dy === 0) { dx = 0; dy = 1; }
      if (dir === "LEFT" && dx === 0) { dx = -1; dy = 0; }
      if (dir === "RIGHT" && dx === 0) { dx = 1; dy = 0; }
    } else if (jogo === "pong") {
      if (dir === "UP") jogador.y -= 20;
      if (dir === "DOWN") jogador.y += 20;
    }
  });
});

// === PONG ===
let bola, jogador, ia, pontosJogador, pontosIA;

function iniciarPong() {
  bola = { x: 200, y: 200, dx: 3, dy: 2 };
  jogador = { y: 160 };
  ia = { y: 160 };
  pontosJogador = 0;
  pontosIA = 0;
  loopPong();
}

function loopPong() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = "#fff";
  ctx.fillRect(10, jogador.y, 10, 80);
  ctx.fillRect(380, ia.y, 10, 80);

  ctx.beginPath();
  ctx.arc(bola.x, bola.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillText(`Você: ${pontosJogador} | IA: ${pontosIA}`, 120, 20);

  bola.x += bola.dx;
  bola.y += bola.dy;

  if (bola.y <= 0 || bola.y >= 400) bola.dy *= -1;

  if (bola.x < 20 && bola.y > jogador.y && bola.y < jogador.y + 80) bola.dx *= -1;
  if (bola.x > 370 && bola.y > ia.y && bola.y < ia.y + 80) bola.dx *= -1;

  if (bola.x < 0) { pontosIA++; reiniciarBola(); }
  if (bola.x > 400) { pontosJogador++; reiniciarBola(); }

  if (Math.random() < 0.6) {
    if (bola.y < ia.y + 40) ia.y -= 4;
    else if (bola.y > ia.y + 40) ia.y += 4;
  }

  requestId = requestAnimationFrame(loopPong);
}

function reiniciarBola() {
  bola.x = 200;
  bola.y = 200;
  bola.dx *= -1;
}
