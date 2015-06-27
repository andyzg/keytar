// global variables
var initialized = false,
  active = false;
  activeColumn = 0,
  port = chrome.runtime.connect({name: 'keytar'});;

// DOM elements
var $keyboard,
  $text,
  $pitch;

var KEY_NOTE_MAPPINGS = {
  'E4': {
    'G3': 'Z',
    'G#3': 'X',
    'B4': 'A',
    'C4': 'S',
    'E4': 'Q',
    'F4': 'W',
  },
  'F4': {
    'G#3': 'C',
    'A4': 'V',
    'C4': 'D',
    'C#4': 'F',
    'F4': 'E',
    'F#4': 'R',
  },
  'F#4': {
    'A4': 'B',
    'A#4': 'N',
    'C#4': 'G',
    'D4': 'H',
    'F#4': 'T',
    'G4': 'Y',
  },
  'G4': {
    'A#4': 'M',
    'B4': ',',
    'D4': 'J',
    'D#4': 'K',
    'G4': 'U',
    'G#4': 'I',
  },
  'G#4': {
    'B4': '.',
    'C4': '/',
    'D#4': 'L',
    'E4': ';',
    'G#4': 'O',
    'A5': 'P',
  },
  'D3': ' ',
  'D#3': ' ',
  'E3': ' ',
  'F3': 'bs',
  'F#3': 'bs'
};

var KeyboardState = function(callback) {
  this.typeKey = callback;
  this.options = KEY_NOTE_MAPPINGS;
};

KeyboardState.prototype.addNote = function(note) {
  if (!(note in this.options)) {
    return;
  }
  this.options = this.options[note];
  console.log('OPTIONS:', this.options);
  if (typeof this.options === 'string') {
    this.typeKey(this.options);
    this.options = KEY_NOTE_MAPPINGS;
    activeColumn = 0;
    activateColumn(activeColumn);
  } else {
    switch (note) {
      case 'E4':
        activeColumn = 1;
        break;
      case 'F4':
        activeColumn = 2;
        break;
      case 'F#4':
        activeColumn = 3;
        break;
      case 'G4':
        activeColumn = 4;
        break;
      case 'G#4':
        activeColumn = 5;
        break;
    }
    activateColumn(activeColumn);
  }
};

var keyboardState = new KeyboardState(playNote);
port.onMessage.addListener(function(msg) {
  console.log('got' + msg.note);
  keyboardState.addNote(msg.note);
});

loadStyle();
loadKeyboard();
$(document).ready(function () {
  $keyboard = $('.kt-keyboard');
  $pitch = $('.kt-active-pitch p');
  $('textarea, input, .tweet-box, [role="textbox"]').focus(function () {
    toggleKeyboard(true);
    $text = $(this);
  }).blur(function () {
    toggleKeyboard(false);
  });
});

function toggleKeyboard(activate) {
  if (!initialized) return;
  active = activate;
  if (activate) {
    $keyboard.addClass('active');
  } else {
    $keyboard.removeClass('active');
  }
}

function activateColumn(column) {
  if (!active) return;
  activeColumn = column;
  if (column == 0) return;
  $('.kt-column').removeClass('active');
  $('.kt-column:eq('+(column-1)+')').addClass('active');
}

function playNote(charTyped) {
  if (!initialized) return;
  if (charTyped === 'bs') {
    $text.html($text.text().splice(0, $text.text().length - 1));
  } else {
    $text.html($text.text() + charTyped);
  }
}

function loadStyle() {
  var link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css?family=Roboto';
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.getElementsByTagName('head')[0].appendChild(link);
}

function loadKeyboard() {
  if (initialized) return;
  initialized = true;

  var $container = document.createElement('div'),
    $activePitch = document.createElement('div'),
    $keyWrap = document.createElement('div'),
    $strings = document.createElement('div'),
    $columns = document.createElement('div'),
    $spacebar = document.createElement('div'),
    $backspace = document.createElement('div');

  $container.classList.add('kt-keyboard');
  $activePitch.classList.add('kt-active-pitch');
  $keyWrap.classList.add('kt-keywrap');
  $strings.classList.add('kt-strings');
  $columns.classList.add('kt-columns');
  $spacebar.classList.add('kt-char', 'bottom', 'spacebar');
  $backspace.classList.add('kt-char', 'bottom', 'backspace');

  $container.appendChild($activePitch);
  var pitch = document.createElement('p');
  pitch.textContent = '-';
  $activePitch.appendChild(pitch);

  $container.appendChild($keyWrap);

  $keyWrap.appendChild($strings);
  ['E4', 'B4', 'G3'].forEach(function (note) {
    var $note = document.createElement('div');
    var $p = document.createElement('p');
    $note.classList.add('kt-note');
    $p.textContent = note;
    $note.appendChild($p);
    $strings.appendChild($note);
  });

  $keyWrap.appendChild($columns);
  var keyChars = [
    ['Q','W','A','S','Z','X'],
    ['E','R','D','F','C','V'],
    ['T','Y','G','H','B','N'],
    ['U','I','J','K','M',','],
    ['O','P','L',';','.','/']
  ];
  keyChars.forEach(function (letters) {
    var $column = document.createElement('div');
    $column.classList.add('kt-column');
    letters.forEach(function (letter) {
      var $char = document.createElement('div');
      var $p = document.createElement('p');
      $char.classList.add('kt-char');
      $p.textContent = letter;
      $char.appendChild($p);
      $column.appendChild($char);
    });
    $columns.appendChild($column);
  });

  $keyWrap.appendChild($spacebar);
  $keyWrap.appendChild($backspace);
  $('body').append($container);
}
