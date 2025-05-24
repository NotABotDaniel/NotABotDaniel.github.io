const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const mazeSize = 20;
const keys = {};
const maze = Array(mazeSize + 1).fill(true).map(() => Array(mazeSize + 1).fill(true));

const crossLength = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);

const cellWidth = canvas.width / mazeSize - 1;
const cellHeight = canvas.height / mazeSize - 1;

const mapTime = 3;

const player = {
    x : 2.5 * cellWidth,
    y : 2.5 * cellHeight,
    dir : 0,
    rSpeed : Math.PI / 80,
    speed : 1,
    size : 10,
    view : 3 * Math.PI / 16,
    perspective : 10
}

const ray = {
    x : 0,
    y : 0,
    speed : 5,
    speed2 : .1,
    rez : Math.PI / 2000
}

const mouse = {
    x : 2,
    y : 2 ,
    dir : 0,
    dist : 0
}

const max = {
    dist : 0,
    x : 2,
    y : 2
}

let dirs = [0,1,2,3];

let time = 0;
let map = false;
let objective = false;
let gameState = "preGame";
let seed = 0;
let inputSeed = "";
let seedLength = 17;

function rng() {
    seed = (seed*seed*1000) - Math.floor(seed*seed*1000);
    return seed;
}

function drawCircle(x,y,r) {
    ctx.fillStyle = "rgb(80,250,80)";
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.fill();
}

function drawBird(x,y,d,size) {
    ctx.fillStyle = "rgba(255,0,0,0.75)"

    let x1 = x + size * Math.cos(d);
    let y1 = y + size * Math.sin(d);

    let x2 = x + size * Math.cos(d + (Math.PI * 3 / 4));
    let y2 = y + size * Math.sin(d + (Math.PI * 3 / 4));

    let x3 = x + size * Math.cos(d - (Math.PI * 3 / 4));
    let y3 = y + size * Math.sin(d - (Math.PI * 3 / 4));

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
}

function drawMaze() {
    ctx.fillStyle = "rgba(0,0,0,0.75)"

    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col]) {
                ctx.fillRect(row * cellWidth, col * cellHeight, cellWidth, cellHeight);
            }
        }
    }
}

function m(a,b) {
    maze[a][b] = false;
}

function createMaze() {
    for(let mx = 0; mx <= mazeSize; mx++) {
        for(let my = 0; my <= mazeSize; my++) {
            if((mx == 0) || (my == 0) || (mx == mazeSize) || (my == mazeSize)) {
                m(mx,my);
            }
        }
    }

    m(2,2);
    mazeTile();
}

function moveMouse(d) {
    if (d == 0) {
        m(mouse.x + 1,mouse.y);
        mouse.x += 2;
    } else if (d == 1) {
        m(mouse.x,mouse.y - 1);
        mouse.y -= 2;
    } else if (d == 2) {
        m(mouse.x - 1,mouse.y);
        mouse.x -= 2;
    } else if (d == 3) {
        m(mouse.x,mouse.y + 1);
        mouse.y += 2;
    }
    m(mouse.x,mouse.y);
}

function mazeTile() {
    moveMouse(mouse.dir);
    mouse.dist++;
    recordDist();

    dirs = [0,1,2,3];
    nextTile(mouse.dir);

    if (mouse.dir + 2 > 3) {
        moveMouse(mouse.dir - 2);
    } else {
        moveMouse(mouse.dir + 2);
    }
    mouse.dist--
}

function nextTile(startDir) {
    for(let t = 0; t < 4; t++) {
        testTile();
    }
    dirs = [0,1,2,3];
    for(let t = 0; t < 4; t++) {
        testTile();
    }
    dirs = [0,1,2,3];
    for(let t = 0; t < 4; t++) {
        testTile();
    }
    mouse.dir = startDir;
}

function testTile() {
    let testDir = dirs[Math.floor(rng() * dirs.length)];

    if (testDir == 0) {
        if (maze[mouse.x + 2][mouse.y]) {
            mouse.dir = testDir;
            mazeTile();
        }
    } else if (testDir == 1) {
        if (maze[mouse.x][mouse.y - 2]) {
            mouse.dir = testDir;
            mazeTile();
        }
    } else if (testDir == 2) {
        if (maze[mouse.x - 2][mouse.y]) {
            mouse.dir = testDir;
            mazeTile();
        }
    } else if (testDir == 3) {
        if (maze[mouse.x][mouse.y + 2]) {
            mouse.dir = testDir;
            mazeTile();
        }
    }
    dirs.splice(dirs.indexOf(testDir), 1);
}

