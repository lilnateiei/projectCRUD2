const email = localStorage.getItem("email");
const username = localStorage.getItem("username")
console.log(`Username: ${username}, Email: ${email}`);

const api = "https://67950ceeaad755a134eb14bf.mockapi.io/user";



async function verifyJWT(token, secret) {
    try {
        
        const [header, body, signature] = token.split(".");
        if (!header || !body || !signature) {
            return { valid: false, reason: "JWT ไม่สมบูรณ์" };
        }

        
        const validSignature = btoa(`${header}.${body}.${secret}`);
        if (signature !== validSignature) {
            return { valid: false, reason: "ลายเซ็นไม่ถูกต้อง (Invalid signature)" };
        }
        
        const payload = JSON.parse(atob(body));
        if (Date.now() > payload.exp * 1000) {
            return { valid: false, reason: "โทเค่นหมดอายุ!" };
        }

        
        const response = await fetch(`${api}/${payload.UserId}`);
        console.log(payload.UserId);
        if (!response.ok) {
            return { valid: false, reason: "ไม่พบผู้ใช้งาน" };
        }
        const user = await response.json();

       
        if (user.email !== email || user.username !== username) {
            return { valid: false, reason: "ข้อมูลผู้ใช้ไม่ตรงกัน" };
        }

        return { valid: true, payload };
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการตรวจสอบ JWT:", error);
        return { valid: false, reason: "ข้อผิดพลาดในการตรวจสอบ JWT" };
    }
}


function showPopup(message, redirect = false) {
    
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";

    const popup = document.createElement("div");
    popup.className = "popup";

    const messageText = document.createElement("p");
    messageText.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.textContent = "ตกลง คลิกเพื่อปิด";
    closeButton.addEventListener("click", () => {
        document.body.removeChild(overlay);
        if (redirect) {
            window.location.href = "/nat/index.html"; 
        }
    });

    popup.appendChild(messageText);
    popup.appendChild(closeButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}


document.getElementById("checkJwtBtn").addEventListener("click", async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        showPopup("ไม่พบ Token กรุณาเข้าสู่ระบบ", true);
        return;
    }

    const result = await verifyJWT(token, "mysecret");
    if (!result.valid) {
        if (result.reason === "โทเค่นหมดอายุ!") {
            showPopup("Token หมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง", true);
            localStorage.removeItem("token");
        } else {
            showPopup(result.reason, true);
        }
    } else {
        showPopup(`Token ถูกต้อง! ยินดีต้อนรับกลับมา, ${result.payload.username}`);
    }
});


document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("token");
    showPopup("ออกจากระบบเรียบร้อยครับBro!", true);
});

const startGameButton = document.getElementById('startGame');
const gameDiv = document.querySelector('.game');
const boardDiv = document.getElementById('board');

let board = Array(9).fill(null);
let currentPlayer = 'X';  

function createBoard() {
  boardDiv.innerHTML = '';  
  board.forEach((cell, index) => {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    cellDiv.textContent = cell;
    if (!cell && currentPlayer === 'X') {
      cellDiv.addEventListener('click', () => makeMove(index));
    }
    boardDiv.appendChild(cellDiv);
  });
}

function makeMove(index) {
  if (!board[index] && currentPlayer === 'X') {
    board[index] = currentPlayer;
    currentPlayer = 'O';  
    createBoard();
    checkWinner();

    if (currentPlayer === 'O') {
      setTimeout(botMove, 500);  
    }
  }
}

function botMove() {
  const emptyCells = board.map((cell, index) => (cell === null ? index : null)).filter(index => index !== null);
  if (emptyCells.length > 0) {
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomIndex] = currentPlayer;
    currentPlayer = 'X';  
    createBoard();
    checkWinner();
  }
}

function checkWinner() {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  winningCombinations.forEach((combination) => {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      alert(`${board[a]} ชนะ!`);
      resetGame();
    }
  });

  if (board.every(cell => cell !== null)) {
    alert("เสมอครับ!");
    resetGame();
  }
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  createBoard();
}

startGameButton.addEventListener('click', () => {
  gameDiv.style.display = 'block';
  createBoard();
});

const startGamesButton = document.getElementById('startGame');
const closeGameButton = document.getElementById('closeGame');
const gameDivs = document.querySelector('.game');

startGameButton.addEventListener('click', () => {
    gameDivs.style.display = 'block'; // แสดงเกม
});

closeGameButton.addEventListener('click', () => {
    gameDivs.style.display = 'none'; // ซ่อนเกม
});
 
