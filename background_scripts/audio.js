navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

var FREQUENCIES = Freq.getFrequencies();

var previousMagnitude = 0; // TODO fix this hack
function workerMessageHandler(event) {
  var magnitudes = event.data;
  var maxMagnitude = 0;
  var maxMagnitudeIndex = -1;

  for (var i = 0; i < magnitudes.length; i++) {
    if (magnitudes[i] > maxMagnitude) {
      maxMagnitudeIndex = i;
      maxMagnitude = magnitudes[i];
    }
  }

  if (maxMagnitude > 500) {
    console.log(FREQUENCIES[maxMagnitudeIndex], maxMagnitude);
  } else {
    console.log('Sad...');
  }
}

if (navigator.getUserMedia) {
  console.log('Exists..');
  navigator.getUserMedia({audio: true}, function(stream) {

    // Declare some useful variables
    var audioContext = new AudioContext();
    var scriptProcessor = audioContext.createScriptProcessor(1024, 1, 1);
    var mic = audioContext.createMediaStreamSource(stream);
    var worker = new Worker(chrome.runtime.getURL('background_scripts/worker.js'))
    worker.postMessage({
      'init': {
        'frequencies': Freq.getFrequencies(),
        'sampleRate': audioContext.sampleRate,
      }
    });

    // Connect the streams
    scriptProcessor.connect(audioContext.destination);
    mic.connect(scriptProcessor);

    // Setup event listeners
    worker.addEventListener('message', workerMessageHandler);

    scriptProcessor.onaudioprocess = function(event) {
      var data = event.inputBuffer.getChannelData(0);
      worker.postMessage(data);
    };
  }, function() {
    console.log('Error!');
  });
}
