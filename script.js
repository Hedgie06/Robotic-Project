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
const robotX = 50;  
const robotY = canvas.height / 2;
const wallX = 400;  

// STATE VARIABLES
let currentNoise = 0;       
let lastNoiseUpdate = 0;    

function draw(timestamp) {
    // 1. SETUP CANVAS
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Wall
    ctx.fillStyle = "#555";
    ctx.fillRect(wallX, 0, 20, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText("Fixed Wall (x=400)", wallX - 90, 20);

    // 2. CALCULATE GEOMETRY
    let angleDeg = parseInt(slider.value);
    angleDisplay.innerText = angleDeg;
    let angleRad = angleDeg * (Math.PI / 180);

    let dx = wallX - robotX;
    let trueDistance = Math.abs(dx / Math.cos(angleRad));
    let dy = dx * Math.tan(angleRad);
    let targetY = robotY + dy;
    let validHit = (targetY >= 0 && targetY <= canvas.height);

    // 3. DRAW ROBOT
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(robotX, robotY, 15, 0, Math.PI * 2);
    ctx.fill();

    // 4. UPDATE NOISE (Slow Motion Logic: Updates every 0.5s)
    if (fusionToggle.checked) {
        if (!timestamp) timestamp = performance.now(); 
        if (timestamp - lastNoiseUpdate > 500) { 
            // Generate new random noise (-25 to +25 for visibility)
            currentNoise = (Math.random() - 0.5) * 50; 
            lastNoiseUpdate = timestamp;
        }
    } else {
        currentNoise = 0; 
    }

    // 5. DRAW BEAMS & TEXT
    if (!validHit) {
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(robotX, robotY);
        ctx.lineTo(robotX + Math.cos(angleRad) * 500, robotY + Math.sin(angleRad) * 500);
        ctx.stroke();
        updateText("Out of Range", "--", "--", "Unknown");
    } else {
        
        let displayDist = trueDistance;
        let noisyDist = "--";

        if (fusionToggle.checked) {
            // --- CALCULATION FIRST ---
            let reading2 = trueDistance + currentNoise;
            
            // FUSION MATH: (True + Noisy) / 2
            displayDist = (trueDistance + reading2) / 2;
            noisyDist = reading2.toFixed(1);

            // --- DRAWING ---
            
            // 1. Orange Beam (The Noisy Input)
            // Jitters by the FULL noise amount
            ctx.beginPath();
            ctx.moveTo(robotX, robotY);
            ctx.lineTo(wallX, targetY + currentNoise); 
            ctx.strokeStyle = "rgba(255, 165, 0, 0.6)"; 
            ctx.lineWidth = 4;
            ctx.stroke();

            // 2. Green Beam (The Fused Output)
            // Jitters by HALF the noise amount (representing the average)
            ctx.beginPath();
            ctx.moveTo(robotX, robotY);
            ctx.lineTo(wallX, targetY + (currentNoise / 2)); 
            ctx.strokeStyle = "#00ff00"; 
            ctx.lineWidth = 2;
            ctx.stroke();

        } else {
            // Fusion OFF: Just show the perfect Green line
            ctx.beginPath();
            ctx.moveTo(robotX, robotY);
            ctx.lineTo(wallX, targetY);
            ctx.strokeStyle = "#00ff00"; 
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // C. Localization
        let estimatedX = wallX - (displayDist * Math.cos(angleRad));
        
        updateText(
            trueDistance.toFixed(1), 
            noisyDist, 
            displayDist.toFixed(1), 
            estimatedX.toFixed(0) + " (Actual: 50)"
        );

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(wallX, targetY, 5, 0, Math.PI*2);
        ctx.fill();
    }

    if (fusionToggle.checked) {
        requestAnimationFrame(draw);
    }
}

function updateText(trueD, noisyD, finalD, locX) {
    trueDistDisp.innerText = trueD;
    noisyDistDisp.innerText = noisyD;
    finalDistDisp.innerText = finalD;
    locXDisp.innerText = locX;
    
    const noisyEl = document.querySelector('.noisy-data');
    noisyEl.style.display = fusionToggle.checked ? 'block' : 'none';
}

// Event Listeners
slider.addEventListener('input', () => { draw(); });

fusionToggle.addEventListener('change', () => {
    if(fusionToggle.checked) {
        lastNoiseUpdate = 0; 
        requestAnimationFrame(draw);
    } else {
        draw();
    }
});

// Initial Draw
draw();