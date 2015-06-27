navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;
navigator.getUserMedia({audio: true}, function(stream) {
}, function() {
  console.log('Error!');
});
