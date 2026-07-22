const https = require('https');
const fs = require('fs');

async function checkLiveSitemap() {
  console.log('Fetching live sitemap...');
  
  const sitemapXml = await new Promise((resolve, reject) => {
    https.get('https://deccanfilings.com/sitemap.xml', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
  
  const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  console.log(`Found ${urls.length} URLs in live sitemap.`);
  
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
  fs.writeFileSync('live-crawl-results.json', JSON.stringify(results, null, 2));
}

checkLiveSitemap();
