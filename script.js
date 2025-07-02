// --- Navegação e variáveis globais ---
let jogo = null;

const telaInicial = document.getElementById("telaInicial");
const telaJogos = document.getElementById("telaJogos");
const btnEntrar = document.getElementById("btnEntrar");
const btnVoltar = document.getElementById("btnVoltar");

const gameCanvas = document.getElementById("gameCanvas");
const gameCtx = gameCanvas.getContext("2d");

const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");

const memoriaContainer = document.getElementById("memoriaContainer");
const memoriaGrid = document.getElementById("memoriaGrid");
const faseAtualEl = document.getElementById("faseAtual");
const btnIniciarMemoria = document.getElementById("btnIniciarMemoria");
const btnProximaFase = document.getElementById("btnProximaFase");

const mobileControls = document.getElementById("mobileControls");
const btnUp = document.getElementById("btnUp");
const btnLeft = document.getElementById("btnLeft");
const btnDown = document.getElementById("btnDown");
const btnRight = document.getElementById("btnRight");
const btnRotate = document.getElementById("btnRotate");

btnEntrar.onclick = () => {
  telaInicial.style.display = "none";
  telaJogos.style.display = "block";
};

btnVoltar.onclick = () => {
  pararJogoAtual();
  telaInicial.style.display = "block";
  telaJogos.style.display = "none";
};

function pararJogoAtual() {
  cancelAnimationFrame(animFrameId);
  jogo = null;
  limparTelas();
  esconderTudo();
}

function limparTelas() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
  memoriaGrid.innerHTML = "";
  faseAtualEl.textContent = "Fase 1";
}

function esconderTudo() {
  gameCanvas.style.display = "none";
  tetrisCanvas.style.display = "none";
  memoriaContainer.style.display = "none";
  mobileControls.style.display = "none";
  btnRotate.style.display = "none";
}

function iniciarJogo(tipo) {
  pararJogoAtual();
  jogo = tipo;
  telaInicial.style.display = "none";
  telaJogos.style.display = "none";

  if (tipo === "snake" || tipo === "pong") {
    gameCanvas.style.display = "block";
    mobileControls.style.display = "flex";
    btnRotate.style.display = "none";
    if(tipo === "snake") iniciarSnake();
    else iniciarPong();
  } else if(tipo === "memoria") {
    memoriaContainer.style.display = "block";
    mobileControls.style.display = "none";
    iniciarMemoria();
  } else if(tipo === "tetris") {
    tetrisCanvas.style.display = "block";
    mobileControls.style.display = "flex";
    btnRotate.style.display = "inline-block";
    iniciarTetris();
  }
}

// --- Controle dos botões móveis ---
btnUp.onclick = () => {
  if(jogo === "snake") snakeChangeDirection("UP");
  else if(jogo === "pong") pongChangeDirection("UP");
  else if(jogo === "tetris") tetrisRotate();
};

btnLeft.onclick = () => {
  if(jogo === "snake") snakeChangeDirection("LEFT");
  else if(jogo === "pong") pongChangeDirection("LEFT");
  else if(jogo === "tetris") tetrisMoveLeft();
};

btnDown.onclick = () => {
  if(jogo === "snake") snakeChangeDirection("DOWN");
  else if(jogo === "pong") pongChangeDirection("DOWN");
  else if(jogo === "tetris") tetrisDrop();
};

btnRight.onclick = () => {
  if(jogo === "snake") snakeChangeDirection("RIGHT");
  else if(jogo === "pong") pongChangeDirection("RIGHT");
  else if(jogo === "tetris") tetrisMoveRight();
};

btnRotate.onclick = () => {
  if(jogo === "tetris") tetrisRotate();
};

// -----------------
// --- SNAKE ---
// -----------------
let snake;
let snakeDir;
let snakeNextDir;
let snakeFood;
let snakeSize = 20;
let snakeSpeed = 100; // ms
let snakeTimer;
let animFrameId;

function iniciarSnake() {
  snake = [{x:10, y:10}];
  snakeDir = "RIGHT";
  snakeNextDir = "RIGHT";
  snakeFood = geraPosicaoFood();
  if(snakeTimer) clearInterval(snakeTimer);
  snakeTimer = setInterval(snakeLoop, snakeSpeed);
  window.requestAnimationFrame(snakeDraw);
}

function geraPosicaoFood() {
  return {
    x: Math.floor(Math.random() * (gameCanvas.width / snakeSize)),
    y: Math.floor(Math.random() * (gameCanvas.height / snakeSize))
  };
}

function snakeLoop() {
  snakeDir = snakeNextDir;
  const head = {...snake[0]};

  if(snakeDir === "UP") head.y--;
  else if(snakeDir === "DOWN") head.y++;
  else if(snakeDir === "LEFT") head.x--;
  else if(snakeDir === "RIGHT") head.x++;

  // Colisão com parede
  if(head.x < 0 || head.x >= gameCanvas.width/snakeSize || head.y < 0 || head.y >= gameCanvas.height/snakeSize || colisaoComCorpo(head)) {
    alert("Fim de jogo! Sua pontuação: " + (snake.length - 1));
    iniciarSnake();
    return;
  }

  snake.unshift(head);

  // Comida
  if(head.x === snakeFood.x && head.y === snakeFood.y) {
    snakeFood = geraPosicaoFood();
  } else {
    snake.pop();
  }
}

