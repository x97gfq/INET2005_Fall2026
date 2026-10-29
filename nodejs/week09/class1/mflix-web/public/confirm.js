// Asks "are you sure?" before submitting any form with a data-confirm attribute:
//   <form method="POST" action="/movies/.../delete" data-confirm="Delete this movie?">
// A separate file because helmet's Content-Security-Policy blocks inline JavaScript
// (onsubmit="return confirm(...)" would simply not run). The page works without it -
// it's a safety catch, not a security check: the server still checks the role.
document.querySelectorAll('form[data-confirm]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    if (!window.confirm(form.dataset.confirm)) event.preventDefault();
  });
});
