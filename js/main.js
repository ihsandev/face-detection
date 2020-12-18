const video = document.getElementById('video')
let predictedAge = [];

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  )
}

video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval( async () => {
    const detection = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
    const resizeDetection = faceapi.resizeResults(detection, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizeDetection)
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetection)
    faceapi.draw.drawFaceExpressions(canvas, resizeDetection)

    const age = resizeDetection[0]?.age;
    const interpolatedAge = interpolatedAgePredict(age)
    const bottomRight = {
      x: resizeDetection[0]?.detection.box.bottomRight.x - 50,
      y: resizeDetection[0]?.detection.box.bottomRight.y
    }

    new faceapi.draw.DrawTextField(
      [`${faceapi.utils.round(interpolatedAge, 0)} tahun`],
      bottomRight
    ).draw(canvas)
  }, 100)
})

function interpolatedAgePredict(age) {
 predictedAge = [age].concat(predictedAge).slice(0, 30);
 const avgPredictedAge = 
  predictedAge.reduce((total, a) => total + a) / predictedAge.length
  return avgPredictedAge 
}