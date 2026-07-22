const fs = require('fs');
const c = fs.readFileSync('src/data/services.ts', 'utf8');
const generateSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const slugs = new Set();
const regex = /\"([^\"]+)\"/g;
let match;
while ((match = regex.exec(c)) !== null) {
  slugs.add(generateSlug(match[1]));
}

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
  });
  return results;
};

const files = walk('src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // find <Link to="/services/.../..."> and <a href="/services/.../...">
  const linkRegex = /to=[\"'](\/services\/[^\/]+\/([^\/\"'\#]+))[\"']/g;
  let m;
  while ((m = linkRegex.exec(content)) !== null) {
    if (!slugs.has(m[2])) {
      console.log('BROKEN LINK in', file, '=>', m[1]);
    }
  }
  const aRegex = /href=[\"'](\/services\/[^\/]+\/([^\/\"'\#]+))[\"']/g;
  while ((m = aRegex.exec(content)) !== null) {
    if (!slugs.has(m[2])) {
      console.log('BROKEN LINK in', file, '=>', m[1]);
    }
  }
});
