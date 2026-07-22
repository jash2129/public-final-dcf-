const fs = require('fs');
const content = fs.readFileSync('src/components/layout/PublicLayout.tsx', 'utf8');
const linkRegex = /to=[\"']([^\"']+)[\"']/g;
let m;
while ((m = linkRegex.exec(content)) !== null) {
  console.log(m[1]);
}
