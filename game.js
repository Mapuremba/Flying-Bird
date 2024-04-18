// Constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const birdSize = 50; // Adjusted bird size
const pipeWidth = 50;
const pipeGap = 150; // Adjusted pipe gap
const pipeMargin = 5; // Adjusted margin between pipe and texture
const gravity = 0.25;
const pipeSpeed = 3;
const pipeSpawnFrequency = 100; // Adjust this to change how often pipes spawn

// Load city background image
const cityImage = new Image();
cityImage.src = 'city.webp'; // Replace 'city.jpg' with the path to your city background image

// Load bird image
const birdImage = new Image();
birdImage.src = 'bird.png'; // Assuming bird.jpg is in the same directory as your HTML file

// Load tap sound
const tapSound = new Audio('Flap.mp3'); // Replace 'Flap.mp3' with the path to your sound file

// Load collision sound
const collisionSound = new Audio('Collision.mp3'); // Replace 'Collision.mp3' with the path to your collision sound file

// Light green texture color
const lightGreenColor = '#8AE884';
// Light yellowish texture color
const lightYellowishColor = '#F0E68C';

// Bird properties
let birdY = canvas.height / 2;
let birdSpeed = 0;
let gameStarted = false; // Variable to track whether the game has started

// Pipe properties
let pipes = [];
let pipeSpawnTimer = 0;

// Score
let score = 0;

// Event listeners
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true;
            birdSpeed = -7;
            tapSound.play(); // Play tap sound when spacebar is pressed for the first time
            
            // Hide the start screen
            document.querySelector('.start-screen').style.display = 'none';
        } else {
            birdSpeed = -7;
            tapSound.play(); // Play tap sound on subsequent taps
        }
    }
});


function drawPipe(x, gapY) {
    const topPipeHeight = gapY;
    const bottomPipeHeight = canvas.height - gapY - pipeGap;

    // Set fill style to green for the main pipe
    ctx.fillStyle = 'green';

    // Draw the top pipe
    ctx.fillRect(x, 0, pipeWidth, topPipeHeight);

    // Draw the bottom pipe
    ctx.fillRect(x, gapY + pipeGap, pipeWidth, bottomPipeHeight);

    // Draw light green texture on the left side of pipes
    ctx.fillStyle = lightGreenColor;

    // Top pipe
    ctx.fillRect(x - pipeMargin, 0, pipeMargin, topPipeHeight);

    // Bottom pipe
    ctx.fillRect(x - pipeMargin, gapY + pipeGap, pipeMargin, bottomPipeHeight);

    // Draw light yellowish texture on the left side of pipes
    ctx.fillStyle = lightYellowishColor;

    // Top pipe
    ctx.fillRect(x - pipeMargin, 0, pipeMargin / 2, topPipeHeight);

    // Bottom pipe
    ctx.fillRect(x - pipeMargin, gapY + pipeGap, pipeMargin / 2, bottomPipeHeight);

    // Draw an invisible strip of line in the middle of the pipes
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent color
    ctx.fillRect(x, gapY, pipeWidth, pipeGap); // Adjust position based on pipe gap
}

function drawBird(x, y) {
    // Draw bird image
    ctx.drawImage(birdImage, x, y, birdSize, birdSize); // Adjusted bird size
}

function checkCollision() {
    const birdX = 50; // Bird's x position
    // Check collision with pipes
    for (let i = 0; i < pipes.length; i++) {
        const pipeX = pipes[i][0];
        const pipeY = pipes[i][1];
        
        if (
            (birdY < pipeY || birdY + birdSize > pipeY + pipeGap) &&
            (birdX + birdSize > pipeX && birdX < pipeX + pipeWidth)
        ) {
            // Play collision sound
            collisionSound.play();
            // Play game over sound
            new Audio('GameOver.mp3').play();
            return true;
        }
    }
    // Check collision with canvas boundaries including the bottom
    if (birdY < 0 || birdY + birdSize > canvas.height) {
        // Play game over sound
        new Audio('GameOver.mp3').play();
        return true;
    }
    return false;
}

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw city background
    ctx.drawImage(cityImage, 0, 0, canvas.width, canvas.height);

    // Update bird position if the game has started
    if (gameStarted) {
        birdSpeed += gravity;
        birdY += birdSpeed;
    }

    // Draw bird
    drawBird(50, birdY);

    // Spawn pipes if the game has started
    if (gameStarted) {
        pipeSpawnTimer++;
        if (pipeSpawnTimer === pipeSpawnFrequency) {
            const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
            pipes.push([canvas.width, pipeHeight]);
            pipeSpawnTimer = 0;
        }
    }

    // Update pipe positions if the game has started
    if (gameStarted) {
        for (let i = 0; i < pipes.length; i++) {
            pipes[i][0] -= pipeSpeed;

            // Remove pipes that are out of screen
            if (pipes[i][0] + pipeWidth < 0) {
                pipes.splice(i, 1);
                i--;
            } else if (pipes[i][0] < birdSize && pipes[i][0] + pipeWidth > birdSize) {
                // Check if bird has passed through the pipe and increment score
                score++;
            }
        }
    }

    // Check collision
    if (checkCollision()) {
        gameOver();
        return; // Stop the game loop
    }

    // Draw pipes if the game has started
    if (gameStarted) {
        for (let i = 0; i < pipes.length; i++) {
            drawPipe(pipes[i][0], pipes[i][1]);
        }
    }

    // Draw score
    drawScore();

    // Call gameLoop recursively
    requestAnimationFrame(gameLoop);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30); // Adjust position based on your preference
}

function gameOver() {
    // Array of colors: violet, indigo, blue, green, yellow, orange, red
    const colors = ['#8A2BE2', '#4B0082', '#0000FF', '#008000', '#FFFF00', '#FFA500', '#FF0000'];

    ctx.font = '30px Cooper Black'; // Adjust font size to 30px
    const gameOverText = 'GAME OVER';
    const gameOverTextWidth = ctx.measureText(gameOverText).width;
    const textHeight = parseInt(ctx.font, 10); // Get text height
    const padding = 10; // Padding around the text
    const borderRadius = 5; // Border radius for rounded corners

    // Calculate the position of the rectangular box for "GAME OVER"
    const gameOverBoxX = canvas.width / 2 - gameOverTextWidth / 2 - padding;
    const gameOverBoxY = canvas.height / 2 - textHeight / 2 - padding;

    // Draw "GAME OVER" text with specified color
    setInterval(function() {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]; // Pick a random color from the array
        ctx.fillText(gameOverText, canvas.width / 2 - gameOverTextWidth / 2, canvas.height / 2);
    }, 100); // Change color every 100 milliseconds
}

// Start the game loop
gameLoop();
