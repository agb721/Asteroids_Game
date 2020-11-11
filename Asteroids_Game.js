"use strict";

// canvas
var canvas_width = 500
var canvas_height = 500
var canv = hlInitCanvas(canvas_width, canvas_height)

// starting angle
var angle = 0

// initialize central circle
var x0 = 200
var y0 = 200
var x1 = 0
var y1 = 0
var x_u = 0
var y_u = 0
var radius0 = 20

function mainLoop()
{
  hlClear()
  game_clear()
  
  // Player functions
  draw_player()
  bullets() // sleep for 500ms
  
  // Asteroid functions
  astDraw()
  bullet_collision()
  player_collision()
}

// PLAYER

// motion variables
var new_vec_x = 0
var new_vec_y = 0

function draw_player()
{
  // outer circle variables
  var radius1 = 5
  var rot_speed = .1
  // unit vector for satellite position
  x_u = Math.cos(angle)
  y_u = Math.sin(angle)
  // satellite trajectory
  var x = x_u*radius0
  var y = y_u*radius0
  // satellite coordinates
  x1 = x0+x
  y1 = y0+y
  // draw central circle
  hlDrawCircle(x0, y0, radius0-radius1, "blue")
  // draw satellite circle
  hlDrawCircle(x1, y1, radius1, "orange")
  
  // ROTATION & MOVEMENT
  // rotate satellite
  if (hlKeyHeld("ArrowRight"))
  {
    angle = angle - rot_speed
  }
  if (hlKeyHeld("ArrowLeft"))
  {
    angle = angle + rot_speed
  }
  // move player
  if (hlKeyHeld("ArrowUp"))
  {
    new_vec_x += 0.2*x_u
    new_vec_y += 0.2*y_u
  }
  if (hlKeyHeld("ArrowDown"))
  {
    new_vec_x -= 0.2*x_u
    new_vec_y -= 0.2*y_u
  }
  
  x0 = x0 + new_vec_x
  y0 = y0 + new_vec_y
  new_vec_x *= 0.97
  new_vec_y *= 0.97
}

var bullet_count = 0
var bullets_vel = 10
var bullets_x = []
var bullets_y = []
var bullets_u_x = []
var bullets_u_y = []
var recentlyDrawn = 0

function bullets()
{
  // generate bullet data
  if (hlKeyHeld(" ") && recentlyDrawn <= 0)
  {
    bullets_x[bullet_count] = x1
    bullets_y[bullet_count] = y1
    bullets_u_x[bullet_count] = x_u
    bullets_u_y[bullet_count] = y_u
    bullet_count++
    recentlyDrawn = 15
  }
  if (recentlyDrawn >= 0)
  {
    recentlyDrawn -= 1
  }
  
  // draw bullets // count = 3 // i = 0
  for(var i=0; i<bullet_count; i++)
  {
    var x = bullets_x[i] // 0
    var y = bullets_y[i]
    hlDrawCircle(x, y, 5, "red")
    bullets_x[i] = bullets_x[i] + bullets_u_x[i]*bullets_vel
    bullets_y[i] = bullets_y[i] + bullets_u_y[i]*bullets_vel
  }
}


// ASTEROIDS

// asteroid variables
let astNum = 5
var astShot = 0
let astRad = 15
var astVel = 2

// coordinate array
var x_arr = []
var y_arr = []
// vector array
var x_vec = []
var y_vec = []

// generate asteroid coordinates
for (var i=0; i<astNum; i++)
{
  x_arr[i] = Math.random()*500
  y_arr[i] = Math.random()*500
}

// generate asteroid unit vectors
for (var i=0; i<astNum; i++)
{
  var angle = Math.random()*2*Math.PI
  x_vec[i] = Math.cos(angle) * astVel // make -1 to +1
  y_vec[i] = Math.sin(angle) * astVel// make -1 to +1
}

// draw asteroids
function astDraw()
{
  // genarate asteroids
  for (var i=0; i<astNum; i++)
  {
    x_arr[i] += x_vec[i]
    y_arr[i] += y_vec[i]
    teleport(i)
    hlDrawCircle(x_arr[i], y_arr[i], astRad, "yellow")
  }
}

function teleport(i)
{
  // reach side edges
  if (x_arr[i] < 0)
  {
    x_arr[i] = canvas_width
  }
  if (x_arr[i] > canvas_width)
  {
    x_arr[i] = 0
  }
  //reach top of bottom edges
  if (y_arr[i] < 0)
  {
    y_arr[i] = canvas_height
  }
  if (y_arr[i] > canvas_height)
  {
    y_arr[i] = 0
  }
}

function bullet_collision()
{
  for (var i=0; i<astNum; i++)
  {
    for (var j=0; j<bullet_count; j++)
    {
      if (Math.pow(x_arr[i]-bullets_x[j],2) + Math.pow(y_arr[i]-bullets_y[j],2)  <=         Math.pow(astRad+5, 2))
        {
          x_arr.splice(i, 1)          
          y_arr.splice(i, 1)
          astShot++
        }
    }
  }
}

function player_collision()
{
  for (var i=0; i<astNum; i++)
  {
    if (Math.pow(x_arr[i]-x0,2) + Math.pow(y_arr[i]-y0,2)  <= Math.pow(astRad+15, 2))
      {
        alert("Game Over!! Reload Page to Start Over!!")
      }
  }
}

function game_clear()
{
  if (astNum == astShot)
  {
    alert("Game Clear!! Reload Page for Another Round!!")
  }
}

// fix your time step (article to check out)
hlStartMainLoop(mainLoop);


