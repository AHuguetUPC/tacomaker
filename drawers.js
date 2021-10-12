var colours = ['black', 'green'];
var n = colours.length;
var r = 0.5;
var d = r * 2;

// create an offsreen canvas containing the desired coloured circles
var off = document.createElement('canvas');
off.width = n * d;
off.height = d;
var ctx = off.getContext('2d');

for (var i = 0; i < n; ++i) {
    ctx.fillStyle = colours[i];
    ctx.beginPath();
    ctx.arc(i * d + r, r, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
}

// get handles to the on-screen canvas
var canvas = document.getElementById('canvas');
var ctx2 = canvas.getContext('2d');

var movedPos = [0, 0];
var deltaPos = [0, 0];
ctx2.save();    // 1. Save origin

// Translate to center
centroid = [0, 0];
deltaPos = [-centroid[0] + canvas.width/2, -centroid[1] + canvas.height/2];
movedPos[0] += deltaPos[0]; movedPos[1] += deltaPos[1];
ctx2.translate(movedPos[0], movedPos[1]);
deltaPos = [0, 0];

function toggleMode() {
    if (controlDown) {
        document.getElementById('mode').innerText = "Blaus (esquerra)";
        document.getElementById('mode').style.backgroundColor = "blue";
        document.getElementById('mode').style.color = "white";
    } else if (shiftDown) {
        document.getElementById('mode').innerText = "Grocs (dreta)";
        document.getElementById('mode').style.backgroundColor = "yellow";
        document.getElementById('mode').style.color = "black";
    } else {
        document.getElementById('mode').innerText = "Translation";
        document.getElementById('mode').style.color = "black";
        document.getElementById('mode').style.backgroundColor = "white";
    }
}

function clear() {
    ctx2.restore(); // Go to origin
    ctx2.save();    // 1. Save origin
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
}

var scrollvalue = 10;

var carPos = [-1,-1];
var carDir = [-1,-1];

var bluepathPoints = [];
var yellowpathPoints = [];
var blueloopClosed = false;
var yellowloopClosed = false;

ctx2.globalCompositeOperation='destination-over';

function drawPathpoints(pathpoints, color) {
    // Path
    if (pathpoints.length >= 1) {
        ctx2.beginPath();
        ctx2.moveTo(pathpoints[0].x, pathpoints[0].y);
        ctx2.arc(pathpoints[0].x, pathpoints[0].y, 5, 0, 2 * Math.PI, false);
        ctx2.fillStyle = color ? 'orange' : 'blue';
        ctx2.fill();
        ctx2.closePath();
    }

    if (pathpoints.length > 1) {
        for (var i = 1; i < pathpoints.length; ++i) {
            var ant_pp = pathpoints[i-1];
            var pp = pathpoints[i];
            
            // Line
            ctx2.beginPath();
            ctx2.lineWidth = 3;
            ctx2.strokeStyle = color ? 'orange' : 'blue';    
            ctx2.lineTo(ant_pp.x, ant_pp.y);
            ctx2.lineTo(pp.x, pp.y);
            ctx2.stroke();
            ctx2.closePath();

            // Circle
            ctx2.beginPath();
            ctx2.moveTo(pp.x, pp.y);
            ctx2.arc(pp.x, pp.y, 5, 0, 2 * Math.PI, false);
            ctx2.fillStyle = color ? 'orange' : 'blue';
            ctx2.fill();
            ctx2.closePath();
        }
    }

    // Circle delimiting 5m distance
    let isLoopClosed;
    if (color) isLoopClosed = yellowloopClosed;
    else isLoopClosed = blueloopClosed;

    let isKeyPressed;
    if (color) isKeyPressed = shiftDown;
    else isKeyPressed = controlDown;

    if (!isLoopClosed && isKeyPressed && pathpoints.length >= 1) {
        var pp = pathpoints[pathpoints.length-1];
        ctx2.moveTo(pp.x, pp.y);
        ctx2.beginPath();
        ctx2.lineWidth = 3;
        ctx2.strokeStyle = color ? 'orange' : 'blue';
        ctx2.arc(pp.x, pp.y, 5*scrollvalue, 0, 2 * Math.PI, false);
        ctx2.stroke();
        ctx2.closePath();
    }

    // Numerators
    for (var i = 0; i < pathpoints.length; ++i) {
        var pp = pathpoints[i];
        ctx2.font = "11px Arial";
        ctx2.fillText((i+1).toString(), pp.x - 10, pp.y - 10);
    }
}

function drawProhibitions(pathpoints, color) {
    if (pathpoints.length > 1) {
        for (var i = 1; i < pathpoints.length; ++i) {
            var ant_pp = pathpoints[i-1];
            var pp = pathpoints[i];

            // Perpendicular
            let norm = Math.sqrt((pp.x - ant_pp.x)*(pp.x - ant_pp.x) + (pp.y - ant_pp.y)*(pp.y - ant_pp.y));
            for (let perp_i = 0; perp_i < norm/3; ++perp_i) {
                ctx2.beginPath();
                ctx2.lineWidth = 2;
                ctx2.strokeStyle = color ? '#ffe6e6' : '#e6e6ff';

                let linspace_xi = ant_pp.x + perp_i/(norm/3)*(pp.x - ant_pp.x);
                let linspace_yi = ant_pp.y + perp_i/(norm/3)*(pp.y - ant_pp.y);

                let multiplier = color ? 1 : -1;

                let perp_xi = linspace_xi + multiplier*3*scrollvalue*(pp.y - ant_pp.y)/norm;
                let perp_yi = linspace_yi - multiplier*3*scrollvalue*(pp.x - ant_pp.x)/norm;    
                
                ctx2.lineTo(linspace_xi, linspace_yi);
                ctx2.lineTo(perp_xi, perp_yi);

                ctx2.stroke();
                ctx2.closePath();
            }
        }
    }
}

function drawCar() {
    ctx2.beginPath();
    ctx2.moveTo(0, 0);
    ctx2.arc(0, 0, 1*scrollvalue, 0 + Math.PI/2, 1 * Math.PI + Math.PI/2, false);
    ctx2.fillStyle = 'blue';
    ctx2.fill();
    ctx2.closePath();

    ctx2.beginPath();
    ctx2.moveTo(0, 0);
    ctx2.arc(0, 0, 1*scrollvalue, 1 * Math.PI + Math.PI/2, 2 * Math.PI + Math.PI/2, false);
    ctx2.fillStyle = 'orange';
    ctx2.fill();
    ctx2.closePath();
}

function draw() {
    var t0 = Date.now();

    // Update mode header
    toggleMode();

    var bluepathpoints = [];
    var yellowpathpoints = [];

    // Consider path points
    for (var i = 0; i < bluepathPoints.length; ++i) {
        try {
            bluepathpoints.push({
                x: scrollvalue*bluepathPoints[i][0],
                y: scrollvalue*bluepathPoints[i][1],
                id: i
            });
        } catch {}
    }

    for (var i = 0; i < yellowpathPoints.length; ++i) {
        try {
            yellowpathpoints.push({
                x: scrollvalue*yellowpathPoints[i][0],
                y: scrollvalue*yellowpathPoints[i][1],
                id: i
            });
        } catch {}
    }

    // clear canvas
    clear();
    
    ctx2.translate(movedPos[0], movedPos[1]);
 
    // Draw prohibitions
    drawProhibitions(bluepathpoints, false);
    drawProhibitions(yellowpathpoints, true);

    // Draw tracklimits
    drawPathpoints(bluepathpoints, false);
    drawPathpoints(yellowpathpoints, true);

    // Draw car
    drawCar();

    var t1 = Date.now();
    // console.log((t1 - t0) + "ms");

    requestAnimationFrame(draw);
}