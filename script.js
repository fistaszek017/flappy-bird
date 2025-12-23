const width = 700;
const height = 600;
const gravity = 0.09;
const jump = 2;

let canvas, ctx;
let gameRunning = false;
let lastTime = 0;

let bird = {};      // pozycja, prędkość itp.
let pipes = [];
let score = 0;
let bestScores = [];


//assety :/
const pipeImage = new Image();
pipeImage.src = "assets/Flappy Bird/pipe-green.png";

const bgImage = new Image();
bgImage.src = "assets/Flappy Bird/background-day.png";

const baseImage = new Image();
baseImage.src = "assets/Flappy Bird/base.png";

const jeden = new Image();
jeden.src = "assets/UI/Numbers/1.png";
const dwa = new Image();
dwa.src = "assets/UI/Numbers/2.png";
const trzy = new Image();
trzy.src = "assets/UI/Numbers/3.png";
const cztery = new Image();
cztery.src = "assets/UI/Numbers/4.png";
const piec = new Image();
piec.src = "assets/UI/Numbers/5.png";
const szesc = new Image();
szesc.src = "assets/UI/Numbers/6.png";
const siedem = new Image();
siedem.src = "assets/UI/Numbers/7.png";
const osiem = new Image();
osiem.src = "assets/UI/Numbers/8.png";
const dziewiec = new Image();
dziewiec.src = "assets/UI/Numbers/9.png";
const zero = new Image();
zero.src = "assets/UI/Numbers/0.png";


//INICJALIZACJA

window.onload = () => {
    document.getElementById("gameoverscreen").style.display = "none";
    setupCanvas();
    loadBestScores();
    setupEventListeners();
    showStartScreen();
};


// EKRANY
function showStartScreen() {
    const startScreen = document.getElementById("startscreen");
    if (!gameRunning) {
        startScreen.style.display = "block";
    }
}

function startGame() {
    resetGame();
    gameRunning = true;
    hideStartScreen();
    startGameLoop();
}

function hideStartScreen() {
    const startScreen = document.getElementById("startscreen");
    if (gameRunning) {
        startScreen.style.display = "none";
    }
}

function showGameOverScreen() {
    const gameOverScreen = document.getElementById("gameoverscreen");
    const gameScore = document.getElementById("gamescore");
    const bestScoresList = document.getElementById("bestscores");

    gameScore.textContent = score;

    loadBestScores();
    renderBestScores();

    gameOverScreen.style.display = "block";
}

function restartGame() {
    const gameOverScreen = document.getElementById("gameoverscreen");

    gameOverScreen.style.display = "none";

    resetGame();
    gameRunning = true;
    startGameLoop();
}


// PĘTLA GRY

function startGameLoop() {
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}


// UPDATE

function update(dt) {
    updateBird(dt);
    updatePipes(dt);
    updateBoosts(dt);
    checkCollision();
}


// PTAK

function resetBird() {
    bird.x = canvas.width/4;
    bird.y = canvas.height/2;

    bird.velocity = 0;
    bird.rotation = 0;

    bird.sprites=[];
    bird.currentframe = 0;
    bird.frametimer = 0;

    const birdimages = ["yellowbird-downflap.png", "yellowbird-midflap.png", "yellowbird-upflap.png"];
    bird.sprites = birdimages.map(src =>{
        const image = new Image();
        image.src = "assets/Flappy Bird/" + src;
        return image;
    });
}

function updateBird(dt) {
    bird.velocity += gravity * (dt/16);
    bird.y += bird.velocity* (dt/16);

    if (bird.y < 0){
        bird.y=0;
        bird.velocity=0;
    }
    if (bird.y > canvas.height-20){
        bird.y=canvas.height-20;
        bird.velocity=0;
    }

    rotateBird();

    //animacja
    const frameDuration = 100;
    if (bird.velocity < 0){ //porusza sie w gore
        bird.frametimer += dt;
        if (bird.frametimer > frameDuration){
            bird.currentframe = (bird.currentframe + 1) % 3 //bo sa 3 framy
            bird.frametimer = 0;
        }
        else{
            bird.currentframe = 2;
        }
    }

}

function birdJump() {
    bird.velocity = -jump;
}

function rotateBird() {
    const maxUp = - Math.PI/4;
    const maxDown = Math.PI/2;
    bird.rotation = Math.min(Math.max(bird.velocity * 0.08, maxUp), maxDown);
}


// RURY
function generatePipes() {
    const gap = 140; //przerwa miedzy rurami
    const minheight = 50;
    const maxheight = canvas.height - gap - minheight;

    const topY = Math.floor(Math.random()*(maxheight-minheight)+minheight);
    const bottomY = topY + gap
    
    const pipewidth = 50; //w assetach ma 52px, ale zostawiam te 2px dla "szczęściarzy"

    const pipe = {
        x: canvas.width,
        top: topY,
        bottom: bottomY,
        width: pipewidth,
        passed: false
    };

    pipes.push(pipe);
}

function updatePipes(dt) {
    const updateX = 200;
    const speed = 1;
    //generowanie rur
    if (pipes.length === 0 || pipes[pipes.length-1].x < canvas.width - updateX){
        generatePipes();
    }
    //przesuwanie rur
    for (let pipe of pipes){
        pipe.x -= speed*(dt/16);

        if (!pipe.passed && bird.x > pipe.x + pipe.width){
            score ++;
            pipe.passed = true;
        }
    }
    //usuwanie starych rur
    removeOldPipes();
}

