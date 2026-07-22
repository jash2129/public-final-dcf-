const fs = require('fs');
const https = require('https');

async function crawl() {
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  
  console.log(`Found ${urls.length} URLs. Crawling production site with delay...`);
  
  let results = [];
  
  for (let i = 0; i < urls.length; i++) {
    const urlStr = urls[i];
    
    await new Promise((resolve) => {
      const req = https.get(urlStr, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      }, (res) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          results.push({ url: urlStr, status: res.statusCode });
          console.log(`[${res.statusCode}] ${urlStr}`);
        } else {
          console.log(`[${res.statusCode}] ${urlStr}`);
        }
        res.resume();
        res.on('end', resolve);
      });
      req.on('error', (e) => {
        results.push({ url: urlStr, status: 'Error: ' + e.message });
        resolve();
      });
    });
    
    // Wait 500ms between requests to avoid 429
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\nFound ${results.length} URLs with 4xx errors:`);
  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync('crawl-results.json', JSON.stringify(results, null, 2));
}

crawl();
