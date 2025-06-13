const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const gravity = .5;

// z is verticle, 
// x and y are in the horizontal plane, 
// the camera looks in the negative y direction

const bounds = {
    x : 500,
    y : 500,
    z : 500
}

const camera = {
    x : 250,
    y : 10000,
    z : 250,
    speed : 5
}

// rez defines the number of segments are along a meridian of the sphere
const ball = {
    r : 50,
    x : bounds.x / 2,
    y : bounds.y / 2,
    z : bounds.z / 2,
    dx : 1,
    dy : 2,
    dz : 0,
    rez : 20
}

// Define the 8 corners of the cube
const corners = [
    {x: 0, y: 0, z: 0},
    {x: bounds.x, y: 0, z: 0},
    {x: bounds.x, y: bounds.y, z: 0},
    {x: 0, y: bounds.y, z: 0},
    {x: 0, y: 0, z: bounds.z},
    {x: bounds.x, y: 0, z: bounds.z},
    {x: bounds.x, y: bounds.y, z: bounds.z},
    {x: 0, y: bounds.y, z: bounds.z},
];

const light = {x : 500, y : 500, z : 1000}

let keys = {};

// the coordinates of all points are put in this list in a specific order
// to interpret, each value is an object with (x,y,z) coordinates
let coords = [];

// this list stores the indexes of the points in each face (all triangles)
// to interperate, each set of three values represent indexes of coords that form a triangle
let face = [];

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    ball.z += ball.dz;

    if (ball.x < 0) {
        ball.dx = Math.abs(ball.dx);
    }
    if (ball.x > bounds.x) {
        ball.dx = -Math.abs(ball.dx);
    }
    if (ball.y < 0) {
        ball.dy = Math.abs(ball.dy);
    }
    if (ball.y > bounds.y) {
        ball.dy = -Math.abs(ball.dy);
    }
    if (ball.z < 0) {
        ball.dz = Math.abs(ball.dz);
    }
    if (ball.z > bounds.z) {
        ball.dz = -Math.abs(ball.dz);
        ball.z -= gravity;
    }

    ball.dz += gravity;
}

function moveCamera() {
    if (keys["w"]) {
        camera.y -= camera.speed;
    }
    if (keys["s"]) {
        camera.y += camera.speed;
    }

    if (keys["a"]) {
        camera.x -= camera.speed;
    }
    if (keys["d"]) {
        camera.x += camera.speed;
    }

    if (keys["ArrowUp"]) {
        camera.z -= camera.speed;
    }
    if (keys["ArrowDown"]) {
        camera.z += camera.speed;
    }
}

// this function creates the faces list
// it remains constant througout the animation
function createSphere() {
    // connect bottom cap
    for (let j = 1; j < 2 * ball.rez; j++) {
        let next = (j + 1) % (2 * ball.rez);
        face.push({a : 0, b : j, c : next});
    }
    // connect quads between stacks
    for (let i = 1; i < 1.65 * ball.rez; i++) {
        for (let j = 0; j < 2 * ball.rez; j++) {
            let curr = i * ball.rez + j;
            let next = i * ball.rez + (j + 1) % (2 * ball.rez);
            let above = curr + (2 * ball.rez);
            let aboveNext = next + (2 * ball.rez);
            face.push({a : curr, b : above, c : aboveNext});
            face.push({a : curr, b : aboveNext, c : next});
        }
    }
    // connect top cap
    let topIndex = 1 + (2 * ball.rez) * (ball.rez - 2);
    for (let j = 0; j < 2 * ball.rez; j++) {
        let next = (j + 1) % (2 * ball.rez);
        face.push({a : topIndex, b : topIndex - 2 * ball.rez + next, c : topIndex - 2 * ball.rez + j});
    }
}

function setCoords() {
    // initialy set with the coord at the bottom of the sphere
    coords = [{x : ball.x, y : ball.y, z : ball.z + ball.r}];

    // this fills in all the coordinates between the top and the bottom

    // outer loop: phi = latitude, cycle from the bottom to the top of the ball
    for (
        let phi = Math.PI / ball.rez; 
        phi < Math.PI - Math.PI / ball.rez;  
        phi += Math.PI / ball.rez
    ) {
        // inner loop: thetea = longitude. for a single phi, 
        // calculate all the points around the circle
        for (let tta = -Math.PI; tta < Math.PI; tta += Math.PI / ball.rez) {
            coords.push({
                x : ball.r * Math.sin(phi) * Math.cos(tta) + ball.x,
                y : ball.r * Math.sin(phi) * Math.sin(tta) + ball.y,
                z : ball.r * Math.cos(phi) + ball.z
            })
        }
    }

    // top coord of the sphere
    coords.push({x : ball.x, y : ball.y, z : ball.z - ball.r});
}

function sortFaces() {
    face.sort((f1, f2) => {
        const avgDist1 = getFaceDistance(f1);
        const avgDist2 = getFaceDistance(f2);
        return avgDist1 - avgDist2; // closest faces first
    });
}

function getFaceDistance(f) {
    // Get coordinates of each vertex
    const p1 = coords[f.a];
    const p2 = coords[f.b];
    const p3 = coords[f.c];
    
    // Distance to camera from each vertex
    const d1 = Math.hypot(
        p1.x - camera.x,
        p1.y - camera.y,
        p1.z - camera.z
    );
    const d2 = Math.hypot(
        p2.x - camera.x,
        p2.y - camera.y,
        p2.z - camera.z
    );
    const d3 = Math.hypot(
        p3.x - camera.x,
        p3.y - camera.y,
        p3.z - camera.z
    );
    
    // Return the average distance
    return (d1 + d2 + d3) / 3;
}


