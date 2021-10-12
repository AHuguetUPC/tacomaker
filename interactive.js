var canvas = document.getElementById('canvas');
var ctx2 = canvas.getContext('2d');

draw();

var mouseDown = false;
var antPos = [];

var firstChosen = false;
var planningActivated = false;

function reloadPage(ms=0) {
    setTimeout(function () {
        document.location.href = "./index.html";
    }, ms);
}

function downloadTLs(filename) {
    var text = "";
    for (var i = 0; i < yellowpathPoints.length; ++i) text += yellowpathPoints[i][0] + " " + -yellowpathPoints[i][1] + " ";
    text += "\n";
    for (var i = 0; i < bluepathPoints.length; ++i) text += bluepathPoints[i][0] + " " + -bluepathPoints[i][1] + " ";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

document.body.onmouseup = function() {
    mouseDown = false;
    deltaPos = [0,0];
    antPos = movedPos;
}

document.getElementById("info").onclick = function () {
    var text = "";
    text += "𝙄𝙣𝙨𝙩𝙧𝙪𝙘𝙘𝙞𝙤𝙣𝙨 𝙙𝙚 𝙘𝙤𝙢 𝙪𝙩𝙞𝙡𝙞𝙩𝙯𝙖𝙧 𝙚𝙡 𝙏𝙖𝙘𝙤 𝙈𝙖𝙠𝙚𝙧" + "\n";
    text += "\n";
    text += "𝗦𝗵𝗶𝗳𝘁: Crear tracklimit groc." + "\n";
    text += "𝗖𝗼𝗻𝘁𝗿𝗼𝗹: Crear tracklimit blau." + "\n";
    text += "𝗘𝘀𝗰𝗮𝗽𝗲: Mode de translació. Arrosega el ratolí i fes zoom amb la rodeta." + "\n";
    text += "\n";
    text += "- Aparaixerà una 𝗰𝗶𝗿𝗰𝘂𝗺𝗳𝗲𝗿𝗲̀𝗻𝗰𝗶𝗮 de radi 5(m) que marca el límit normatiu de distància entre cons." + "\n";
    text += "- Aparaixerà un 𝗿𝗲𝗰𝘁𝗮𝗻𝗴𝗹𝗲 que marca el límit normatiu de mínima amplitut de la track: 3m." + "\n";
    text += "\n";
    text += "Quan acabis els teus tracklimits, pica '𝗘𝗻𝘁𝗲𝗿' per descarregar-los." + " ";
    text += "Per començar uns nou TLs, pica la tecla '𝗥'." + " ";
    text += "Si t'equivoques en un tracklimit pica la tecla '𝗥𝗲𝘁𝗿𝗼𝗰𝗲𝗱𝗶𝗿' per tirar un pas enrere." + "\n";
    text += "\n";
    text += "La bola del mig representa el Xaloc, comença el TL blau a la seva esquerra (pintada en blau) i el groc a la seva dreta." + "\n";

    alert(text);
    console.log(text);
}

onmousemove = function(e) {
    if (mouseDown && !controlDown && !shiftDown) {
        deltaPos = [(antPos[0]-e.clientX)/sensitivity, (antPos[1]-e.clientY)/sensitivity];
        movedPos[0] -= deltaPos[0]; movedPos[1] -= deltaPos[1];
        antPos = [e.clientX, e.clientY];
    }
}

document.body.onmousedown = function(e) {
    antPos = [e.clientX, e.clientY];
    mouseDown = true;

    var movedPoint = [(e.clientX - movedPos[0] - 5)/scrollvalue, (e.clientY - movedPos[1] - 5)/scrollvalue];

    if (controlDown && bluepathPoints.length > 0) {
        // Check loop closure
        var firstPoint = bluepathPoints[0];
        var distsq2ini = (movedPoint[0]-firstPoint[0])*(movedPoint[0]-firstPoint[0]) + (movedPoint[1]-firstPoint[1])*(movedPoint[1]-firstPoint[1]);
        if (bluepathPoints.length > 1 && distsq2ini < 2*2) {
            bluepathPoints.push(firstPoint);
            blueloopClosed = true;
            controlDown = false;
        } else {
            bluepathPoints.push(movedPoint);
            blueloopClosed = false;
        }
    } else if (controlDown && bluepathPoints.length == 0) {
        bluepathPoints.push(movedPoint);
    } else if (shiftDown && yellowpathPoints.length > 0) {
        // Check loop closure
        var firstPoint = yellowpathPoints[0];
        var distsq2ini = (movedPoint[0]-firstPoint[0])*(movedPoint[0]-firstPoint[0]) + (movedPoint[1]-firstPoint[1])*(movedPoint[1]-firstPoint[1]);
        if (yellowpathPoints.length > 1 && distsq2ini < 2*2) {
            yellowpathPoints.push(firstPoint);
            yellowloopClosed = true;
            shiftDown = false;
        } else {
            yellowpathPoints.push(movedPoint);
            yellowloopClosed = false;
        }
    } else if (shiftDown && yellowpathPoints.length == 0) {
        yellowpathPoints.push(movedPoint);
    }
}

var sensitivity = 0.75;
var controlDown = false;
var shiftDown = false;

document.addEventListener("keydown", function(e) {
    if (e.ctrlKey) {
        console.log("control down");
        if (!controlDown) shiftDown = false;
        controlDown = !controlDown;
    } else if (e.shiftKey) {
        console.log("shift down");
        if (!shiftDown) controlDown = false;
        shiftDown = !shiftDown;
    } else if (e.code == "Space" || e.code == "Escape") {
        controlDown = false;
        shiftDown = false;
    } else if (e.code == "Enter") {
        var timestamp = Math.round(+new Date()/1000).toString(); 
        downloadTLs(timestamp + ".tls");
        // reloadPage();
    } else if (e.code == "KeyR") {
        reloadPage();
    }
    
    if (controlDown && bluepathPoints.length > 0 && e.code == "Backspace") {
        bluepathPoints.pop();
        if (bluepathPoints[bluepathPoints.length-1] == bluepathPoints[0]) blueloopClosed = true;
        else blueloopClosed = false;
    } else if (shiftDown && yellowpathPoints.length > 0 && e.code == "Backspace") {
        yellowpathPoints.pop();
        if (yellowpathPoints[yellowpathPoints.length-1] == yellowpathPoints[0]) yellowloopClosed = true;
        else yellowloopClosed = false;
    } 
});

document.body.addEventListener('wheel', function(e) {
    scrollvalue -= e.deltaY/100;
    scrollvalue = Math.max(2, scrollvalue);
    scrollvalue = Math.min(scrollvalue, 50);
});