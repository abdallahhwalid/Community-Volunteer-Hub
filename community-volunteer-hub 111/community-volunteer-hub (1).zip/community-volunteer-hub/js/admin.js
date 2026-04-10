// ADMIN PAGE JAVASCRIPT

// Filter table rows by search input
function filterTable(tableId, searchVal) {
  const val = searchVal.toLowerCase();
  const rows = document.querySelectorAll('#' + tableId + ' tbody tr');
  rows.forEach(function(row) {
    row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
  });
}

// Remove a row (delete/suspend)
function removeRow(btn) {
  const action = btn.textContent;
  if (confirm('Are you sure you want to ' + action.toLowerCase() + ' this entry?')) {
    btn.closest('tr').style.opacity = '0.4';
    btn.closest('tr').style.pointerEvents = 'none';
  }
}
