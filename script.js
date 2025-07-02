// === VARIÁVEIS GERAIS ===
let jogo = null;
let requestId;

const telaInicial = document.getElementById("telaInicial");
const telaJogos = document.getElementById("telaJogos");
const btnEntrar = document.getElementById("btnEntrar");
const btnVoltar = document.getElementById("btnVoltar");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");
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
};

function iniciarJogo(tipo) {
  jogo = tipo;
  telaJogos.style.display = "none";
  canvas.style.display = tipo === "snake" || tipo === "pong" ? "block" : "none";
  tetrisCanvas.style.display = tipo === "tetris" ? "block" : "none";
  memoriaContainer.style.display = tipo === "memoria" ? "block" : "none";
  mobileControls.style.display = tipo === "snake" || tipo === "pong" ? "flex" : "none";

  if (tipo === "snake") iniciarSnake();
  if (tipo === "pong") iniciarPong();
  if (tipo === "memoria") iniciarMemoria();
  if (tipo === "tetris") iniciarTetris();
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
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f39c12";
  snake.forEach(s => ctx.fillRect(s.x * 20, s.y * 20, 18, 18));

  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(food.x * 20, food.y * 20, 18, 18);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontuação: " + score, 10, 20);

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  if (colisao(head)) {
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

  requestId = requestAnimationFrame(() => setTimeout(desenharSnake, 150));
}

function gerarComida() {
  return {
    x: Math.floor(Math.random() * (canvas.width / 20)),
    y: Math.floor(Math.random() * (canvas.height / 20))
  };
}

function colisao(head) {
  return (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width / 20 ||
    head.y >= canvas.height / 20 ||
    snake.some(s => s.x === head.x && s.y === head.y)
  );
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
  bola = { x: 200, y: 200, dx: 4, dy: 3 };
  jogador = { y: 150 };
  ia = { y: 150 };
  pontosJogador = 0;
  pontosIA = 0;
  loopPong();
}

function loopPong() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(10, jogador.y, 10, 80);
  ctx.fillRect(380, ia.y, 10, 80);

  ctx.beginPath();
  ctx.arc(bola.x, bola.y, 8, 0, Math.PI * 2);
  ctx.fill();

  bola.x += bola.dx;
  bola.y += bola.dy;

  if (bola.y < 0 || bola.y > canvas.height) bola.dy *= -1;

  if (bola.x < 20 && bola.y > jogador.y && bola.y < jogador.y + 80) bola.dx *= -1;
  if (bola.x > 370 && bola.y > ia.y && bola.y < ia.y + 80) bola.dx *= -1;

  if (bola.x < 0) { pontosIA++; reiniciarBola(); }
  if (bola.x > canvas.width) { pontosJogador++; reiniciarBola(); }

  if (Math.random() < 0.6) {
    if (bola.y < ia.y + 40) ia.y -= 4;
    else if (bola.y > ia.y + 40) ia.y += 4;
  }

  ctx.font = "16px Arial";
  ctx.fillText(`Jogador: ${pontosJogador} | IA: ${pontosIA}`, 100, 20);

  requestId = requestAnimationFrame(loopPong);
}

function reiniciarBola() {
  bola.x = canvas.width / 2;
  bola.y = canvas.height / 2;
  bola.dx *= -1;
}

document.addEventListener("keydown", e => {
  if (jogo !== "pong") return;
  if (e.key === "ArrowUp") jogador.y -= 20;
  if (e.key === "ArrowDown") jogador.y += 20;
});

// === MEMÓRIA ===
const cartasEmoji = ['🍎','🍌','🍓','🍇','🍉','🍍','🥝','🍑'];
let cartas, cartaVirada = null, travar = false, acertos = 0, fase = 1;

function iniciarMemoria() {
  const grid = document.getElementById("memoriaGrid");
  grid.innerHTML = "";
  document.getElementById("faseAtual").textContent = "Fase " + fase;
  document.getElementById("btnIniciarMemoria").style.display = "none";
  document.getElementById("btnProximaFase").style.display = "none";
  acertos = 0;

  const totalPares = Math.min(fase + 3, cartasEmoji.length);
  const escolhidos = cartasEmoji.slice(0, totalPares);
  cartas = [...escolhidos, ...escolhidos].sort(() => 0.5 - Math.random());

  cartas.forEach((emoji, i) => {
    const carta = document.createElement("div");
    carta.className = "carta";
    carta.dataset.valor = emoji;
    carta.addEventListener("click", virarCarta);
    grid.appendChild(carta);
  });
}

function virarCarta(e) {
  if (travar) return;
  const carta = e.target;
  if (carta.classList.contains("virada")) return;

  carta.classList.add("virada");
  carta.textContent = carta.dataset.valor;

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
        carta.textContent = "";
        carta.classList.remove("virada");
        cartaVirada.textContent = "";
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

// === TETRIS (Placeholder) ===
function iniciarTetris() {
  tetrisCtx.fillStyle = "#222";
  tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
  tetrisCtx.fillStyle = "white";
  tetrisCtx.font = "16px Arial";
  tetrisCtx.fillText("Tetris em construção...", 20, 200);
}
