// === Variáveis e Elementos ===
let jogo = null;
let animFrameId = null;

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

// --- Navegação ---
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
  if(animFrameId) cancelAnimationFrame(animFrameId);
  jogo = null;
  esconderTudo();
  limparTelas();
  clearInterval(snakeTimer);
}

function esconderTudo() {
  gameCanvas.style.display = "none";
  tetrisCanvas.style.display = "none";
  memoriaContainer.style.display = "none";
  mobileControls.style.display = "none";
  btnRotate.style.display = "none";
}

function limparTelas() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
  memoriaGrid.innerHTML = "";
  faseAtualEl.textContent = "Fase 1";
}

// --- Iniciar jogo ---
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

// --- Controles móveis ---
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

// =====================
// === JOGO DA COBRINHA ===
let snake;
let snakeDir;
let snakeNextDir;
let snakeFood;
let snakeSize = 20;
let snakeSpeed = 100;
let snakeTimer;

function iniciarSnake() {
  snake = [{x:10, y:10}];
  snakeDir = "RIGHT";
  snakeNextDir = "RIGHT";
  snakeFood = geraPosicaoFood();
  clearInterval(snakeTimer);
  snakeTimer = setInterval(snakeLoop, snakeSpeed);
  animFrameId = requestAnimationFrame(snakeDraw);
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

  if(head.x < 0 || head.x >= gameCanvas.width/snakeSize || head.y < 0 || head.y >= gameCanvas.height/snakeSize || colisaoComCorpo(head)) {
    alert("Fim de jogo! Sua pontuação: " + (snake.length - 1));
    iniciarSnake();
    return;
  }

  snake.unshift(head);

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

  gameCtx.fillStyle = "red";
  gameCtx.fillRect(snakeFood.x * snakeSize, snakeFood.y * snakeSize, snakeSize, snakeSize);

  gameCtx.fillStyle = "lime";
  snake.forEach(seg => {
    gameCtx.fillRect(seg.x * snakeSize, seg.y * snakeSize, snakeSize, snakeSize);
  });

  animFrameId = requestAnimationFrame(snakeDraw);
}

function snakeChangeDirection(dir) {
  if(dir === "UP" && snakeDir !== "DOWN") snakeNextDir = dir;
  else if(dir === "DOWN" && snakeDir !== "UP") snakeNextDir = dir;
  else if(dir === "LEFT" && snakeDir !== "RIGHT") snakeNextDir = dir;
  else if(dir === "RIGHT" && snakeDir !== "LEFT") snakeNextDir = dir;
}

document.addEventListener("keydown", e => {
  if(jogo === "snake") {
    if(e.key === "ArrowUp") snakeChangeDirection("UP");
    else if(e.key === "ArrowDown") snakeChangeDirection("DOWN");
    else if(e.key === "ArrowLeft") snakeChangeDirection("LEFT");
    else if(e.key === "ArrowRight") snakeChangeDirection("RIGHT");
  }
});

// =====================
// === JOGO PONG ===
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

  animFrameId = requestAnimationFrame(pongLoop);
}

function pongLoop() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  pongBallX += pongBallSpeedX;
  pongBallY += pongBallSpeedY;

  if(pongBallY <= 0 || pongBallY + pongBallSize >= gameCanvas.height) pongBallSpeedY *= -1;

  // Colisão com raquetes
  if(pongBallX <= pongPaddleWidth) {
    if(pongBallY + pongBallSize >= pongLeftY && pongBallY <= pongLeftY + pongPaddleHeight) {
      pongBallSpeedX *= -1;
      let deltaY = pongBallY - (pongLeftY + pongPaddleHeight/2);
      pongBallSpeedY = deltaY * 0.2;
    } else {
      alert("Jogador Direita venceu!");
      iniciarPong();
      return;
    }
  }

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

  pongLeftY += pongLeftSpeed;
  pongRightY += pongRightSpeed;

  pongLeftY = Math.min(Math.max(0, pongLeftY), gameCanvas.height - pongPaddleHeight);
  pongRightY = Math.min(Math.max(0, pongRightY), gameCanvas.height - pongPaddleHeight);

  gameCtx.fillStyle = "white";
  gameCtx.fillRect(0, pongLeftY, pongPaddleWidth, pongPaddleHeight);
  gameCtx.fillRect(gameCanvas.width - pongPaddleWidth, pongRightY, pongPaddleWidth, pongPaddleHeight);

  gameCtx.fillRect(pongBallX, pongBallY, pongBallSize, pongBallSize);

  animFrameId = requestAnimationFrame(pongLoop);
}

function pongChangeDirection(dir) {
  if(dir === "UP") pongLeftSpeed = -7;
  else if(dir === "DOWN") pongLeftSpeed = 7;
  else if(dir === "LEFT") pongRightSpeed = -7;
  else if(dir === "RIGHT") pongRightSpeed = 7;
}

document.addEventListener("keydown", e => {
  if(jogo === "pong") {
    switch(e.key) {
      case "w": pongLeftSpeed = -7; break;
      case "s": pongLeftSpeed = 7; break;
      case "ArrowUp": pongRightSpeed = -7; break;
      case "ArrowDown": pongRightSpeed = 7; break;
    }
  }
});

document.addEventListener("keyup", e => {
  if(jogo === "pong") {
    switch(e.key) {
      case "w": case "s": pongLeftSpeed = 0; break;
      case "ArrowUp": case "ArrowDown": pongRightSpeed = 0; break;
    }
  }
});

