const canvas = document.getElementById('robotCanvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('angleSlider');
const angleDisplay = document.getElementById('angleValue');
const distDisplay = document.getElementById('distanceValue');

// Configuration
const robotX = 50; // Robot is on the left
const robotY = canvas.height / 2;
const wallX = 400; // Wall is on the right

function draw() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw The Wall
    ctx.fillStyle = "#555";
    ctx.fillRect(wallX, 0, 20, canvas.height);
    
    // 2. Get Angle
    let angleDeg = parseInt(slider.value);
    angleDisplay.innerText = angleDeg;
    let angleRad = angleDeg * (Math.PI / 180);

    // 3. Calculate Beam
    // The beam starts at robotX, robotY.
    // We need to find where it hits the wall (x = wallX).
    // dx = wallX - robotX
    // tan(theta) = dy / dx  => dy = dx * tan(theta)
    
    let dx = wallX - robotX;
    let dy = dx * Math.tan(angleRad);
    let targetY = robotY + dy;

    // 4. Draw Robot Base
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(robotX, robotY, 15, 0, Math.PI * 2);
    ctx.fill();

    // 5. Draw Sensor Beam
    ctx.beginPath();
    ctx.moveTo(robotX, robotY);
    
    // Check if beam goes off screen (too steep)
    if (targetY < 0 || targetY > canvas.height) {
        // Beam misses the wall part of the canvas
        ctx.strokeStyle = "red";
        ctx.lineTo(robotX + Math.cos(angleRad) * 500, robotY + Math.sin(angleRad) * 500);
        ctx.stroke();
        distDisplay.innerText = "Out of Range";
    } else {
        // Beam hits wall
        ctx.strokeStyle = "#00ff00"; // Green laser
        ctx.lineWidth = 2;
        ctx.lineTo(wallX, targetY);
        ctx.stroke();

        // Calculate Euclidean distance (Hypotenuse)
        // dist = dx / cos(theta)
        let distance = Math.abs(dx / Math.cos(angleRad));
        distDisplay.innerText = distance.toFixed(1);
        
        // Draw hit point
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(wallX, targetY, 5, 0, Math.PI*2);
        ctx.fill();
    }
}

// Event Listener
slider.addEventListener('input', draw);

// Initial Draw
draw();