function colisaoComCorpo(pos) {
  return snake.some((seg, i) => i !== 0 && seg.x === pos.x && seg.y === pos.y);
}

function snakeDraw() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Desenhar comida
  gameCtx.fillStyle = "red";
  gameCtx.fillRect(snakeFood.x * snakeSize, snakeFood.y * snakeSize, snakeSize, snakeSize);

  // Desenhar cobra
  gameCtx.fillStyle = "lime";
  snake.forEach(seg => {
    gameCtx.fillRect(seg.x * snakeSize, seg.y * snakeSize, snakeSize, snakeSize);
  });

  animFrameId = window.requestAnimationFrame(snakeDraw);
}

function snakeChangeDirection(dir) {
  // Impede reversão direta
  if(dir === "UP" && snakeDir !== "DOWN") snakeNextDir = dir;
  else if(dir === "DOWN" && snakeDir !== "UP") snakeNextDir = dir;
  else if(dir === "LEFT" && snakeDir !== "RIGHT") snakeNextDir = dir;
  else if(dir === "RIGHT" && snakeDir !== "LEFT") snakeNextDir = dir;
}

// Controle teclado Snake
document.addEventListener("keydown", e => {
  if(jogo === "snake") {
    if(e.key === "ArrowUp") snakeChangeDirection("UP");
    else if(e.key === "ArrowDown") snakeChangeDirection("DOWN");
    else if(e.key === "ArrowLeft") snakeChangeDirection("LEFT");
    else if(e.key === "ArrowRight") snakeChangeDirection("RIGHT");
  }
});

// -----------------
// --- PONG ---
// -----------------
let pongPaddleHeight = 80;
let pongPaddleWidth = 10;
let pongBallSize = 12;

let pongLeftY;
let pongRightY;
let pongLeftSpeed = 0;
let pongRightSpeed = 0;

let pongBallX;
let pongBallY;
let pongBallSpeedX;
let pongBallSpeedY;

function iniciarPong() {
  pongLeftY = gameCanvas.height/2 - pongPaddleHeight/2;
  pongRightY = pongLeftY;
  pongBallX = gameCanvas.width/2;
  pongBallY = gameCanvas.height/2;

  pongBallSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  pongBallSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);

  window.requestAnimationFrame(pongLoop);
}

function pongLoop() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Bola
  pongBallX += pongBallSpeedX;
  pongBallY += pongBallSpeedY;

  // Rebater nas paredes superior e inferior
  if(pongBallY <= 0 || pongBallY + pongBallSize >= gameCanvas.height) pongBallSpeedY *= -1;

  // Rebater nas raquetes
  // Raquete esquerda
  if(pongBallX <= pongPaddleWidth) {
    if(pongBallY + pongBallSize >= pongLeftY && pongBallY <= pongLeftY + pongPaddleHeight) {
      pongBallSpeedX *= -1;
      // Modifica velocidade vertical para variar o ângulo
      let deltaY = pongBallY - (pongLeftY + pongPaddleHeight/2);
      pongBallSpeedY = deltaY * 0.2;
    } else {
      alert("Jogador Direita venceu!");
      iniciarPong();
      return;
    }
  }

  // Raquete direita
  if(pongBallX + pongBallSize >= gameCanvas.width - pongPaddleWidth) {
    if(pongBallY + pongBallSize >= pongRightY && pongBallY <= pongRightY + pongPaddleHeight) {
      pongBallSpeedX *= -1;
      let deltaY = pongBallY - (pongRightY + pongPaddleHeight/2);
      pongBallSpeedY = deltaY * 0.2;
    } else {
      alert("Jogador Esquerda venceu!");
      iniciarPong();
      return;
    }
  }

  // Atualizar posição das raquetes (com velocidade)
  pongLeftY += pongLeftSpeed;
  pongRightY += pongRightSpeed;

  // Limites raquetes
  pongLeftY = Math.min(Math.max(0, pongLeftY), gameCanvas.height - pongPaddleHeight);
  pongRightY = Math.min(Math.max(0, pongRightY), gameCanvas.height - pongPaddleHeight);

  // Desenhar raquetes
  gameCtx.fillStyle = "white";
  gameCtx.fillRect(0, pongLeftY, pongPaddleWidth, pongPaddleHeight);
  gameCtx.fillRect(gameCanvas.width - pongPaddleWidth, pongRightY, pongPaddleWidth, pongPaddleHeight);

  // Desenhar bola
  gameCtx.fillRect(pongBallX, pongBallY, pongBallSize, pongBallSize);

  animFrameId = window.requestAnimationFrame(pongLoop);
}

// Controle teclado Pong
document.addEventListener("keydown", e => {
  if(jogo === "pong") {
    switch(e.key) {
      case "w": pongLeftSpeed = -7; break;
      case "s": pongLeftSpeed = 7; break;
      case "ArrowUp":
