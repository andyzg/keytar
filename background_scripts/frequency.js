var Freq = (function() {

  var BASE_FREQUENCY = 65.41; // Frequency for C2 in Hz
  var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var BASE_OCTAVE = 2;

  var FrequencyStore = function() {
    self.frequencies = [];
    for (var i = 0; i < 40; i++) {
      var note = NOTES[i % 12];
      var baseOctave = Math.floor((i + 3) / 12) + BASE_OCTAVE;
      var frequency = BASE_FREQUENCY * Math.pow(2, i/12);
      self.frequencies.push({
        'note': note + baseOctave.toString(),
        'frequency': frequency
      });
    }
  };

  FrequencyStore.prototype.getFrequencies = function() {
    return self.frequencies;
  };

  var store = new FrequencyStore();

  var Freq = {};
  Freq.getFrequencies = function() {
    return store.getFrequencies();
  };

  return Freq;

})();
