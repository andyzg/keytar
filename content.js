var ktActive = false;
var ktForm;

$('input, textarea').on('click', function () {
  ktForm = $(document.activeElement);
  console.log(ktForm);
  ktForm.val(ktForm.val() + 'O');
});

function toggleKeyboard() {
  
}
