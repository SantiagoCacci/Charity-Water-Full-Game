// Get elements
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const gameUI = document.getElementById("gameUI");
const board = document.getElementById("gameBoard");
const movesDisplay = document.getElementById("moves");
const resetBtn = document.getElementById("resetBtn");

let moves = 0;

// Start button logic
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameUI.style.display = "block";
  createBoard();
});
// Reset button logic
resetBtn.addEventListener("click", () => {
  createBoard();
});

function createBoard() {
  board.innerHTML = "";
  moves = 0;
  movesDisplay.textContent = moves;

  const pipeTypes = ["┃", "━", "┗", "┓", "┏", "┛"];

  for (let i = 0; i < 25; i++) {
    let pipe = document.createElement("div");
    pipe.classList.add("pipe");

    pipe.dataset.rotation = 0;
    pipe.innerHTML = pipeTypes[Math.floor(Math.random() * pipeTypes.length)];

    pipe.addEventListener("click", () => rotatePipe(pipe));

    board.appendChild(pipe);
  }
}

function rotatePipe(pipe) {
  let rotation = parseInt(pipe.dataset.rotation);
  rotation = (rotation + 90) % 360;

  pipe.style.transform = `rotate(${rotation}deg)`;
  pipe.dataset.rotation = rotation;

  moves++;
  movesDisplay.textContent = moves;
}
function checkWin() {
  const pipes = document.querySelectorAll(".pipe");

  let win = true;

  pipes.forEach(pipe => {
    if (pipe.dataset.rotation != "90") {
      win = false;
    }
  });

  if (win) {
    alert("💧 Water Delivered Successfully!");
  }
}
