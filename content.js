// global variables
var initialized = false,
  active = false;
  activeColumn = 0,
  port = chrome.runtime.connect({name: 'keytar'});;

// DOM elements
var $keyboard,
  $text,
  $pitch;

port.onMessage.addListener(function(msg) {
  if (!active) return;
  console.log('got ' + msg.note);
  playNote(msg.note);
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

function playNote(note) {
  if (!active) return;
  $pitch.html(note);
  $text.val($text.val() + 'c');
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
