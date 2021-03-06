// global variables
var initialized = false,
  active = false;
  activeColumn = -1,
  port = chrome.runtime.connect({name: 'keytar'});;

// DOM elements
var $keyboard,
  $text,
  $pitch;

var KEY_NOTE_MAPPINGS = {
  'F4': {
    'G#3': 'Z',
    'A3': 'X',
    'C4': 'A',
    'C#4': 'S',
    'F4': 'Q',
    'F#4': 'W',
  },
  'F#4': {
    'A4': 'C',
    'A#4': 'V',
    'C#4': 'D',
    'D4': 'F',
    'D5': 'F',
    'F#4': 'E',
    'G4': 'R',
  },
  'G4': {
    'A#4': 'B',
    'B4': 'N',
    'D4': 'G',
    'D5': 'G',
    'D#5': 'H',
    'D#4': 'H',
    'G4': 'T',
    'G#4': 'Y',
  },
  'G#4': {
    'B4': 'M',
    'C4': ',',
    'D#4': 'J',
    'D#5': 'J',
    'E4': 'K',
    'G#4': 'U',
    'A5': 'I',
  },
  'A5': {
    'C4': '.',
    'C#4': '/',
    'E4': 'L',
    'F4': ';',
    'A5': 'O',
    'A#5': 'P',
  },
  'D#3': ' ',
  'E3': ' ',
  'F3': ' ',
  'F#3': 'bs',
  'G3': 'bs'
};

var KeyboardState = function(callback) {
  this.typeKey = callback;
  this.options = KEY_NOTE_MAPPINGS;
};

KeyboardState.prototype.reset = function() {
  this.options = KEY_NOTE_MAPPINGS;
  activeColumn = 0;
  activateColumn(activeColumn);
};

KeyboardState.prototype.addNote = function(note) {
  // if ('./,;'.indexOf(this.options) > -1) {
  //   this.reset();
  //   return;
  // }
  if (!(note in this.options)) {
    if (KEY_NOTE_MAPPINGS[note] === 'bs') {
      this.reset();
    }
    return;
  }

  this.options = this.options[note];
  if (typeof this.options === 'string') {
    this.typeKey(this.options);
    this.reset();
  } else {
    switch (note) {
      case 'F4':
        activeColumn = 1;
        break;
      case 'F#4':
        activeColumn = 2;
        break;
      case 'G4':
        activeColumn = 3;
        break;
      case 'G#4':
        activeColumn = 4;
        break;
      case 'A5':
        activeColumn = 5;
        break;
    }
    activateColumn(activeColumn);
  }
};

var keyboardState = new KeyboardState(typeChar);
port.onMessage.addListener(function(msg) {
  console.log('got' + msg.note);
  if ($pitch) {
    $pitch.text(msg.note);
  }
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
  $('.kt-column').removeClass('active');
  if (column == 0) return;
  $('.kt-column:eq('+(column-1)+')').addClass('active');
}

function animateCharacter(charTyped) {
  if ('./,;'.indexOf(charTyped) > -1) {
    return;
  } else {
    console.log('wtf', charTyped);
  }
  var $charBox = $('#kt-' + charTyped);
  console.log($charBox);
  $charBox.find('svg').remove();
  var cx = $($charBox).width() / 2;
  var cy = $($charBox).height() / 2;
  $charBox.append('<svg class="kt-touch"><circle cx="' + cx + '" cy="' + cy + '" r="' + 0 + '" fill="#fff"></circle></svg>');
  console.log(cx, cy);
  setTimeout(function() {
    var $circle = $($charBox).find('circle');
    $circle.animate({
      r: $($charBox).width(),
      opacity: 0.0
    }, {
      easing: 'easeOutQuad',
      duration: 400,
      complete: function() {
      }
    });
  });
}

function typeChar(charTyped) {
  if (!initialized) return;
  if (charTyped === 'bs') {
    $text.text($text.text().slice(0, $text.text().length - 1));
  } else {
    animateCharacter(charTyped);
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
      $char.id = 'kt-' + letter;
      $column.appendChild($char);
    });
    $columns.appendChild($column);
  });

  $keyWrap.appendChild($spacebar);
  $keyWrap.appendChild($backspace);
  $('body').append($container);
}
