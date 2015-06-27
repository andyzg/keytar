self.getMagnitudes = function(data) {
  var sum = 0;
  var coefficient = 2 * Math.PI / self.sampleRate;
  return self.frequencies.map(function(f) {
    var real = 0;
    var imaginary = 0;
    var frequency = f.frequency;
    for (var i = 0;  i < data.length; i++) {
      // real + i * imaginary
      real += data[i] * Math.cos(coefficient * frequency * i);
      imaginary += data[i] * Math.sin(coefficient * frequency * i);
    }
    return real * real + imaginary * imaginary;
  });
};

self.onmessage = function(event) {
  // Sketchy way to initialize constants here
  if ('init' in event.data) {
    for (var i in event.data.init) {
      self[i] = event.data.init[i];
    }
    return;
  }
  self.postMessage(self.getMagnitudes(event.data));
};