function removeOldPipes() {
    pipes=pipes.filter(pipe => pipe.x + pipe.width > 0); //zostawiamy tylko te co są na canvasie
}


// DODATKI

function updateBoosts(dt) {
    // TODO
}

function activateTransparentBoost() {
    // TODO
}

function activateFastForwardBoost() {
    // TODO
}


// KOLIZJE
function checkCollision() {
    for (let pipe of pipes) {
        const birdLeft = bird.x;
        const birdRight = bird.x + bird.sprites[0].width;
        const birdTop = bird.y;
        const birdBottom = bird.y + bird.sprites[0].height;
        
        // Granice rury
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipe.width;
        const topPipeBottom = pipe.top;
        const bottomPipeTop = pipe.bottom;
        
        // Sprawdzenie kolizji z górną rurą
        if (birdRight > pipeLeft && 
            birdLeft < pipeRight && 
            birdTop < topPipeBottom) {
            endGame();
            return;
        }
        
        // Sprawdzenie kolizji z dolną rurą
        if (birdRight > pipeLeft && 
            birdLeft < pipeRight && 
            birdBottom > bottomPipeTop) {
            endGame();
            return;
        }
    }
}

function endGame() {
    gameRunning = false;
    saveBestScore(score);
    showGameOverScreen();
}


// DRAW

function draw() {
    clearCanvas();
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBackground() {
    ctx.fillStyle = "#4dc1cb";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    const bgwidth = bgImage.width;
    const bgheight = bgImage.height;
    const basewidth = baseImage.width;
    const baseheight = baseImage.height;
    const baseY = canvas.height - baseheight;
    for (let x = 0; x < canvas.width; x += basewidth) {
        ctx.drawImage(baseImage, x, baseY, basewidth, baseheight);
    }
    const bgY = canvas.height-baseheight-bgheight;
    for (let x = 0; x < canvas.width; x += bgwidth) {
        ctx.drawImage(bgImage, x, bgY, bgwidth, bgheight);
    }
}

function drawPipes() {
    for (let pipe of pipes) {
        // górna rura
        ctx.save();
        ctx.translate(pipe.x + pipe.width/2, pipe.top/2);
        ctx.rotate(Math.PI);
        ctx.drawImage(pipeImage, -pipe.width/2, -pipe.top/2, pipe.width, pipe.top);
        ctx.restore();

        // dolna rura
        ctx.drawImage(pipeImage, pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);
    }
}


function drawBird() {
    const sprite = bird.sprites[bird.currentframe]; // aktualna klatka animacji

    // zapisujemy stan canvas
    ctx.save();

    // ustawiamy punkt obrotu w centrum ptaka
    const birdCenterX = bird.x + sprite.width / 2;
    const birdCenterY = bird.y + sprite.height / 2;
    ctx.translate(birdCenterX, birdCenterY);

    // obracamy ptaka o rotation
    ctx.rotate(bird.rotation);

    // rysujemy sprite wycentrowany
    ctx.drawImage(
        sprite,
        -sprite.width / 2,
        -sprite.height / 2,
        sprite.width,
        sprite.height
    );

    // przywracamy stan canvas
    ctx.restore();
}

function drawScore() {
    const scorestring = score.toString();

    const digitwidth = zero.width;
    const digitheight = zero.height;

    for (let i=0; i<scorestring.length; i++){
        const digit = scorestring.charAt(i);
        let digitImage;
        switch(digit){
            case '0': digitImage=zero; break;
            case '1': digitImage=jeden; break;
            case '2': digitImage=dwa; break;
            case '3': digitImage=trzy; break;
            case '4': digitImage=cztery; break;
            case '5': digitImage=piec; break;
            case '6': digitImage=szesc; break;
            case '7': digitImage=siedem; break;
            case '8': digitImage=osiem; break;
            case '9': digitImage=dziewiec; break;
            default: digitImage=zero;
        }
        const startX = (canvas.width - (scorestring.length * digitwidth)) / 2;
        const x = startX + i*digitwidth;
        const y = 50;
        ctx.drawImage(digitImage, x, y, digitwidth, digitheight);
    }
}


// BEST SCORES

function loadBestScores() {
    const stored = localStorage.getItem("flappy_best_scores");

    if (!stored || stored.trim() === "") {
        bestScores = [];
        return;
    }

    bestScores = stored
        .split(",")
        .map(s => parseInt(s))
}

function saveBestScore(score) {
    loadBestScores(); // wczytaj dotychczasowe

    bestScores.push(score);
    bestScores.sort((a, b) => b - a);
    bestScores = bestScores.slice(0, 5);  // tylko najlepsze 5

    localStorage.setItem("flappy_best_scores", bestScores.join(","));
}

function renderBestScores() {
    const list = document.getElementById("bestscores");
    list.innerHTML = "";

    bestScores.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        list.appendChild(li);
    });
}


// NARZĘDZIA

function setupCanvas() {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
}

function setupEventListeners() {
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault(); // ZAPOBIEGNIJ domyślnej akcji
            if (gameRunning) {
                birdJump();
            }
            // NIE uruchamiaj startGame() tutaj!
        }
    });

    document.getElementById("startbutton").onclick = startGame;
    document.getElementById("restartbutton").onclick = restartGame;
}

function resetGame() {
    score = 0;
    pipes = [];
    resetBird();
}
