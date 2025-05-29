const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const gravity = 1;

const bounds = {
    x : 1000,
    y : 1000,
    z : 1000
}

const camera = {
    x : 1200,
    y : 1200,
    z : 1200,
    vx1 : 22.5,
    vx2 : 67.5,
    vy1 : 22.5,
    vy2 : 67.5,
    arez : 0.1,
    px : 0,
    py : 0
}

const ball = {
    r : 20,
    x : bounds.x / 2,
    y : bounds.y / 2,
    z : bounds.z / 2,
    dx : 10,
    dy : 5,
    dz : 0
}

const ray = {
    x : camera.x,
    y : camera.y,
    z : camera.z,
    pxrezx : canvas.width / ((camera.vx1 - camera.vx2) / camera.arez),
    pxrezy : canvas.height / ((camera.vy1 - camera.vy2) / camera.arez),
    voidDist : Math.sqrt(
        Math.pow(camera.x, 2) + Math.pow(camera.y, 2) + Math.pow(camera.z, 2)) + 50,
    dist : 0,
    tta : 0,
    phi : 0,
    speed : 5,
    hit : ""
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    ball.z += ball.dz;

    ball.dz -= gravity;

    if (ball.x < 0 || ball.x > bounds.x) {
        ball.dx *= -1;
    }
    if (ball.y < 0 || ball.y > bounds.x) {
        ball.dy *= -1;
    }
    if (ball.z < 0 || ball.z > bounds.x) {
        ball.dz *= -1;
    }
}

function castRay() {
    ray.x = camera.x;
    ray.y = camera.y;
    ray.z = camera.z;

    ray.dist = 0;

    while (ray.dist < ray.voidDist) {
        ray.x += ray.speed * Math.cos(ray.tta) * Math.cos(ray.phi);
        ray.y += ray.speed * Math.sin(ray.tta) * Math.cos(ray.phi);
        ray.z += ray.speed * Math.sin(ray.phi);

        ray.dist += ray.speed;

        if (Math.sqrt(
            Math.pow((ray.x - ball.x), 2) + 
            Math.pow((ray.y - ball.y), 2) + 
            Math.pow((ray.z - ball.z), 2)
        ) < ball.r) {
            ray.hit = "ball";
            return;
        }
    }
    ray.hit = "void";
    return;
}

function view() {
    for (camera.px = 0; camera.px < canvas.width; camera.px += ray.pxrezx) {
        for (camera.py = 0; camera.py < canvas.height; camera.py += ray.pxrezy) {
            
            ray.tta = (camera.px / ray.pxrezx) + camera.vx1;
            ray.phi = (camera.py / ray.pxrezy) + camera.vy1;
            
            castRay();

            if (ray.hit == "ball") {
                ctx.fillStyle = "blue";
            } else if (ray.hit == "void") {
                ctx.fillStyle = "black";
            }
            ctx.fillRect(camera.px, camera.py, camera.px + ray.pxrezx, camera.py + ray.pxrezy);
        }
    }

}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBall();
    view();

    // requestAnimationFrame(animate);
}

animate();