function recordDist() {
    if (mouse.dist > max.dist) {
        max.dist = mouse.dist;
        max.x = mouse.x;
        max.y = mouse.y;
    }
}

function drawMap() {
    if (map) {
        drawMaze();
        drawBird(player.x, player.y, player.dir, 200/mazeSize);
        drawCircle((max.x+0.5)*cellWidth,(max.y+0.5)*cellHeight,200/mazeSize);
    }

}

function controlls() {
    if (keys["m"]) {
        map = true;
    } else {
        map = false;

        if (keys["ArrowRight"]||keys["d"]) {
        player.dir += player.rSpeed;
        } 
        if (keys["ArrowLeft"]||keys["a"]) {
            player.dir -= player.rSpeed;
        }
        if (keys["ArrowUp"]||keys["w"]) {
            player.x += player.speed * Math.cos(player.dir);
            player.y += player.speed * Math.sin(player.dir);
        } else if (keys["ArrowDown"]||keys["s"]) {
            player.x -= player.speed * Math.cos(player.dir);
            player.y -= player.speed * Math.sin(player.dir);
        }
    }
}

function playerMazeColision() {
    let mx = Math.floor(player.x / cellWidth);
    let my = Math.floor(player.y / cellHeight);

    if (mx == max.x && my == max.y) {
        gameState = "complete";
    }

    if (maze[mx]?.[my]) {
        let cx = cellWidth * (mx + 0.5);
        let cy = cellHeight * (my + 0.5);
        let ox = player.x - cx;
        let oy = player.y - cy;

        if (Math.abs(ox) > Math.abs(oy)) {
            player.x += Math.sign(ox) * player.speed;
        } else {
            player.y += Math.sign(oy) * player.speed;
        }
    }

    mx = Math.floor(player.x / cellWidth);
    my = Math.floor(player.y / cellHeight);

    if (maze[mx][my]) {
        let cx = cellWidth * (mx + 0.5);
        let cy = cellHeight * (my + 0.5);
        let ox = player.x - cx;
        let oy = player.y - cy;

        if (Math.abs(ox) < Math.abs(oy)) {
            player.x += Math.sign(ox) * player.speed;
        } else {
            player.y += Math.sign(oy) * player.speed;
        }
    }
}

function updatePlayerPos() {
    controlls();
    playerMazeColision();
}

function timer() {
    if (map) {
        time += mapTime;
    } else {
        time++;
    }
    printTimer();
}

function printTimer() {
    ctx.font = "36px serif";
    ctx.fillStyle = "black";
    ctx.fillText(time/60, canvas.height - 88, 40);
}

function castRay(a) {
    let dist = 0;
    ray.x = player.x;
    ray.y = player.y;

    if (maze[Math.floor(ray.x / cellWidth)][Math.floor(ray.y / cellHeight)]) {
        return 1;
    }

    for(let r = 0; r < 5; r++) {
        ray.x += Math.cos(a) * ray.speed;
        ray.y += Math.sin(a) * ray.speed;
        dist += ray.speed;
    }
    while (dist < crossLength * 1.2) {
        if (maze[Math.floor(ray.x / cellWidth)][Math.floor(ray.y / cellHeight)]) {
            while (dist < crossLength * 1.2) {
                ray.x -= Math.cos(a) * ray.speed2;
                ray.y -= Math.sin(a) * ray.speed2;
                dist -= ray.speed2;
                if (!maze[Math.floor(ray.x / cellWidth)][Math.floor(ray.y / cellHeight)]) {
                    objective = false;
                    return dist;
                }
            }
        } else if (Math.sqrt(
            (((ray.x/cellWidth)-(max.x+0.5))*
            ((ray.x/cellWidth)-(max.x+0.5)))+
            (((ray.y/cellHeight)-(max.y+0.5))*
            ((ray.y/cellHeight)-(max.y+0.5)))
        ) < cellWidth/50) {
            while (dist < crossLength * 1.2) {
                ray.x -= Math.cos(a) * ray.speed2;
                ray.y -= Math.sin(a) * ray.speed2;
                dist -= ray.speed2;
                if (!Math.sqrt(
                    (((ray.x/cellWidth)-(max.x+0.5))*
                    ((ray.x/cellWidth)-(max.x+0.5)))+
                    (((ray.y/cellHeight)-(max.y+0.5))*
                    ((ray.y/cellHeight)-(max.y+0.5)))
                ) < cellWidth/50) {
                    objective = true;
                    return dist;
                }
            }
        }
        ray.x += Math.cos(a) * ray.speed;
        ray.y += Math.sin(a) * ray.speed;
        dist += ray.speed;
    }
}

