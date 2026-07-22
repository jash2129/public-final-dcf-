const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

if (!c.includes('React, { Suspense, lazy }')) {
  c = c.replace('import { BrowserRouter', 'import React, { Suspense, lazy } from \'react\';\nimport { BrowserRouter');
}

const importsToReplace = [
  'Home', 'ServicePage', 'ServicesCatalog', 'Login', 'Register', 'ForgotPassword', 'ResetPassword', 'CompleteProfile',
  'DashboardOverview', 'DashboardOrders', 'DashboardDocuments', 'DashboardCompliance', 'DashboardInvoices', 'DashboardSettings',
  'Blog', 'BlogPostDetail', 'Careers', 'Contact', 'PrivacyPolicy', 'TermsOfService', 'RefundPolicy', 'NotFound',
  'AdminOverview', 'AdminOrders', 'AdminCompliance', 'ManageAdmins', 'AdminDocuments', 'ActivityLog', 'AdminServices', 'AdminCoupons', 'UserDetail',
  'About', 'GSTCalculator', 'ComplianceCalendar', 'ItrLandingPage', 'ItrLandingPageB'
];

c = c.replace(/import (\w+) from '\.\/pages\/(.*?)';/g, (match, p1, p2) => {
  if (importsToReplace.includes(p1)) {
    return `const ${p1} = lazy(() => import('./pages/${p2}'));`;
  }
  return match;
});

if (!c.includes('<Suspense')) {
  c = c.replace('<Routes>', '<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>}>\n          <Routes>');
  c = c.replace('</Routes>', '</Routes>\n          </Suspense>');
}

fs.writeFileSync('src/App.tsx', c);
console.log('App.tsx updated for lazy loading');
