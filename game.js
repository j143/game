const peer = new Peer();
let conn;

// UI Elements
const myIdDisplay = document.getElementById('my-id');
const joinBtn = document.getElementById('join-btn');
const joinIdInput = document.getElementById('join-id');
const statusText = document.getElementById('status');
const lobby = document.getElementById('lobby');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let myCar = { x: 50, y: 100, width: 40, height: 20, color: '#ff3f34', speed: 6 };
let friendCar = { x: 50, y: 250, width: 40, height: 20, color: '#0fbcf9' };
let keys = {};

// 1. Setup PeerJS (Generate ID)
peer.on('open', (id) => {
    myIdDisplay.innerText = id;
});

// 2. Handle Incoming Connection (If you are the Host)
peer.on('connection', (connection) => {
    conn = connection;
    myCar.y = 100; // Host is always top lane
    friendCar.y = 250;
    setupConnection();
});

// 3. Connect to a Friend (If you are the Joiner)
joinBtn.addEventListener('click', () => {
    const friendId = joinIdInput.value.trim();
    if (!friendId) return;
    
    statusText.innerText = "Status: Connecting...";
    conn = peer.connect(friendId);
    
    // Joiner takes the bottom lane
    myCar.color = '#0fbcf9';
    myCar.y = 250; 
    friendCar.color = '#ff3f34';
    friendCar.y = 100;
    
    setupConnection();
});

// 4. Manage Connection Events
function setupConnection() {
    conn.on('open', () => {
        statusText.innerText = "Status: Connected! Starting race...";
        setTimeout(startGame, 1500);
    });
    
    // Update friend's position when data is received
    conn.on('data', (data) => {
        friendCar.x = data.x;
        friendCar.y = data.y;
    });
}

// 5. Input Handling
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// 6. Game Loop Engine
function startGame() {
    lobby.style.display = 'none';
    canvas.style.display = 'block';
    gameLoop();
}

function gameLoop() {
    update();
    draw();
    
    // Send our live position to the friend
    if (conn && conn.open) {
        conn.send({ x: myCar.x, y: myCar.y });
    }
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Arrow keys to move
    if (keys['ArrowUp'] && myCar.y > 0) myCar.y -= myCar.speed;
    if (keys['ArrowDown'] && myCar.y < canvas.height - myCar.height) myCar.y += myCar.speed;
    if (keys['ArrowLeft'] && myCar.x > 0) myCar.x -= myCar.speed;
    if (keys['ArrowRight'] && myCar.x < canvas.width - myCar.width) myCar.x += myCar.speed;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Finish Line
    ctx.fillStyle = '#d2dae2';
    ctx.fillRect(700, 0, 10, canvas.height);
    
    // Draw Friend's Car
    ctx.fillStyle = friendCar.color;
    ctx.fillRect(friendCar.x, friendCar.y, friendCar.width, friendCar.height);
    
    // Draw My Car
    ctx.fillStyle = myCar.color;
    ctx.fillRect(myCar.x, myCar.y, myCar.width, myCar.height);
}