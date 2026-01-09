// Simple Pong - player controls left paddle with mouse or arrow keys
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const pScoreEl = document.getElementById('pScore');
const cScoreEl = document.getElementById('cScore');
const restartBtn = document.getElementById('restart');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game objects
const paddle = {w:12,h:90,x:20,y:(HEIGHT-90)/2, speed:6};
const ai = {w:12,h:90,x: WIDTH-20-12,y:(HEIGHT-90)/2, speed:4};
const ball = {r:8,x:WIDTH/2,y:HEIGHT/2,vx:5,vy:3,speed:5};

let playerScore = 0;
let aiScore = 0;
let up=false, down=false;

function resetBall(direction=1){
  ball.x = WIDTH/2;
  ball.y = HEIGHT/2;
  // randomize initial angle
  const angle = (Math.random() * Math.PI/3) - Math.PI/6; // -30..30 deg
  ball.speed = 5;
  ball.vx = direction * ball.speed * Math.cos(angle);
  ball.vy = ball.speed * Math.sin(angle);
}

function drawRect(x,y,w,h,color){
  ctx.fillStyle = color;
  ctx.fillRect(x,y,w,h);
}

function drawCircle(x,y,r,color){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();
}

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

// Controls: mouse
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  const mouseY = (e.clientY - rect.top) * scaleY;
  paddle.y = clamp(mouseY - paddle.h/2, 0, HEIGHT - paddle.h);
});

// Controls: keyboard
window.addEventListener('keydown', e => {
  if(e.key === 'ArrowUp') up = true;
  if(e.key === 'ArrowDown') down = true;
});
window.addEventListener('keyup', e => {
  if(e.key === 'ArrowUp') up = false;
  if(e.key === 'ArrowDown') down = false;
});

function update(){
  // player keyboard movement
  if(up) paddle.y -= paddle.speed;
  if(down) paddle.y += paddle.speed;
  paddle.y = clamp(paddle.y, 0, HEIGHT - paddle.h);

  // AI: move toward ball with limited speed
  const target = ball.y - (ai.h/2);
  if(ai.y + ai.h/2 < ball.y - 6) ai.y += ai.speed;
  else if(ai.y + ai.h/2 > ball.y + 6) ai.y -= ai.speed;
  ai.y = clamp(ai.y, 0, HEIGHT - ai.h);

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/bottom collision
  if(ball.y - ball.r <= 0){
    ball.y = ball.r;
    ball.vy *= -1;
  }
  if(ball.y + ball.r >= HEIGHT){
    ball.y = HEIGHT - ball.r;
    ball.vy *= -1;
  }

  // Left paddle collision
  if(ball.x - ball.r <= paddle.x + paddle.w){
    if(ball.y >= paddle.y && ball.y <= paddle.y + paddle.h){
      // reflect with angle depending on hit position
      const rel = (ball.y - (paddle.y + paddle.h/2)) / (paddle.h/2);
      const bounceAngle = rel * (Math.PI/4); // max 45deg
      const dir = 1; // to the right
      ball.speed *= 1.05; // increase speed slightly
      ball.vx = dir * ball.speed * Math.cos(bounceAngle);
      ball.vy = ball.speed * Math.sin(bounceAngle);
      ball.x = paddle.x + paddle.w + ball.r; // prevent sticking
    }
  }

  // Right paddle collision
  if(ball.x + ball.r >= ai.x){
    if(ball.y >= ai.y && ball.y <= ai.y + ai.h){
      const rel = (ball.y - (ai.y + ai.h/2)) / (ai.h/2);
      const bounceAngle = rel * (Math.PI/4);
      const dir = -1; // to the left
      ball.speed *= 1.03;
      ball.vx = dir * ball.speed * Math.cos(bounceAngle);
      ball.vy = ball.speed * Math.sin(bounceAngle);
      ball.x = ai.x - ball.r;
    }
  }

  // Score check
  if(ball.x + ball.r < 0){
    // AI scores
    aiScore++;
    cScoreEl.textContent = aiScore;
    resetBall(1);
  }
  if(ball.x - ball.r > WIDTH){
    // Player scores
    playerScore++;
    pScoreEl.textContent = playerScore;
    resetBall(-1);
  }
}

function draw(){
  // clear
  ctx.clearRect(0,0,WIDTH,HEIGHT);

  // middle dashed line
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  const dashH = 14; const gap = 10; let y = 0;
  while(y < HEIGHT){
    ctx.fillRect(WIDTH/2 - 1, y, 2, dashH);
    y += dashH + gap;
  }

  // paddles
  drawRect(paddle.x, paddle.y, paddle.w, paddle.h, '#ffffff');
  drawRect(ai.x, ai.y, ai.w, ai.h, '#ffffff');

  // ball
  drawCircle(ball.x, ball.y, ball.r, '#ffffff');
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

restartBtn.addEventListener('click', ()=>{
  playerScore = 0; aiScore = 0;
  pScoreEl.textContent = '0'; cScoreEl.textContent = '0';
  resetBall(Math.random() < 0.5 ? 1 : -1);
});

// initialize
resetBall(Math.random() < 0.5 ? 1 : -1);
requestAnimationFrame(loop);
