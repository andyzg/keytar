(function() {
  // Initialize anything in the global namespace
  navigator.getUserMedia = navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia;
})();

var SoundSequencer = function(bufferLength, callback) {
  this.dataSeries = [];
  this.callback = callback;
  this.BUFFER_LENGTH = bufferLength;
};

SoundSequencer.prototype.addSeries = function(series) {
  this.dataSeries = this.dataSeries.concat(Array.prototype.slice.call(series));
  if (this.dataSeries.length > this.BUFFER_LENGTH) {
    this.callback(this.dataSeries);
    this.reset();
  }
};

SoundSequencer.prototype.reset = function() {
  this.dataSeries = [];
}

var MagnitudeSequencer = function(maxLength, callback) {
  this.magSeries = [];
  this.frequencyIndex = -1;
  this.maxLength = maxLength;
  this.callback = callback;
};

MagnitudeSequencer.prototype.addMagnitude = function(mag, index) {
  this.frequencyIndex = this.frequencyIndex === -1 ? index : this.frequencyIndex;
  this.magSeries.push(mag);
  if (this.magSeries.length > this.maxLength) {
    // console.log(this.magSeries[0] - this.magSeries[1], this.magSeries);
    var average = this.magSeries.reduce(function(a, b) { return a + b; }, 0) / this.magSeries.length;
    this.callback(average, this.frequencyIndex);
    this.reset();
  }
};

MagnitudeSequencer.prototype.reset = function() {
  this.magSeries = [];
  this.frequencyIndex = -1;
};

MagnitudeSequencer.prototype.isOngoing = function() {
  return this.magSeries.length > 0;
};

MagnitudeSequencer.prototype.getMagnitudeIndex = function() {
  return this.frequencyIndex;
};

var NotePlayed = function(val, index, callback, cancel) {
  this.series = [val];
  this.index = index;
  this.callback = callback;
  this.cancel = cancel;
  this.maxLength = 4;
  console.log(this.series[0]);
};

NotePlayed.prototype.addMagnitude = function(val) {
  this.series.push(val);
  // console.log(val);
  if (this.series.length >= this.maxLength) {
    var pre = Math.max(this.series[0], this.series[1]);
    var post = Math.min(this.series[2], this.series[3]);
    // console.log('DIVIDE', pre / post);
    if ((pre / post > 3 && pre > 10000) || pre > 100000) {
      this.callback(this.index);
    } else {
      this.cancel();
    }
  }
};

NotePlayed.prototype.getIndex = function() {
  return this.index;
};

var Controller = function() {
  this.FREQUENCIES = Freq.getFrequencies();
  this.worker = new Worker(chrome.runtime.getURL('background_scripts/worker.js'))
  // This sequences all of the sounds from the microphone
  this.soundSequencer = new SoundSequencer(2048, this.processDataSeries.bind(this));
  // This sequences the note that MIGHT be played
  this.magSequencer = new MagnitudeSequencer(2, this.addMagnitude.bind(this));
  // This is the class that checks if there's a note played or if it's just noise
  this.notePlayed = null;
  // Don't want to repeat the same note
  this.lastPlayedIndex = -1;
  this.currentTabId = -1;
  this.currentPort = null;
};

Controller.prototype.subscribe = function(tabId, port) {
  // console.log(tabId);
  this.currentTabId = tabId;
  this.currentPort = port;
}

Controller.prototype.addMagnitude = function(mag, index) {
  if (this.notePlayed) {
    // console.debug('DEBUG', mag);
    this.notePlayed.addMagnitude(mag);
  } else {
    this.notePlayed = new NotePlayed(mag, index, this.callNote.bind(this), this.cancelNotePlayed.bind(this));
  }
};

Controller.prototype.cancelNotePlayed = function() {
  console.log('Cancelled the note');
  this.notePlayed = null;
};

Controller.prototype.callNote = function(index) {
  this.notePlayed = null;
  if (index === this.lastPlayedIndex) {
    return;
  }
  console.log(this.FREQUENCIES[index]);
  if (this.currentPort) {
    this.currentPort.postMessage(this.FREQUENCIES[index]);
    this.lastPlayedIndex = index;
  }
};

Controller.prototype.processDataSeries = function(data) {
  this.worker.postMessage(data);
};

Controller.prototype.onWorkerMessage = function(event) {
  var magnitudes = event.data;
  if (this.magSequencer.isOngoing() || this.notePlayed) {
    var index = this.magSequencer.getMagnitudeIndex();
    if (this.notePlayed) {
      index = this.notePlayed.getIndex();
    }
    // console.log('fuk', magnitudes[index]);
    this.magSequencer.addMagnitude(magnitudes[index]);
    return;
  }

  var maxMagnitude = 0;
  var maxMagnitudeIndex = -1;

  for (var i = 0; i < magnitudes.length; i++) {
    if (magnitudes[i] > maxMagnitude) {
      maxMagnitudeIndex = i;
      maxMagnitude = magnitudes[i];
    }
  }

  if (maxMagnitude > 2000) {
    this.magSequencer.addMagnitude(maxMagnitude, maxMagnitudeIndex);
  }

};

Controller.prototype.handleUserMedia = function(stream) {
  // Declare some useful variables
  var audioContext = new AudioContext();
  var scriptProcessor = audioContext.createScriptProcessor(256, 1, 1);
  var mic = audioContext.createMediaStreamSource(stream);
  this.worker.postMessage({
    'init': {
      'frequencies': this.FREQUENCIES,
      'sampleRate': audioContext.sampleRate,
    }
  });

  // Connect the streams
  scriptProcessor.connect(audioContext.destination);
  mic.connect(scriptProcessor);

  // Setup event listeners
  this.worker.addEventListener('message', this.onWorkerMessage.bind(this));
  scriptProcessor.onaudioprocess = this.onAudioProcess.bind(this);
};

Controller.prototype.onAudioProcess = function(event) {
  var data = event.inputBuffer.getChannelData(0);
  this.soundSequencer.addSeries(data);
};

Controller.prototype.start = function() {
  navigator.getUserMedia({audio: true}, this.handleUserMedia.bind(this), function(e) {
    console.log('Error!');
  });
};


var Controller = new Controller();
Controller.start();

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === 'keytar');
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function(tabId) {
    // Only one subscription at a time, replaces previous one
    Controller.subscribe(tabId, port);
  });
});
