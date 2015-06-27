var $keyboard = $('.kt-keyboard');

$(document).ready(function () {
  $('.kt-keyboard').addClass('active');
  activateColumn(2);
  activateColumn(3);
});

function toggleKeyboard() {
  if ($keyboard.hasClass('active')) {
    $keyboard.removeClass('active');
  } else {
    $keyboard.addClass('active');
  }
}

function activateColumn(column) {
  $('.kt-column').removeClass('active');
  $('.kt-column:eq('+column+')').addClass('active');
}
