navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

function workerMessageHandler(event) {
  // alert('Received web worker message');
  console.log(event.data);
}

if (navigator.getUserMedia) {
  console.log('Exists..');
  navigator.getUserMedia({audio: true}, function(stream) {

    // Declare some useful variables
    var audioContext = new AudioContext();
    var scriptProcessor = audioContext.createScriptProcessor(1024, 1, 1);
    var mic = audioContext.createMediaStreamSource(stream);
    var worker = new Worker(chrome.runtime.getURL('background_scripts/worker.js'))

    // Connect the streams
    scriptProcessor.connect(audioContext.destination);
    mic.connect(scriptProcessor);

    // Setup event listeners
    worker.addEventListener('message', workerMessageHandler);

    scriptProcessor.onaudioprocess = function(event) {
      var data = event.inputBuffer.getChannelData(0);
      // worker.postMessage(data);
    };
  }, function() {
    console.log('Error!');
  });
}
