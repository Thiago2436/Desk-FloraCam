let video = document.querySelector('#video');
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');
let calibrationHeight = null;

function startCamera() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({video: true})
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(error) {
            console.log("Error accessing camera: " + error.message);
        });
    }
}

function stopCamera() {
    let stream = video.srcObject;
    let tracks = stream.getTracks();

    tracks.forEach(function(track) {
        track.stop();
    });

    video.srcObject = null;
}

function measureHeight() {
    let points = findPoints();
    if (points.length < 2) {
        alert('Não foi possível encontrar pontos de referência.');
        return;
    }
    let distance = calculateDistance(points[0], points[1]);
    let height = (calibrationHeight / distance) * canvas.height;
    let result = `Altura do objeto: ${height.toFixed(2)} cm`;
    console.log(result);
    saveResult(result);
}

function findPoints() {
    let points = [];
    let highestPoint = null;
    let lowestPoint = null;
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        let x = (i / 4) % canvas.width;
        let y = Math.floor((i / 4) / canvas.width);
        let brightness = getBrightness(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]);
        if (brightness > 200) {
            if (!highestPoint || y < highestPoint.y) {
                highestPoint = { x, y };
            }
            if (!lowestPoint || y > lowestPoint.y) {
                lowestPoint = { x, y };
            }
        }
    }
    if (highestPoint && lowestPoint) {
        points.push(highestPoint, lowestPoint);
    }
    return points;
}

function calculateDistance(point1, point2) {
    let dx = point1.x - point2.x;
    let dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function getBrightness(r, g, b) {
    return (r + g + b) / 3;
}

function saveResult(result) {
    let blob = new Blob([result], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'resultado.txt');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('click', function(event) {
    if (event.target.id === 'calibrate') {
        calibrationHeight = prompt('Qual a altura em centímetros do objeto de calibração?');
    }
    if (event.target.id === 'measure') {
        measureHeight();
    }
});

startCamera();
