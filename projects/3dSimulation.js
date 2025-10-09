const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const gravity = .5;

// z is verticle, 
// x and y are in the horizontal plane, 
// the camera looks in the negative y direction

const bounds = {
    x : 450,
    y : 450,
    z : 450
}

// initial camera position
const camera = {
    x : 250,
    y : 2000,
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
    rez : 25
}

// Define the 8 corners of the  bounds
const corners = [
    {x: 0, y: 0, z: 0},
    {x: bounds.x, y: 0, z: 0},
    {x: bounds.x, y: 0, z: bounds.z},
    {x: 0, y: 0, z: bounds.z},
    {x: 0, y: bounds.y, z: 0},
    {x: bounds.x, y: bounds.y, z: 0},
    {x: bounds.x, y: bounds.y, z: bounds.z},
    {x: 0, y: bounds.y, z: bounds.z},
];

const light = {x : 250, y : 250, z : 0}

let keys = {};

// the coordinates of all points are put in this list in a specific order
// to interpret, each value is an object with (x,y,z) coordinates
let coords = [];

// this list stores the indexes of the points in each face (all triangles)
// to interperate, each set of three values represent indexes of coords that form a triangle
let face = [];

// physics for the ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    ball.z += ball.dz;

    if (ball.x - ball.r < 0) {
        ball.dx = Math.abs(ball.dx);
    }
    if (ball.x + ball.r > bounds.x) {
        ball.dx = -Math.abs(ball.dx);
    }
    if (ball.y - ball.r < 0) {
        ball.dy = Math.abs(ball.dy);
    }
    if (ball.y + ball.r > bounds.y) {
        ball.dy = -Math.abs(ball.dy);
    }
    if (ball.z - ball.r < 0) {
        ball.dz = Math.abs(ball.dz);
    }
    if (ball.z + ball.r > bounds.z) {
        ball.dz = -Math.abs(ball.dz);
        ball.z -= gravity;
    }

    ball.dz += gravity;
}

// controlls for the user to move around
function moveCamera() {
    if (keys["w"]) {
        camera.z -= camera.speed;
    }
    if (keys["s"]) {
        camera.z += camera.speed;
    }

    if (keys["a"]) {
        camera.x -= camera.speed;
    }
    if (keys["d"]) {
        camera.x += camera.speed;
    }

    if (keys["ArrowUp"]) {
        camera.y -= camera.speed * 2;
    }
    if (keys["ArrowDown"]) {
        camera.y += camera.speed * 2;
    }
}

// creates the faces list
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
        phi < Math.PI;  
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
        return avgDist2 - avgDist1; // closest faces first
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

// takes the xyz coordinates of a point 
// projects it and return the xy coordinates
function projectPixel(pixel) {
    return {
        x : (pixel.x - camera.x) * (camera.y / (camera.y - pixel.y)) + canvas.width / 2, 
        y : (pixel.z - camera.z) * (camera.y / (camera.y - pixel.y)) + canvas.height / 2
    }
}

// takes the index of a point, inputs 3D coordinates into the projectPixel function
// return xy projected coordinates for the screen
function project(index) {
    return {
        x : projectPixel({x : coords[index].x, y : coords[index].y, z : coords[index].z}).x, 
        y : projectPixel({x : coords[index].x, y : coords[index].y, z : coords[index].z}).y 
    }
}

// this function draws filled in faces based on lighting
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
            x: (u.y * v.z - u.z * v.y),
            y: (u.z * v.x - u.x * v.z),
            z: (u.x * v.y - u.y * v.x)
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
        let intensity = ((lightDot + camDot) / 2) + 0.2;
        intensity = Math.max(0, intensity); // no negative light
        const shade = Math.floor((intensity * 255));
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.strokeStyle = `rgb(${shade}, ${shade}, ${shade})`;
        
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
        ctx.stroke();
    }
}

function drawFrontBounds() {
    ctx.beginPath();

    // Draw front face
    ctx.moveTo(projectPixel(corners[4]).x, projectPixel(corners[4]).y);
    for(let c = 4; c < 8; c++) {
        ctx.lineTo(projectPixel(corners[c]).x, projectPixel(corners[c]).y);
    }
    ctx.lineTo(projectPixel(corners[4]).x, projectPixel(corners[4]).y);

    ctx.stroke();

}

function drawBackBounds() {
    ctx.beginPath();

    // draw back face
    ctx.moveTo(projectPixel(corners[0]).x, projectPixel(corners[0]).y);
    for(let c = 1; c < 4; c++) {
        ctx.lineTo(projectPixel(corners[c]).x, projectPixel(corners[c]).y);
    }
    ctx.lineTo(projectPixel(corners[0]).x, projectPixel(corners[0]).y);

    // Connect front to back
    for(let c = 0; c < 4; c++) {
        ctx.moveTo(projectPixel(corners[c]).x, projectPixel(corners[c]).y);
        ctx.lineTo(projectPixel(corners[c + 4]).x, projectPixel(corners[c + 4]).y);
    }
    
    ctx.stroke();

}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = "white";
    drawBackBounds();

    moveCamera();
    updateBall();
    setCoords();
    sortFaces();
    drawFaces();

    ctx.strokeStyle = "white";
    drawFrontBounds();

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