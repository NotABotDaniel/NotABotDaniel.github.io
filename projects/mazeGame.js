const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const mazeSize = 20;
const keys = {};
const maze = Array(mazeSize + 1).fill(true).map(() => Array(mazeSize + 1).fill(true));

const crossLength = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);

const cellWidth = canvas.width / mazeSize;
const cellHeight = canvas.height / mazeSize;

const player = {
    x : 2.5 * cellWidth,
    y : 2.5 * cellHeight,
    dir : 0,
    rSpeed : Math.PI / 60,
    speed : 2,
    size : 10,
    view : 3 * Math.PI / 16,
    perspective : 10
}

const ray = {
    x : 0,
    y : 0,
    speed : 5,
    speed2 : .2,
    rez : Math.PI / 2000
}

const mouse = {
    x : 2,
    y : 2 ,
    dir : 0,
    dist : 0
}

let dirs = [0,1,2,3];

let frame = 0;

function drawCircle(x,y,r) {
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.fill();
}

function drawBird(x,y,d,size) {
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
    let testDir = dirs[Math.floor(Math.random() * dirs.length)];

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

function controlls() {
    if (keys["ArrowRight"]) {
        player.dir += player.rSpeed;
    } else if (keys["ArrowLeft"]) {
        player.dir -= player.rSpeed;
    }
    if (keys["ArrowUp"]) {
        player.x += player.speed * Math.cos(player.dir);
        player.y += player.speed * Math.sin(player.dir);
    } else if (keys["ArrowDown"]) {
        player.x -= player.speed * Math.cos(player.dir);
        player.y -= player.speed * Math.sin(player.dir);
    }
}

function playerWallColision() {
    if (player.x < 0 + player.size) {
        player.x += player.speed;
    }
    if (player.x > canvas.width - player.size) {
        player.x -= player.speed;
    }
    if (player.y < 0 + player.size) {
        player.y += player.speed;
    }
    if (player.y > canvas.height - player.size) {
        player.y -= player.speed;
    }
}

function playerMazeColision() {
    let mx = Math.floor(player.x / cellWidth);
    let my = Math.floor(player.y / cellHeight);

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

    if (maze[mx]?.[my]) {
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
    playerWallColision();
    playerMazeColision();
}

function castRay(a) {
    let dist = 0;
    ray.x = player.x;
    ray.y = player.y;

    if (maze[Math.floor(ray.x / cellWidth)][Math.floor(ray.y / cellHeight)]) {
        return 1;
    }

    for(let r=0; r< 5; r++) {
        ray.x += Math.cos(a) * ray.speed;
        ray.y += Math.sin(a) * ray.speed;
        dist += ray.speed;
    }
    while (dist < crossLength * 1.2) {
        if (maze[Math.floor(ray.x / cellWidth)]?.[Math.floor(ray.y / cellHeight)]) {
            while (dist < crossLength * 1.2) {
                ray.x -= Math.cos(a) * ray.speed2;
                ray.y -= Math.sin(a) * ray.speed2;
                dist -= ray.speed2;
                if (!maze[Math.floor(ray.x / cellWidth)][Math.floor(ray.y / cellHeight)]) {
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
        
        let color = 255 * (-dist / crossLength + 1);

        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.lineTo(vx, -vy + canvas.height / 2);
        ctx.stroke();

        ctx.strokeStyle = "rgb("+color+","+color+","+color+")";
        ctx.beginPath();
        ctx.moveTo(vx, -vy + canvas.height / 2);
        ctx.lineTo(vx, vy + canvas.height / 2);
        ctx.stroke();

        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(vx, vy + canvas.height / 2);
        ctx.lineTo(vx, canvas.height);
        ctx.stroke();

        if (col==0) {
            console.log("dist: "+castRay(player.dir + col));
            console.log("vy: "+vy);
        }
    }
}

document.addEventListener("keydown", (e) => {keys[e.key] = true; e.preventDefault()});
document.addEventListener("keyup", (e) => {keys[e.key] = false; e.preventDefault()});

function animate() {
    if (true){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.fillStyle = "gray";
        // ctx.fillRect(0,canvas.height/2, canvas.width, canvas.height);
        // drawMaze();
        updatePlayerPos();
        computeView();
    }
    frame++;
    requestAnimationFrame(animate);
}

createMaze();
animate();