const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const gravity = 1;

const bounds = {
    x : 1000,
    y : 1000,
    z : 1000
}

const camera = {
    x : 0,
    y : 1200,
    z : 500,
}

const ball = {
    r : 20,
    x : bounds.x / 2,
    y : bounds.y / 2,
    z : bounds.z / 2,
    dx : 10,
    dy : 5,
    dz : 0,
    rez : 10
}

const p = {
    x : 0,
    y : 0,
    z : 0,
    a : {},
    b : {},
    c : {}
}

let coords = [];
let face = [];

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    ball.z += ball.dz;

    ball.dz -= gravity;

    if (ball.x < 0 || ball.x > bounds.x) {
        ball.dx *= -1;
    }
    if (ball.y < 0 || ball.y > bounds.y) {
        ball.dy *= -1;
    }
    if (ball.z < 0 || ball.z > bounds.z) {
        ball.dz *= -1;
    }
}

function createSphere() {
    for (let a = 1; a < ball.rez; a++) {
        face.push(0);
        face.push(a);
        face.push(a + 1);
    }

    face.push(0);
    face.push(ball.rez - 1);
    face.push(1);
    

    for (let row = 0; row < ball.rez - 3; row++) {
        for (a = 1; a < 10; a++) {
            face.push(a + (ball.rez * row));
            face.push(a + (ball.rez * row + 1));
            face.push(a + (ball.rez * row + 1) + 1);
            face.push(a + (ball.rez * row));
            face.push(a + (ball.rez * row + 1) + 1);
            face.push(a + (ball.rez * row) + 1);
        }
    }

    for (let a = 1; a < ball.rez; a++) {
        face.push(ball.rez * (ball.rez - 2) + a);
        face.push(ball.rez * (ball.rez - 2) + a + 1);
        face.push(ball.rez * (ball.rez - 1) + 2);
    }

    face.push(ball.rez * (ball.rez - 2) + ball.rez);
    face.push(ball.rez * (ball.rez - 2) + 1);
    face.push(ball.rez * (ball.rez - 1) + 2);

}

function setCoords() {
    coords = [ball.x, ball.y, ball.z - ball.r];
    
    for (let tta = -Math.PI; tta < Math.PI; tta += Math.PI / ball.rez) {
        for (let phi = -Math.PI / 2 + Math.PI / ball.rez; phi < Math.PI / 2 - Math.PI / ball.rez; phi += Math.PI / ball.rez) {
            coords.push(ball.r * Math.sin(phi) * Math.cos(tta) + ball.x)
            coords.push(ball.r * Math.sin(phi) * Math.sin(tta) + ball.y)
            coords.push(ball.r * Math.cos(phi) + ball.z)
        }
    }

    coords.push(ball.x, ball.y, ball.z + ball.r)
}

function project(i) {
    p.x = coords[i * 3];
    p.y = coords[i * 3 + 1];
    p.z = coords[i * 3 + 2];
    return {
        x: (p.x - camera.x) * (camera.y / (camera.y - p.z)) + canvas.width / 2, 
        y: (p.z - camera.z) * (camera.y / (camera.y - p.z)) + canvas.height / 2
    }
}

function drawFaces() {
    ctx.beginPath();
    for (let f = 0; f < face.length; f += 3) {
        p.a = project(face[f]);
        p.b = project(face[f + 1]);
        p.c = project(face[f + 2]);
        
        ctx.moveTo(p.a.x, p.a.y);
        ctx.lineTo(p.b.x, p.b.y);
        ctx.lineTo(p.c.x, p.c.y);
        ctx.lineTo(p.a.x, p.a.y);
    }
    ctx.stroke();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBall();
    setCoords();
    drawFaces();

    requestAnimationFrame(animate);
}

createSphere();
animate();