// =====================
// === JOGO DA MEMÓRIA ===
let memoriaCards = [];
let memoriaFlipped = [];
let memoriaMatched = [];
let memoriaFase = 1;
let memoriaJogando = false;

const simbolos = ["🍎","🍌","🍇","🍉","🍒","🍍","🥝","🥥"];

function iniciarMemoria() {
  memoriaFase = 1;
  iniciarFaseMemoria(memoriaFase);
  btnIniciarMemoria.style.display = "inline-block";
  btnProximaFase.style.display = "none";
}

btnIniciarMemoria.onclick = () => {
  if(!memoriaJogando) {
    memoriaJogando = true;
    btnIniciarMemoria.style.display = "none";
    baralharEExibir();
  }
};

btnProximaFase.onclick = () => {
  memoriaFase++;
  iniciarFaseMemoria(memoriaFase);
  btnIniciarMemoria.style.display = "inline-block";
  btnProximaFase.style.display = "none";
  memoriaJogando = false;
};

function iniciarFaseMemoria(fase) {
  faseAtualEl.textContent = "Fase " + fase;
  memoriaGrid.innerHTML = "";
  memoriaCards = [];
  memoriaFlipped = [];
  memoriaMatched = [];

  let qtdPares = Math.min(fase + 2, simbolos.length);
  let pares = simbolos.slice(0, qtdPares);
  memoriaCards = [...pares, ...pares];
  baralharArray(memoriaCards);

  memoriaCards.forEach((simbolo, i) => {
    const card = document.createElement("div");
    card.classList.add("memoria-card");
    card.dataset.simbolo = simbolo;
    card.dataset.index = i;
    card.textContent = "";
    card.onclick = () => virarCarta(card);
    memoriaGrid.appendChild(card);
  });
}

function baralharArray(array) {
  for(let i=array.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function baralharEExibir() {
  const cards = document.querySelectorAll(".memoria-card");
  cards.forEach(card => card.textContent = "");
}

function virarCarta(card) {
  if(!memoriaJogando) return;
  if(memoriaFlipped.includes(card) || memoriaMatched.includes(card)) return;
  if(memoriaFlipped.length === 2) return;

  card.textContent = card.dataset.simbolo;
  card.classList.add("flipped");
  memoriaFlipped.push(card);

  if(memoriaFlipped.length === 2) {
    setTimeout(() => {
      checarPar();
    }, 800);
  }
}

function checarPar() {
  const [c1, c2] = memoriaFlipped;
  if(c1.dataset.simbolo === c2.dataset.simbolo) {
    memoriaMatched.push(c1, c2);
    if(memoriaMatched.length === memoriaCards.length) {
      btnProximaFase.style.display = "inline-block";
      memoriaJogando = false;
    }
  } else {
    c1.textContent = "";
    c2.textContent = "";
    c1.classList.remove("flipped");
    c2.classList.remove("flipped");
  }
  memoriaFlipped = [];
}

// =====================
// === JOGO TETRIS ===
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

let arena = createMatrix(COLS, ROWS);
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

let player = {
  pos: {x:0, y:0},
  matrix: null,
  score: 0,
};

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

function createMatrix(w,h) {
  const matrix = [];
  for(let i=0; i<h; i++) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function criarPeca(type) {
  switch(type) {
    case 'T':
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    case 'O':
      return [
        [2, 2],
        [2, 2],
      ];
    case 'L':
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
      ];
    case 'J':
      return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0],
      ];
    case 'I':
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
      ];
    case 'S':
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    case 'Z':
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ];
  }
}

function playerReset() {
  const pieces = 'TJLOSZI';
  player.matrix = criarPeca(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

  if(collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
  }
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for(let y=0; y<m.length; y++) {
    for(let x=0; x<m[y].length; x++) {
      if(m[y][x] !== 0 &&
        (arena[y + o.y] &&
         arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value,x) => {
      if(value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function arenaSweep() {
  let rowCount = 1;
  outer: for(let y = arena.length -1; y>=0; y--) {
    for(let x=0; x<arena[y].length; x++) {
      if(arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    y++;
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function playerDrop() {
  player.pos.y++;
  if(collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if(collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  rotate(player.matrix, dir);
  if(collide(arena, player)) {
    rotate(player.matrix, -dir);
  }
}

function rotate(matrix, dir) {
  for(let y=0; y<matrix.length; y++) {
    for(let x=0; x<y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if(dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row,y) => {
    row.forEach((value,x) => {
      if(value !== 0) {
        tetrisCtx.fillStyle = colors[value];
        tetrisCtx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
      }
    });
  });
}

function draw() {
  tetrisCtx.fillStyle = "#000";
  tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

  drawMatrix(arena, {x:0,y:0});
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if(dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  animFrameId = requestAnimationFrame(update);
}

function iniciarTetris() {
  arena = createMatrix(COLS, ROWS);
  playerReset();
  player.score = 0;
  lastTime = 0;
  dropCounter = 0;
  animFrameId = requestAnimationFrame(update);
}

function tetrisMoveLeft() {
  playerMove(-1);
}

function tetrisMoveRight() {
  playerMove(1);
}

function tetrisDrop() {
  playerDrop();
}

function tetrisRotate() {
  playerRotate(1);
}

document.addEventListener("keydown", e => {
  if(jogo === "tetris") {
    switch(e.key) {
      case "ArrowLeft": tetrisMoveLeft(); break;
      case "ArrowRight": tetrisMoveRight(); break;
      case "ArrowDown": tetrisDrop(); break;
      case "ArrowUp": tetrisRotate(); break;
    }
  }
});
