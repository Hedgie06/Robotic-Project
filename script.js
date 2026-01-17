const canvas = document.getElementById('robotCanvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('angleSlider');
const angleDisplay = document.getElementById('angleValue');
const fusionToggle = document.getElementById('fusionToggle');

// Text Elements
const trueDistDisp = document.getElementById('trueDist');
const noisyDistDisp = document.getElementById('noisyDist');
const finalDistDisp = document.getElementById('finalDist');
const locXDisp = document.getElementById('locX');

// Configuration
const robotX = 50;  // Actual Robot Position
const robotY = canvas.height / 2;
const wallX = 400;  // Known Map Feature

function draw() {
    // 1. Setup Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Wall
    ctx.fillStyle = "#555";
    ctx.fillRect(wallX, 0, 20, canvas.height);
    // Draw Wall Label
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText("Fixed Wall (x=400)", wallX - 90, 20);

    // 2. Get Input Angle
    let angleDeg = parseInt(slider.value);
    angleDisplay.innerText = angleDeg;
    let angleRad = angleDeg * (Math.PI / 180);

    // 3. Calculate TRUE Geometry (The "Perfect" Sensor)
    let dx = wallX - robotX;
    // dist = dx / cos(theta)
    let trueDistance = Math.abs(dx / Math.cos(angleRad));
    let dy = dx * Math.tan(angleRad);
    let targetY = robotY + dy;

    // Check bounds (if beam hits floor/ceiling)
    let validHit = (targetY >= 0 && targetY <= canvas.height);

    // 4. Draw Robot
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(robotX, robotY, 15, 0, Math.PI * 2);
    ctx.fill();

    // 5. Sensor Logic
    if (!validHit) {
        // Out of range handling
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(robotX, robotY);
        ctx.lineTo(robotX + Math.cos(angleRad) * 500, robotY + Math.sin(angleRad) * 500);
        ctx.stroke();
        
        updateText("Out of Range", "--", "--", "Unknown");
    } else {
        // --- A. Draw Perfect Beam (Green) ---
        ctx.beginPath();
        ctx.moveTo(robotX, robotY);
        ctx.lineTo(wallX, targetY);
        ctx.strokeStyle = "#00ff00"; 
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- B. Sensor Fusion Logic ---
        let displayDist = trueDistance;
        let noisyDist = "--";
        
        if (fusionToggle.checked) {
            // Simulate Sensor 2 (Noisy/Ultrasonic)
            // Adds random noise between -15cm and +15cm
            let noise = (Math.random() - 0.5) * 30; 
            let reading2 = trueDistance + noise;
            
            // FUSION: Average the two readings
            displayDist = (trueDistance + reading2) / 2;
            noisyDist = reading2.toFixed(1);

            // Draw "Noisy" Ghost Beam (Orange, semi-transparent)
            // We jitter the Y target slightly to visualize noise
            ctx.beginPath();
            ctx.moveTo(robotX, robotY);
            ctx.lineTo(wallX, targetY + noise); // Jitter visual
            ctx.strokeStyle = "rgba(255, 165, 0, 0.5)";
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // --- C. Localization Logic ---
        // Formula: RobotX = WallX - (MeasuredDistance * cos(angle))
        let estimatedX = wallX - (displayDist * Math.cos(angleRad));
        
        // Update UI
        updateText(
            trueDistance.toFixed(1), 
            noisyDist, 
            displayDist.toFixed(1), 
            estimatedX.toFixed(0) + " (Actual: 50)"
        );

        // Draw Hit Point
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(wallX, targetY, 5, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Animate noise if fusion is on
    if(fusionToggle.checked) {
        requestAnimationFrame(draw);
    }
}

function updateText(trueD, noisyD, finalD, locX) {
    trueDistDisp.innerText = trueD;
    noisyDistDisp.innerText = noisyD;
    finalDistDisp.innerText = finalD;
    locXDisp.innerText = locX;
    
    // Toggle visibility of noisy data
    const noisyEl = document.querySelector('.noisy-data');
    noisyEl.style.display = fusionToggle.checked ? 'block' : 'none';
}

// Event Listeners
slider.addEventListener('input', draw);
fusionToggle.addEventListener('change', draw);

// Initial Draw
draw();