function computeView() {
    console.log("compute view");
    for (let col = -player.view; col < player.view; col += ray.rez) {
        let dist = castRay(player.dir + col);
        vx = (((col * canvas.width) / player.view) + canvas.width) / 2;
        vy = (player.perspective * canvas.height / (dist + 1)) * (2 - (Math.cos(col)));
        
        let color = 350 * (-dist / crossLength + 1) - 150;

        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.lineTo(vx, -vy + canvas.height / 2);
        ctx.stroke();

        if (!objective) {
            ctx.strokeStyle = "rgb("+color+","+color+","+color+")";
        } else {
            ctx.strokeStyle = "rgb("+color/10+",255,"+color/10+")";
        }

        ctx.beginPath();
        ctx.moveTo(vx, -vy + canvas.height / 2);
        ctx.lineTo(vx, vy + canvas.height / 2);
        ctx.stroke();

        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(vx, vy + canvas.height / 2);
        ctx.lineTo(vx, canvas.height);
        ctx.stroke();

        if (col == 0) {
            console.log("dist: "+castRay(player.dir + col));
            console.log("vy: "+vy);
        }
    }
}

function seedInput() {
    ctx.font = "24px serif";
    ctx.fillStyle = "black";

    if (inputSeed == "") {
        ctx.fillText("Input Seed (numbers only)", canvas.width / 2 - 180, canvas.height / 2 + 70);
        ctx.fillText("Press Enter to Start With Random Seed", canvas.width / 2 - 260, canvas.height / 2 + 150);
    } else {
        ctx.fillText(inputSeed, canvas.width / 2 - 180, canvas.height / 2 + 70);
        ctx.fillText("Press Enter to Play Your Seed", canvas.width / 2 - 200, canvas.height / 2 + 150)
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState == "preGame") {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "black";
        ctx.font = "82px serif";
        ctx.fillText("Maze Game", canvas.width/2 - 210, canvas.height/2 - 150);

        seedInput();

        if (keys["Enter"]) {
            gameState = "gameRunning";

            if (inputSeed == "") {
                inputSeed = String(Math.random());
            } else {
                seedLength = inputSeed.length;
                inputSeed = String(Number(inputSeed) / Math.pow(10, seedLength));
            }
            seed = Number(inputSeed);
            

            createMaze();
        }
    }

    if (gameState == "gameRunning") {
        controlls();
        updatePlayerPos();
        computeView();
        drawMap();
        timer();
    }

    if (gameState == "complete") {
        ctx.fillStyle = "rgb(0,255,0)"
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "48px serif";
        ctx.fillStyle = "black";
        ctx.fillText("COMPLETE!", canvas.width / 2 - 100, canvas.height / 2 - 70);
        inputSeed = String(Number(inputSeed) * Math.pow(10, seedLength));
        ctx.font = "24px serif";
        ctx.fillText("Seed: " + inputSeed, canvas.width / 2 - 200, canvas.height / 2 + 70);
        ctx.fillText("Press Enter to Try Seed Again", inputSeed, canvas.width / 2 - 200, canvas.height / 2 + 100);
        ctx.fillText("Press Space to Play a Different Seed", inputSeed, canvas.width / 2 - 200, canvas.height / 2 + 130);

        printTimer();

        if (keys["Enter"]) {
            gameState = "gameRunning";

            seedLength = inputSeed.length;
            inputSeed = String(Number(inputSeed) / Math.pow(10, seedLength));
        
            seed = Number(inputSeed);
        }

        if (keys["Space"]) {
            time = 0;
            map = false;
            objective = false;
            gameState = "preGame";
            seed = 0;
            inputSeed = "";
            seedLength = 17;
        }
    }

    requestAnimationFrame(animate);
}

document.addEventListener("keydown", (e) => {
    keys[e.key] = true; 
    e.preventDefault(); 

    if (inputSeed.length < 10 && gameState == "preGame") {
        if (e.key >= "0" && e.key <= "9") {
            inputSeed += e.key;
        } else if (e.key == "Backspace") {
            inputSeed = inputSeed.slice(0, -1);
        }
    }
});
document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    e.preventDefault();
});

animate();