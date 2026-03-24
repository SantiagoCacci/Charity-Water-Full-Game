const gameBoard = document.getElementById("gameBoard");
const movesDisplay = document.getElementById("moves");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficulty");
const checkBtn = document.getElementById("checkBtn");

const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const gameUI = document.getElementById("gameUI");

let size = 5;
let moves = 0;
let board = [];

/* START */
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameUI.style.display = "block";
  createBoard();
});

/* PIPE TYPES (MATCH YOUR IMAGE ORIENTATION) */
const pipeTypes = [
  { type: "straight", connections: ["left", "right"], image: "img/straight.png" },
  { type: "corner", connections: ["right", "bottom"], image: "img/corner.png" },
  { type: "tee", connections: ["left", "right", "bottom"], image: "img/tee.png" }
];

/* ROTATE CONNECTIONS BASED ON IMAGE */
function rotateConnections(connections, rotation) {
  const dirs = ["top", "right", "bottom", "left"];
  const shift = rotation / 90;

  return connections.map(dir => {
    let index = dirs.indexOf(dir);
    return dirs[(index + shift) % 4];
  });
}

function getConnections(type, rotation) {
  const base = pipeTypes.find(p => p.type === type).connections;
  return rotateConnections(base, rotation);
}

/* CREATE BOARD (SOLVABLE) */
function createBoard() {
  gameBoard.innerHTML = "";
  board = [];
  moves = 0;
  movesDisplay.textContent = moves;

  gameBoard.style.gridTemplateColumns = `repeat(${size}, 70px)`;

  // EMPTY GRID
  for (let r = 0; r < size; r++) {
    board.push(Array(size).fill(null));
  }

  // CREATE PATH
  let path = [[0, 0]];
  let r = 0, c = 0;

  while (r < size - 1 || c < size - 1) {
    if (r === size - 1) c++;
    else if (c === size - 1) r++;
    else if (Math.random() < 0.5) c++;
    else r++;

    path.push([r, c]);
  }

  // PLACE PATH
  for (let i = 0; i < path.length; i++) {
    let [pr, pc] = path[i];

    let type = "straight";
    let rotation = 0;

    if (i === 0) {
      let [nr, nc] = path[i + 1];
      if (nc > pc) rotation = 0;      // right
      else rotation = 90;             // down
    }
    else if (i === path.length - 1) {
      let [prvR, prvC] = path[i - 1];
      if (prvC < pc) rotation = 180;  // from left
      else rotation = 270;            // from up
    }
    else {
      let [prvR, prvC] = path[i - 1];
      let [nr, nc] = path[i + 1];

      if (prvR === nr) {
        type = "straight";
        rotation = 0; // horizontal
      } else if (prvC === nc) {
        type = "straight";
        rotation = 90; // vertical
      } else {
        type = "corner";

        if (prvR < pr && nc > pc) rotation = 270;
        else if (prvC < pc && nr > pr) rotation = 0;
        else if (prvR > pr && nc < pc) rotation = 90;
        else rotation = 180;
      }
    }

    board[pr][pc] = { type, rotation, isPath: true };
  }

  // FILL RANDOM
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]) continue;

      const rand = pipeTypes[Math.floor(Math.random() * pipeTypes.length)];

      board[r][c] = {
        type: rand.type,
        rotation: Math.floor(Math.random() * 4) * 90
      };
    }
  }

  // RENDER
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {

      let tile = board[r][c];

      const pipe = document.createElement("div");
      pipe.classList.add("pipe");

      if (r === 0 && c === 0) pipe.classList.add("start");
      if (r === size - 1 && c === size - 1) pipe.classList.add("end");

      pipe.dataset.type = tile.type;
      pipe.dataset.rotation = tile.rotation;

      const img = pipeTypes.find(p => p.type === tile.type).image;
      pipe.style.backgroundImage = `url(${img})`;
      pipe.style.transform = `rotate(${tile.rotation}deg)`;

      if (!(r === 0 && c === 0) && !(r === size - 1 && c === size - 1)) {
        pipe.addEventListener("click", () => rotatePipe(pipe));
      }

      gameBoard.appendChild(pipe);
      tile.element = pipe;
    }
  }

  shuffleBoard();
}

/* ROTATE */
function rotatePipe(pipe) {
  let rotation = parseInt(pipe.dataset.rotation);
  rotation = (rotation + 90) % 360;

  pipe.dataset.rotation = rotation;
  pipe.style.transform = `rotate(${rotation}deg)`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c].element === pipe) {
        board[r][c].rotation = rotation;
      }
    }
  }

  moves++;
  movesDisplay.textContent = moves;
}

/* CHECK WIN */
function checkWin() {
  let visited = Array.from({ length: size }, () => Array(size).fill(false));
  let queue = [[0, 0]];
  visited[0][0] = true;

  while (queue.length > 0) {
    let [r, c] = queue.shift();
    let current = board[r][c];
    let connections = getConnections(current.type, current.rotation);

    for (let dir of connections) {
      let nr = r, nc = c;

      if (dir === "top") nr--;
      if (dir === "bottom") nr++;
      if (dir === "left") nc--;
      if (dir === "right") nc++;

      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        let neighbor = board[nr][nc];
        let neighborConnections = getConnections(neighbor.type, neighbor.rotation);

        const opposite = {
          top: "bottom",
          bottom: "top",
          left: "right",
          right: "left"
        };

        if (
          neighborConnections.includes(opposite[dir]) &&
          !visited[nr][nc]
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
  }

  if (visited[size - 1][size - 1]) {
    alert("💧 Water flows! You win!");
  } else {
    alert("❌ Not connected yet!");
  }
}

/* SHUFFLE */
function shuffleBoard() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {

      if ((r === 0 && c === 0) || (r === size - 1 && c === size - 1)) continue;

      let tile = board[r][c];
      let randomRot = Math.floor(Math.random() * 4) * 90;

      tile.rotation = randomRot;
      tile.element.dataset.rotation = randomRot;
      tile.element.style.transform = `rotate(${randomRot}deg)`;
    }
  }
}

/* EVENTS */
resetBtn.addEventListener("click", createBoard);

difficultySelect.addEventListener("change", () => {
  const value = difficultySelect.value;

  if (value === "easy") size = 4;
  if (value === "medium") size = 5;
  if (value === "hard") size = 6;

  createBoard();
});

checkBtn.addEventListener("click", checkWin);