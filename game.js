// INITIALIZE CANVAS AND CONTEXT
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// INITIALIZE COLLISION CANVAS AND CONTEXT
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");

// SET CANVAS DIMENSIONS AND PLAY BACKGROUND MUSIC ON PAGE LOAD
window.onload = function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  collisionCanvas.width = window.innerWidth;
  collisionCanvas.height = window.innerHeight;
  bgm.play();
};

// INITIALIZE BACKGROUND MUSIC AND SET LOOP
const bgm = new Audio("assets/dancehall-124368.mp3");
bgm.play();
bgm.loop = true;

// INITIALIZE VARIABLES FOR GAME LOGIC
let timeToNextRaven = 0;
let ravenInterval = 950;
let lastTime = 0;
let score = 0;
let gameOver = false;
let lives = 5;

// ARRAY TO STORE RAVEN OBJECTS
let ravens = [];

// RAVEN CLASS DEFINITION
class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier; 
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = "assets/raven.png";
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
    this.hasTrail = Math.random() > 0.5;
  }

  update(deltatime) {
    if (this.y < 0 || this.y > canvas.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX; 
    this.y -= this.directionY;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
    this.timeSinceFlap += deltatime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
      if (this.hasTrail) {
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (this.x < 0 - this.width) {
      lives--;
      if (lives == 0) {
        gameOver = true;
        window.location.href = "gameover.html";
      }
    }
  }

  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height); 
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
// ARRAY TO STORE EXPLOSION OBJECTS
let explosions = [];
// EXPLOSION CLASS DEFINITION
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "assets/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.x = x;
    this.y = y;
    this.size = size; 
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "assets/gunshot.mp3";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markedForDeletion = false;
  }

  update(deltatime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltatime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      //Update logic for Explosion objects
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size * 0.25,
      this.size,
      this.size
    );
  }
}
// ARRAY TO STORE PARTICLE OBJECTS
let particles = [];
// PARTICLE CLASS DEFINITION
class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size * 0.5 + Math.random() * 50 - 25; //Particle class properties and methods
    this.y = y + this.size * 0.3;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + 35;
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = color;
  }

  update() {
    this.X += this.speedX;
    this.radius += 0.8;
    if (this.radius > this.maxRadius - 5) this.markedForDeletion = true; //Update logic for Particle objects
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath(); //Draw logic for Particle objects
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
// FUNCTION TO DRAW SCORE ON CANVAS

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "50px Concert One"; //Draw score on canvas logic
  ctx.fillText("Score: " + score, 50, 75);
}
// FUNCTION TO DRAW LIVES ON CANVAS
function drawLives() {
  ctx.fillStyle = "black";
  ctx.font = "50px Concert One"; //Draw lives on canvas logic
  ctx.fillText("Lives: " + lives, 1240, 75);
}
// EVENT LISTENER FOR MOUSE CLICK
window.addEventListener("click", function (e) {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  const pc = detectPixelColor.data;

  ravens.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      object.markedForDeletion = true;
      score++;
      explosions.push(new Explosion(object.x, object.y, object.width));

      sessionStorage.setItem("score", score);
    }
  });
});
// FUNCTION TO GET SCORE MESSAGE BASED ON SCORE
function getScoreMessage(score) {
  let message;
  if (score >= 0 && score <= 10) {
    message = "Baby Steps..!!!";
  } else if (score > 10 && score <= 20) {
    message = "Getting better!";
  } else if (score > 20 && score <= 30) {
    message = "Impressive!";
  } else {
    message = "You're on fire!";
  }

  sessionStorage.setItem("scoreMessage", message);

  return message;
}
// MAIN ANIMATION FUNCTION
function animate(timestamp) {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;

    if (score > 0) {
      if (score % 40 == 0) {
        if (lives >= 5) {
          score += 20;
        }
      }
    }

    const scoreMessage = getScoreMessage(score);
    ctx.fillStyle = "black";
    ctx.font = "30px Concert One";
    ctx.fillText(scoreMessage, 640, 75);

    if (timeToNextRaven > ravenInterval) {
      ravens.push(new Raven());
      timeToNextRaven = 0;
      ravens.sort(function (a, b) {
        return a.width - b.width;
      });
    }
    drawScore();
    drawLives();
    [...particles, ...ravens, ...explosions].forEach((object) =>
      object.update(deltatime)
    );
    [...particles, ...ravens, ...explosions].forEach((object) => object.draw());
    ravens = ravens.filter((object) => !object.markedForDeletion);
    explosions = explosions.filter((object) => !object.markedForDeletion);
    particles = particles.filter((object) => !object.markedForDeletion);

    requestAnimationFrame(animate);
  } else {
    drawGameOver();
  }
}

// FUNCTION TO STOP THE GAME
function stopGame() {
  gameOver = true;
}
// INITIALIZE ANIMATION WITH A TIMESTAMP OF 0
animate(0);
