self.onmessage = function(event) {
  self.postMessage(processData(event.data));
};

self.processData = function(data) {
  var sum = 0;
  for (var i in data) {
    sum += data[i];
  }
  return sum;
}
