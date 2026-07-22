const fs = require('fs');
const content = fs.readFileSync('src/pages/ItrLandingPage.tsx', 'utf8');
const linkRegex = /to=[\"']([^\"']+)[\"']/g;
let m;
while ((m = linkRegex.exec(content)) !== null) {
  console.log('Link:', m[1]);
}
const aRegex = /href=[\"']([^\"']+)[\"']/g;
while ((m = aRegex.exec(content)) !== null) {
  console.log('Href:', m[1]);
}
const tempRegex = /to=\{?[`'"]([^`'"]+)[`'"]\}?/g;
while ((m = tempRegex.exec(content)) !== null) {
  console.log('TempLink:', m[1]);
}
