const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove scripts from head
const headScripts = [
  /<script>\(function \(w, d, s, l, i\) \{[\s\S]*?GTM-TKFNDJC7'\);<\/script>/,
  /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-18261666141"><\/script>/,
  /<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];[\s\S]*?gtag\('config', 'AW-18261666141'\);\s*<\/script>/,
  /<script src="https:\/\/checkout\.razorpay\.com\/v1\/checkout\.js"><\/script>/
];

const extracted = [];
headScripts.forEach((regex, i) => {
  const match = html.match(regex);
  if (match) {
    extracted.push(match[0]);
    html = html.replace(regex, '');
  } else {
    extracted.push('');
    console.log('Missed script index', i);
  }
});

// Remove comments from head
html = html.replace(/<!-- Google Tag Manager -->/g, '');
html = html.replace(/<!-- End Google Tag Manager -->/g, '');
html = html.replace(/<!-- Google tag \(gtag\.js\) — must be first in <head> for full signal coverage -->/g, '');
html = html.replace(/<!-- Razorpay Checkout Integration -->/g, '');

// Insert before </body>
const deferScripts = `
  <!-- Deferred Analytics and Integrations -->
  <!-- Google Tag Manager -->
  ${extracted[0] || ''}
  <!-- End Google Tag Manager -->
  <!-- Google tag (gtag.js) -->
  ${extracted[1] || ''}
  ${extracted[2] || ''}
  <!-- Razorpay Checkout Integration -->
  ${extracted[3] ? extracted[3].replace('<script', '<script defer') : ''}
`;

html = html.replace('</body>', deferScripts + '\n</body>');

fs.writeFileSync('index.html', html);
console.log('index.html updated for deferred scripts');
