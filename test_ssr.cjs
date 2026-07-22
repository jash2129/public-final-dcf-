const http = require('http');
http.get('http://localhost:3005/services/startup-registrations/private-limited-company-registration', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const titleMatch = data.match(/<title>.*?<\/title>/i);
    const descMatch = data.match(/<meta name="description" content=".*?" \/>/i);
    console.log('Title:', titleMatch ? titleMatch[0] : 'None');
    console.log('Desc:', descMatch ? descMatch[0] : 'None');
    process.exit(0);
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
