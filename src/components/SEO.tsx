import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
}

export default function SEO({ title, description, canonicalUrl }: SEOProps) {
  const location = useLocation();
  const siteName = "Deccan Filings";
  const defaultTitle = `${siteName} | Start & Grow Your Business in India`;
  const defaultDesc = "India's trusted compliance platform for Company Registration, GST, Trademark, and Tax Filings. 100% online expert CA/CS assistance for founders.";
  
  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDesc;
  // Generate absolute canonical URL dynamically based on current path
  const finalCanonical = canonicalUrl || `https://deccanfilings.com${location.pathname === '/' ? '' : location.pathname}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={finalCanonical} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://deccanfilings.com/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content="https://deccanfilings.com/og-image.jpg" />
    </Helmet>
  );
}
