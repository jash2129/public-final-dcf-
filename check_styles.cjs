const fs = require('fs');
['src/pages/PrivacyPolicy.tsx', 'src/pages/TermsOfService.tsx', 'src/pages/RefundPolicy.tsx', 'src/pages/ItrLandingPage.tsx', 'src/pages/ItrLandingPageB.tsx'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('style={{') || c.includes('style=')) {
    console.log(f, 'has inline styles');
  }
});
