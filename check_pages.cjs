const fs = require('fs');
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
const files = walk('src/pages');
const links = [];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const linkRegex = /<Link[^>]+to=[\"']([^\"']+)[\"']/g;
  let m;
  while ((m = linkRegex.exec(content)) !== null) {
    links.push({ file, link: m[1] });
  }
  const aRegex = /<a[^>]+href=[\"'](\/[^\"']+)[\"']/g;
  while ((m = aRegex.exec(content)) !== null) {
    links.push({ file, link: m[1] });
  }
});

const routes = [
  '/',
  '/services',
  '/services/:category/:slug',
  '/tools/compliance-calendar',
  '/tools',
  '/blog',
  '/blog/:id',
  '/about',
  '/careers',
  '/contact',
  '/privacy',
  '/terms',
  '/refund',
  '/itr-filing',
  '/itr-filing-b',
  '/login', '/register', '/forgot-password', '/reset-password', '/complete-profile'
];

links.forEach(({file, link}) => {
  let cleanLink = link.split('?')[0].split('#')[0];
  if (cleanLink === '') return;
  // check if cleanLink matches any route
  let matches = false;
  if (routes.includes(cleanLink)) matches = true;
  else if (cleanLink.startsWith('/services/')) matches = true; 
  else if (cleanLink.startsWith('/blog/')) matches = true;
  else if (cleanLink.startsWith('/admin/')) matches = true;
  else if (cleanLink.startsWith('/dashboard/')) matches = true;

  if (!matches) console.log(file, '=>', link);
});
