const board = document.querySelector("#game-board");
const movesDisplay = document.querySelector("#moves");
const timerDisplay = document.querySelector("#timer");
const message = document.querySelector("#message");
const restartButton = document.querySelector("#restart");
const maxTimerDisplay = document.querySelector("#maxTime");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let totalPairs = 0;
let elapsedSeconds = 0;
let timerId = null;
let gameStarted = false;

let maxTime = null;      // seconds – null means “no limit” (easy)
let level   = 'easy';    // current difficulty, set by the picker
let gameOver = false;    // stops the board when the timer runs out
let chosenType = 'emoji'  // type of the cards that user will see emoji or numbers or flowers

document.getElementById('start-game').addEventListener('click', () => {
  const selectedLevel = document.querySelector('input[name="level"]:checked').value;
  const selectedType = document.querySelector('input[name="typeCard"]:checked').value;
  startGame(selectedLevel,selectedType);
});


function startGame(chosenLevel,selectedType) {
  level = chosenLevel;               // store globally
  // decide the maximum allowed seconds for the level
  if (level === 'hard')   maxTime = 20 * 6;   // 120 s
  else if (level === 'expert') maxTime = 10 * 6; // 60 s
  else maxTime = null;                     // easy – unlimited

  chosenType = selectedType;

  // hide the picker, show the board UI
  document.getElementById('level-picked').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  if ( maxTime!== null) document.getElementById('maxTimeHidden').style.display = 'block';

  // Kick off the normal “new‑game” flow
  startNewGame();
}

async function startNewGame() {
    const endpoint = chosenType === 'emoji'? '/api/new-game-emoji' 
                                     : chosenType === 'flowers' ? '/api/new-game-flowers'
                                     : '/api/new-game-numbers';
   // if (typeCard !== 'emoji')  apyName = "/api/new-game-numbers"
    const response = await fetch(endpoint);
    const data = await response.json();

    resetGameState(data.cards.length / 2);
    buildBoard(data.cards);
}


function resetGameState(pairCount) {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    totalPairs = pairCount;
    elapsedSeconds = 0;
    gameStarted = false;
    gameOver = false; 

    clearInterval(timerId);
    timerId = null;

    movesDisplay.textContent = "0";
    timerDisplay.textContent = "0s";
    maxTimerDisplay.textContent = maxTime;
    message.textContent = "Click any card to begin.";
    board.innerHTML = "";
}

function buildBoard(cards) {
    cards.forEach((value, index) => {
        const card = document.createElement("button");
        card.className = "card";
        card.type = "button";
        card.dataset.value = value;
        card.dataset.index = index;
        card.setAttribute("aria-label", "Hidden memory card");
        card.addEventListener("click", () => flipCard(card));
        board.appendChild(card);
    });
}

function flipCard(card) {
    if (gameOver) return;
    if (lockBoard || card === firstCard || card.classList.contains("matched")) {
        return;
    }

    if (!gameStarted) {
        startTimer();
        gameStarted = true;
        message.textContent = "Find the matching pairs!";
    }

    showCard(card);

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    moves += 1;
    movesDisplay.textContent = moves;
    checkForMatch();
}

function showCard(card) {
    card.classList.add("flipped");
    card.textContent = card.dataset.value;
    card.setAttribute("aria-label", `Card showing ${card.dataset.value}`);
}

function hideCard(card) {
    card.classList.remove("flipped");
    card.textContent = "";
    card.setAttribute("aria-label", "Hidden memory card");
}

function checkForMatch() {
    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
        keepMatchedCards();
    } else {
        flipCardsBackSoon();
    }
}

function keepMatchedCards() {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    firstCard.disabled = true;
    secondCard.disabled = true;
    matchedPairs += 1;

    clearSelectedCards();

    if (matchedPairs === totalPairs) {
        finishGame();
    } else {
        message.textContent = "Nice match! Keep going.";
    }
}

function flipCardsBackSoon() {
    lockBoard = true;
    message.textContent = "Not a match. Try again!";

    setTimeout(() => {
        hideCard(firstCard);
        hideCard(secondCard);
        clearSelectedCards();
        lockBoard = false;
    }, 800);
}

function clearSelectedCards() {
    firstCard = null;
    secondCard = null;
}

function startTimer() {
    timerId = setInterval(() => {
        elapsedSeconds += 1;
        timerDisplay.textContent = `${elapsedSeconds}s`;
         // ---- NEW: stop the game if we passed the limit ----
        if (maxTime !== null && elapsedSeconds >= maxTime && !gameOver) {
            gameOver = true;          // prevent further flips
            clearInterval(timerId);
            message.textContent = `⏰ Time's up! You didn't finish in ${maxTime/60} minute${maxTime===60?'':'s'}.`;
        // disable all remaining cards
            board.querySelectorAll('button.card:not(.matched)').forEach(c => c.disabled = true);
            showGameOver("Time's up!");
        }
    }, 1000);
}

function finishGame() {
    clearInterval(timerId);
    if (gameOver) return;
    const winMsg = `You won in ${moves} moves and ${elapsedSeconds}s! 🎉`;
    message.textContent = winMsg;
    showGameOver('🎉 You won! 🎉');
}


// orig call restartButton.addEventListener("click", startNewGame);

/* ──────────────────────────────────────────────────────────────
     Restart keeps the current difficulty.
   We re‑use the global `level` that was set when the player
   first chose a setting.
   ────────────────────────────────────────────────────────────── */
restartButton.addEventListener("click", () => {
    hideGameOver();
    startGame(level,chosenType);
});

/* ──────────────────────────────────────────────────────────────
     Remove the old unconditional start.
   The page now waits for the player to pick a difficulty.
   ────────────────────────────────────────────────────────────── */
//startNewGame();

/* -------------------------------------------------
   Helper: show a full‑screen “Game Over” banner
   ------------------------------------------------- */
function showGameOver(messageText) {
    //  set the text
    document.getElementById('game-over-text').textContent = messageText;

    //  make the overlay visible
    const overlay = document.getElementById('game-over-overlay');
    overlay.style.display = 'flex';

    //  add a class so the cards dim (optional)
    document.querySelector('.board-wrapper').classList.add('game-over');
}

/* -------------------------------------------------
   Helper: hide the banner (called on Restart)
   ------------------------------------------------- */
function hideGameOver() {
    const overlay = document.getElementById('game-over-overlay');
    overlay.style.display = 'none';
    document.querySelector('.board-wrapper').classList.remove('game-over');
}