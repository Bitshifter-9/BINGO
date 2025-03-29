const playerBoard = document.getElementById("player-board");
const computerBoard = document.getElementById("computer-board");
const playerBingoDisplay = document.getElementById("player-bingo");
const computerBingoDisplay = document.getElementById("computer-bingo");
const statusDisplay = document.getElementById("status");
const playerButton = document.getElementById("player-turn");
const computerCardSection = document.getElementById("computer-card-section");
const instructionsBtn = document.getElementById("instructions-btn");
const instructions = document.getElementById("instructions");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const pointSound = document.getElementById("pointSound");

let playerPoints = 0;
let computerPoints = 0;
let availableNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
let playerCompletedLines = new Set();
let computerCompletedLines = new Set();

function generateCard() {
  const shuffledNumbers = [...availableNumbers].sort(() => Math.random() - 0.5);
  return shuffledNumbers.slice(0, 25);
}

const playerCard = generateCard();
const computerCard = generateCard();

function createBoard(card, element, isPlayer = true) {
  card.forEach((number, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.textContent = number;
    cell.dataset.index = index;
    if (isPlayer) cell.onclick = () => handlePlayerChoice(number);
    element.appendChild(cell);
  });
}

createBoard(playerCard, playerBoard);
createBoard(computerCard, computerBoard, false);

function handlePlayerChoice(number) {
  if (!availableNumbers.includes(number)) {
    alert("Number already chosen. Pick another.");
    return;
  }
  markNumber(playerCard, number, true);
  markNumber(computerCard, number, false);
  availableNumbers = availableNumbers.filter((n) => n !== number);
  checkPoints(playerCard, true);
  checkPoints(computerCard, false);
  clickSound.play();
  if (playerPoints >= 5 || computerPoints >= 5) return endGame();
  playerButton.disabled = true;
  setTimeout(computerTurn, 1000);
}

function computerTurn() {
  const bestMove = findBestMove();
  const number =
    Math.random() < 0.5 && bestMove
      ? bestMove
      : availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
  markNumber(computerCard, number, false);
  markNumber(playerCard, number, false, true);
  availableNumbers = availableNumbers.filter((n) => n !== number);
  checkPoints(playerCard, true);
  checkPoints(computerCard, false);
  clickSound.play();
  if (playerPoints >= 5 || computerPoints >= 5) return endGame();
  playerButton.disabled = false;
  statusDisplay.textContent = `Computer chose ${number}`;
}

function findBestMove() {
  let bestScore = -1;
  let bestNumber = null;

  for (const number of availableNumbers) {
    const tempCard = [...computerCard];
    const index = tempCard.indexOf(number);
    if (index === -1) continue;
    tempCard[index] = -1;

    const score = evaluateBoard(tempCard);
    if (score > bestScore) {
      bestScore = score;
      bestNumber = number;
    }
  }
  return bestNumber;
}

function evaluateBoard(card) {
  let score = 0;
  const size = 5;
  const marked = (i) => card[i] === -1;

  for (let i = 0; i < size; i++) {
    const markedCount = [...Array(size)].filter((_, j) =>
      marked(i * size + j)
    ).length;
    score += markedCount;
  }

  for (let i = 0; i < size; i++) {
    const markedCount = [...Array(size)].filter((_, j) =>
      marked(j * size + i)
    ).length;
    score += markedCount;
  }

  const primaryMarked = [...Array(size)].filter((_, i) =>
    marked(i * size + i)
  ).length;
  const secondaryMarked = [...Array(size)].filter((_, i) =>
    marked(i * size + (size - 1 - i))
  ).length;
  score += primaryMarked + secondaryMarked;

  return score;
}

function markNumber(card, number, isPlayer, computerChoice = false) {
  const index = card.indexOf(number);
  if (index === -1) return;
  const cell = isPlayer
    ? playerBoard.children[index]
    : computerBoard.children[index];

  if (isPlayer) {
    cell.classList.add("marked");
  } else if (computerChoice) {
    playerBoard.children[index].classList.add("marked-computer");
  } else {
    cell.classList.add("marked-computer");
  }
  card[index] = -1;
}

function checkPoints(card, isPlayer) {
  const size = 5;
  const marked = (i) => card[i] === -1;
  const completedLines = isPlayer
    ? playerCompletedLines
    : computerCompletedLines;

  for (let i = 0; i < size; i++) {
    const rowKey = `row-${i}`;
    if (
      ![...Array(size)].every((_, j) => marked(i * size + j)) ||
      completedLines.has(rowKey)
    )
      continue;
    completedLines.add(rowKey);
    updatePoints(isPlayer);
    pointSound.play();
  }

  for (let i = 0; i < size; i++) {
    const colKey = `col-${i}`;
    if (
      ![...Array(size)].every((_, j) => marked(j * size + i)) ||
      completedLines.has(colKey)
    )
      continue;
    completedLines.add(colKey);
    updatePoints(isPlayer);
    pointSound.play();
  }

  const primaryKey = "primary-diagonal";
  if (
    ![...Array(size)].every((_, i) => marked(i * size + i)) ||
    completedLines.has(primaryKey)
  ) {
  } else {
    completedLines.add(primaryKey);
    updatePoints(isPlayer);
    pointSound.play();
  }

  const secondaryKey = "secondary-diagonal";
  if (
    ![...Array(size)].every((_, i) => marked(i * size + (size - 1 - i))) ||
    completedLines.has(secondaryKey)
  ) {
  } else {
    completedLines.add(secondaryKey);
    updatePoints(isPlayer);
    pointSound.play();
  }
}

function updatePoints(isPlayer) {
  if (isPlayer) {
    playerPoints++;
    updateBingoDisplay(playerBingoDisplay, playerPoints);
  } else {
    computerPoints++;
    updateBingoDisplay(computerBingoDisplay, computerPoints);
  }
}

function updateBingoDisplay(element, points) {
  const bingo = "BINGO";
  let html = "";
  for (let i = 0; i < bingo.length; i++) {
    html += points > i ? `<span class="crossed">${bingo[i]}</span>` : bingo[i];
  }
  element.innerHTML = html;
}

function endGame() {
  statusDisplay.textContent =
    playerPoints >= 5 ? "You win! 🎉" : "Computer wins! 💻";
  playerButton.disabled = true;
  computerCardSection.classList.add("show");
  if (playerPoints >= 5) winSound.play();
  else loseSound.play();
}

instructionsBtn.onclick = () => {
  instructions.classList.toggle("hidden");
  clickSound.play();
};

playerButton.disabled = false;