// this takes the index of a point and uses the 3D coordinates 
// to output xy projected coordinates for the screen
function project(index) {
    return {
        x : (coords[index].x - camera.x) * (camera.y / (camera.y - coords[index].y)) + canvas.width / 2, 
        y : (coords[index].z - camera.z) * (camera.y / (camera.y - coords[index].y)) + canvas.height / 2
    }
}

// this function currently draws a wireframe of each face
// this will be replaced later with colored faces based on lighting

function drawFaces() {
    for (let f = 0; f < face.length; f++) {
        const {a, b, c} = face[f];
        const p1 = coords[a];
        const p2 = coords[b];
        const p3 = coords[c];
        
        // 1. Compute two edge vectors of the triangle
        const u = {
            x: p2.x - p1.x,
            y: p2.y - p1.y,
            z: p2.z - p1.z
        };
        const v = {
            x: p3.x - p1.x,
            y: p3.y - p1.y,
            z: p3.z - p1.z
        };
        
        // 2. Compute normal vector (u × v)
        const normal = {
            x: -(u.y * v.z - u.z * v.y),
            y: -(u.z * v.x - u.x * v.z),
            z: -(u.x * v.y - u.y * v.x)
        };
        
        // 3. Normalize the normal
        const normalMag = Math.hypot(normal.x, normal.y, normal.z);
        normal.x /= normalMag;
        normal.y /= normalMag;
        normal.z /= normalMag;
        
        // 4. Compute face center
        const center = {
            x: (p1.x + p2.x + p3.x) / 3,
            y: (p1.y + p2.y + p3.y) / 3,
            z: (p1.z + p2.z + p3.z) / 3
        };
        
        // 5. Direction to light
        const toLight = {
            x: light.x - center.x,
            y: light.y - center.y,
            z: light.z - center.z
        };
        const lightMag = Math.hypot(toLight.x, toLight.y, toLight.z);
        toLight.x /= lightMag;
        toLight.y /= lightMag;
        toLight.z /= lightMag;
        
        // 6. Direction to camera
        const toCamera = {
            x: camera.x - center.x,
            y: camera.y - center.y,
            z: camera.z - center.z
        };
        const camMag = Math.hypot(toCamera.x, toCamera.y, toCamera.z);
        toCamera.x /= camMag;
        toCamera.y /= camMag;
        toCamera.z /= camMag;
        
        // 7. Angle to light and camera (cosine of angle = dot product)
        const lightDot = normal.x * toLight.x + normal.y * toLight.y + normal.z * toLight.z;
        const camDot = normal.x * toCamera.x + normal.y * toCamera.y + normal.z * toCamera.z;
        
        // 8. Average lighting influence
        let intensity = (lightDot + camDot) / 2;
        intensity = Math.max(0, intensity); // no negative light
        const shade = Math.floor(intensity * 255);
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        
        // 9. Draw triangle
        const proj1 = project(a);
        const proj2 = project(b);
        const proj3 = project(c);
        ctx.beginPath();
        ctx.moveTo(proj1.x, proj1.y);
        ctx.lineTo(proj2.x, proj2.y);
        ctx.lineTo(proj3.x, proj3.y);
        ctx.closePath();
        ctx.fill();
    }
}


function drawBounds() {
    ctx.beginPath();
    
    // Project 3D corners to 2D screen space
    const projected = corners.map(p => ({
        x: (p.x - camera.x) * (camera.y / (camera.y - p.y)) + canvas.width / 2,
        y: (p.z - camera.z) * (camera.y / (camera.y - p.y)) + canvas.height / 2
    }));

    // Draw front face
    ctx.moveTo(projected[0].x, projected[0].y);
    ctx.lineTo(projected[1].x, projected[1].y);
    ctx.lineTo(projected[2].x, projected[2].y);
    ctx.lineTo(projected[3].x, projected[3].y);
    ctx.lineTo(projected[0].x, projected[0].y);

    // Draw back face
    ctx.moveTo(projected[4].x, projected[4].y);
    ctx.lineTo(projected[5].x, projected[5].y);
    ctx.lineTo(projected[6].x, projected[6].y);
    ctx.lineTo(projected[7].x, projected[7].y);
    ctx.lineTo(projected[4].x, projected[4].y);

    // Connect front to back
    ctx.moveTo(projected[0].x, projected[0].y);
    ctx.lineTo(projected[4].x, projected[4].y);
    ctx.moveTo(projected[1].x, projected[1].y);
    ctx.lineTo(projected[5].x, projected[5].y);
    ctx.moveTo(projected[2].x, projected[2].y);
    ctx.lineTo(projected[6].x, projected[6].y);
    ctx.moveTo(projected[3].x, projected[3].y);
    ctx.lineTo(projected[7].x, projected[7].y);
    
    ctx.stroke();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "blue";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "white";
    moveCamera();
    updateBall();
    setCoords();
    sortFaces();
    drawFaces();

    requestAnimationFrame(animate);
}

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    e.preventDefault();
});

document.addEventListener("keydown", (e) => {
    keys[e.key] = true; 
    e.preventDefault(); 
});

createSphere();
animate();