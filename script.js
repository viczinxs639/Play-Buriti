function mostrarGaleria() {
  document.getElementById('telaInicial').style.display = 'none';
  document.getElementById('galeriaJogos').style.display = 'block';
}

function iniciarJogo(nome) {
  document.getElementById('gameCanvas').style.display = 'none';
  document.getElementById('memoriaContainer').style.display = 'none';

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

// Snake
function iniciarSnake() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const box = 20;
  let snake = [{ x: 9 * box, y: 10 * box }];
  let food = { x: Math.floor(Math.random() * 19) * box, y: Math.floor(Math.random() * 19) * box };
  let d;
  let game;
  document.addEventListener("keydown", direction);
  function direction(event) {
    if (event.keyCode === 37 && d !== "RIGHT") d = "LEFT";
    if (event.keyCode === 38 && d !== "DOWN") d = "UP";
    if (event.keyCode === 39 && d !== "LEFT") d = "RIGHT";
    if (event.keyCode === 40 && d !== "UP") d = "DOWN";
  }
  function draw() {
    ctx.clearRect(0, 0, 400, 400);
    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = i === 0 ? "green" : "white";
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);
    let headX = snake[0].x;
    let headY = snake[0].y;
    if (d === "LEFT") headX -= box;
    if (d === "UP") headY -= box;
    if (d === "RIGHT") headX += box;
    if (d === "DOWN") headY += box;
    if (headX === food.x && headY === food.y) {
      food = { x: Math.floor(Math.random() * 19) * box, y: Math.floor(Math.random() * 19) * box };
    } else {
      snake.pop();
    }
    let newHead = { x: headX, y: headY };
    if (
      headX < 0 || headX >= 400 || headY < 0 || headY >= 400 ||
      snake.some((s) => s.x === newHead.x && s.y === newHead.y)
    ) {
      clearInterval(game);
      alert("Game Over!");
    }
    snake.unshift(newHead);
  }
  clearInterval(game);
  game = setInterval(draw, 100);
}

// Memória
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
