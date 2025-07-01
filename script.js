function mostrarGaleria() {
  document.getElementById('telaInicial').style.display = 'none';
  document.getElementById('galeriaJogos').style.display = 'block';
}

function iniciarJogo(nome) {
  // Esconder todos elementos de jogos
  document.getElementById('gameCanvas').style.display = 'none';
  document.getElementById('memoriaContainer').style.display = 'none';
  const btnReiniciar = document.getElementById('btnReiniciar');
  if (btnReiniciar) btnReiniciar.style.display = 'none';

  if (nome === 'snake') {
    document.getElementById('gameCanvas').style.display = 'block';
    iniciarSnake();
  } else if (nome === 'pong') {
    alert('🏓 Pong em construção!');
  } else if (nome === 'memoria') {
    document.getElementById('memoriaContainer').style.display = 'flex';
    iniciarMemoria();
  }
}

/* ----- Jogo da Cobrinha (Snake) ----- */

let game; 
let snake = [];
let food = {};
let d;
const box = 20;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let gameOverAnim = false;

function iniciarSnake() {
  clearInterval(game);
  d = null;
  snake = [{ x: 9 * box, y: 10 * box }];
  food = { x: Math.floor(Math.random() * 19) * box, y: Math.floor(Math.random() * 19) * box };
  gameOverAnim = false;

  // Criar botão reiniciar se não existir
  if (!document.getElementById("btnReiniciar")) {
    const btn = document.createElement("button");
    btn.id = "btnReiniciar";
    btn.textContent = "Reiniciar";
    btn.style.display = "none";
    btn.style.marginTop = "20px";
    btn.style.padding = "10px 20px";
    btn.style.fontSize = "1.2em";
    btn.style.cursor = "pointer";
    btn.onclick = () => {
      btn.style.display = "none";
      iniciarSnake();
    };
    canvas.parentNode.appendChild(btn);
  }
  document.getElementById("btnReiniciar").style.display = "none";

  document.addEventListener("keydown", direction);

  game = setInterval(draw, 150); // velocidade mais lenta
}

function direction(event) {
  if (gameOverAnim) return; // não aceitar comandos se acabou
  if (event.keyCode === 37 && d !== "RIGHT") d = "LEFT";
  else if (event.keyCode === 38 && d !== "DOWN") d = "UP";
  else if (event.keyCode === 39 && d !== "LEFT") d = "RIGHT";
  else if (event.keyCode === 40 && d !== "UP") d = "DOWN";
}

function draw() {
  // Fundo com textura de grade clara
  ctx.fillStyle = "#0a1a1f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < canvas.width; x += box) {
    for (let y = 0; y < canvas.height; y += box) {
      ctx.strokeStyle = "#072b33";
      ctx.strokeRect(x, y, box, box);
    }
  }

  // Desenhar a comida com um círculo vermelho com sombra
  ctx.fillStyle = "crimson";
  ctx.shadowColor = "rgba(255,0,0,0.7)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(food.x + box/2, food.y + box/2, box/2 - 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Desenhar a cobrinha: cabeça verde limão, corpo em verde com sombra suave
  snake.forEach((part, i) => {
    if (i === 0) {
      ctx.fillStyle = "#b6ff00"; // cabeça verde limão
      ctx.shadowColor = "rgba(182,255,0,0.8)";
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = "#3cb371"; // corpo verde médio
      ctx.shadowColor = "rgba(60,179,113,0.6)";
      ctx.shadowBlur = 8;
    }
    ctx.fillRect(part.x, part.y, box, box);
    ctx.shadowBlur = 0;
  });

  // Atualiza posição da cabeça da cobra
  let headX = snake[0].x;
  let headY = snake[0].y;
  if (d === "LEFT") headX -= box;
  if (d === "UP") headY -= box;
  if (d === "RIGHT") headX += box;
  if (d === "DOWN") headY += box;

  // Comeu comida
  if (headX === food.x && headY === food.y) {
    food = {
      x: Math.floor(Math.random() * 19) * box,
      y: Math.floor(Math.random() * 19) * box,
    };
  } else {
    snake.pop();
  }

  let newHead = { x: headX, y: headY };

  // Checar colisão com borda ou com o próprio corpo
  if (
    headX < 0 || headX >= canvas.width ||
    headY < 0 || headY >= canvas.height ||
    snake.some(s => s.x === newHead.x && s.y === newHead.y)
  ) {
    clearInterval(game);
    animarGameOver();
    return;
  }

  snake.unshift(newHead);
}

// Animação simples de piscar a tela em vermelho para Game Over
function animarGameOver() {
  gameOverAnim = true;
  let count = 0;
  const piscar = setInterval(() => {
    if (count % 2 === 0) {
      canvas.style.backgroundColor = "rgba(255,0,0,0.7)";
    } else {
      canvas.style.backgroundColor = "";
    }
    count++;
    if (count > 5) {
      clearInterval(piscar);
      canvas.style.backgroundColor = "";
      alert("Game Over!");
      document.getElementById("btnReiniciar").style.display = "inline-block";
    }
  }, 300);
}

/* ----- Jogo da Memória ----- */

function iniciarMemoria() {
  const container = document.getElementById("memoriaContainer");
  container.innerHTML = "";
  const emojis = ['🍎','🍌','🍇','🍓','🍍','🍒'];
  const cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
  let first = null;
  let lock = false;

  cards.forEach((emoji) => {
    const card = document.createElement("div");
    card.className = "card-memoria";
    card.textContent = "";
    card.dataset.emoji = emoji;
    card.addEventListener("click", () => {
      if (lock || card.classList.contains("matched") || card.textContent) return;
      card.textContent = emoji;
      if (!first) {
        first = card;
      } else {
        if (first.dataset.emoji === card.dataset.emoji) {
          first.classList.add("matched");
          card.classList.add("matched");
          first = null;
        } else {
          lock = true;
          setTimeout(() => {
            first.textContent = "";
            card.textContent = "";
            first = null;
            lock = false;
          }, 1000);
        }
      }
    });
    container.appendChild(card);
  });
}
