var canvas = document.getElementById('canvas');
var ctx2 = canvas.getContext('2d');

draw();

var noiseYellow = false;
var noiseBlue = false;

var mouseDown = false;
var antPos = [];

var firstChosen = false;
var planningActivated = false;

function reloadPage(ms=0) {
    setTimeout(function () {
        document.location.href = "./index.html";
    }, ms);
}

function playSound(soundname) {
    var audio = new Audio(soundname);
    audio.play();
}

function downloadTLs(filename) {
    var text = "";
    for (var i = 0; i < yellowpathPoints.length; ++i) text += yellowpathPoints[i][0] + " " + -yellowpathPoints[i][1] + " ";
    text += "\n";
    for (var i = 0; i < bluepathPoints.length; ++i) text += bluepathPoints[i][0] + " " + -bluepathPoints[i][1] + " ";
    text += "\n";
    for (var i = 0; i < yellownoisePoints.length; ++i) text += yellownoisePoints[i][0] + " " + -yellownoisePoints[i][1] + " ";
    text += "\n";
    for (var i = 0; i < bluenoisePoints.length; ++i) text += bluenoisePoints[i][0] + " " + -bluenoisePoints[i][1] + " ";

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
    text += "ππ£π¨π©π§πͺππππ€π£π¨ ππ ππ€π’ πͺπ©ππ‘ππ©π―ππ§ ππ‘ ππππ€ πππ ππ§" + "\n";
    text += "\n";
    text += "π¦π΅πΆπ³π: Crear tracklimit groc." + "\n";
    text += "ππΌπ»ππΏπΌπΉ: Crear tracklimit blau." + "\n";
    text += "Tecla 'π¦': Crear soroll. Picar dos cops per canviar de color." + "\n";
    text += "Tecla 'π': Amagar l'estructura. Dos cops per amagar color." + "\n";
    text += "πππ°π?π½π²: Mode de translaciΓ³. Arrosega el ratolΓ­ i fes zoom amb la rodeta." + "\n";
    text += "\n";
    text += "- AparaixerΓ  una π°πΆπΏπ°ππΊπ³π²πΏπ²Μπ»π°πΆπ? de radi 5(m) que marca el lΓ­mit normatiu de distΓ ncia entre cons." + "\n";
    text += "- AparaixerΓ  un πΏπ²π°ππ?π»π΄πΉπ² que marca el lΓ­mit normatiu de mΓ­nima amplitut de la track: 3m." + "\n";
    text += "\n";
    text += "Quan acabis els teus tracklimits, pica 'ππ»ππ²πΏ' per descarregar-los." + " ";
    text += "Per comenΓ§ar uns nou TLs, pica la tecla 'π₯'." + " ";
    text += "Si t'equivoques en un tracklimit pica la tecla 'π₯π²ππΏπΌπ°π²π±πΆπΏ' per tirar un pas enrere." + "\n";
    text += "\n";
    text += "La bola del mig representa el Xaloc, comenΓ§a el TL blau a la seva esquerra (pintada en blau) i el groc a la seva dreta." + "\n";

    alert(text);
    console.log(text);
}

function cameraMove2Pos(posX, posY) {
    deltaPos = [(antPos[0]-posX)/sensitivity, (antPos[1]-posY)/sensitivity];
    movedPos[0] -= deltaPos[0]; movedPos[1] -= deltaPos[1];
    antPos = [posX, posY];
}

onmousemove = function(e) {
    if (mouseDown && !controlDown && !shiftDown) {
        cameraMove2Pos(e.clientX, e.clientY);
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
    } else if (noiseYellow) {
        yellownoisePoints.push(movedPoint);
    } else if (noiseBlue) {
        bluenoisePoints.push(movedPoint);
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
        noiseYellow = false;
        noiseBlue = false;
    } else if (e.shiftKey) {
        console.log("shift down");
        if (!shiftDown) controlDown = false;
        shiftDown = !shiftDown;
        noiseYellow = false;
        noiseBlue = false;
    } else if (e.code == "Space" || e.code == "Escape") {
        controlDown = false;
        shiftDown = false;
        noiseYellow = false;
        noiseBlue = false;
    } else if (e.code == "Enter") {
        var timestamp = Math.round(+new Date()/1000).toString(); 
        downloadTLs(timestamp + ".tls");
        // reloadPage();
    } else if (e.code == "KeyR") {
        reloadPage();
    } else if (e.code == "KeyS" && !noiseYellow && !noiseBlue) {
        controlDown = false;
        shiftDown = false;
        noiseYellow = true;
        noiseBlue = false;
    } else if (e.code == "KeyS" && noiseYellow) {
        controlDown = false;
        shiftDown = false;
        noiseYellow = false;
        noiseBlue = true;
    } else if (e.code == "KeyS" && noiseBlue) {
        controlDown = false;
        shiftDown = false;
        noiseYellow = false;
        noiseBlue = false;
    } else if (e.code == "KeyH" && !hidden) {
        hiddenOnlyColor = true;
        hiddenAll = false;
        hidden = hiddenOnlyColor || hiddenAll;
    } else if (e.code == "KeyH" && hiddenOnlyColor && !hiddenAll) {
        hiddenOnlyColor = false;
        hiddenAll = true;
        hidden = hiddenOnlyColor || hiddenAll;
    } else if (e.code == "KeyH" && !hiddenOnlyColor && hiddenAll) {
        hiddenOnlyColor = false;
        hiddenAll = false;
        hidden = hiddenOnlyColor || hiddenAll;
    } else if (e.code == "KeyI") {
        playSound("extra/posatacos.mp3");
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

    if (noiseBlue && bluenoisePoints.length > 0 && e.code == "Backspace") bluenoisePoints.pop();
    if (noiseYellow && yellownoisePoints.length > 0 && e.code == "Backspace") yellownoisePoints.pop();
});

document.body.addEventListener('wheel', function(e) {
    scrollvalue -= e.deltaY/100;
    scrollvalue = Math.max(2, scrollvalue);
    scrollvalue = Math.min(scrollvalue, 50);
});