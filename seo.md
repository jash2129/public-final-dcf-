
# SEO AUDIT – PENDING ISSUES & VERIFICATION

**Deccan Filings** | [deccanfilings.com](https://deccanfilings.com) | Audit dated 21 July 2026

## Purpose

This document is based on the SEO audit report shared with the development team. The points below should be checked against the implemented fixes and verified through a fresh crawl.

---

## 1. Crawlability, URLs & Sitemap

| Issue | Audit Finding | Required Check |
| --- | --- | --- |
| **4xx client errors** | 53 pages returned 4xx errors. | Identify the exact broken URLs and fix the source links or correctly return 404 where the page does not exist. |
| **4xx URLs in XML sitemap** | 6 sitemap URLs returned 4xx errors. | Remove invalid URLs from the sitemap or restore the pages with a valid 200 response. |
| **429 responses** | Several important URLs returned 429 Too Many Requests during the crawl. | Re-crawl and confirm important pages return 200 consistently to search engine crawlers. |
| **Orphan URLs** | 6 pages were found only through the sitemap and had no internal links. | Add relevant internal links to these pages or review whether they should remain indexable. |

---

## 2. On-Page SEO & Page Structure

| Issue | Audit Finding | Required Check |
| --- | --- | --- |
| **Missing Title** | 2 pages have no title tag. | Add a unique, relevant title tag to each affected page. |
| **Missing H1** | 2 pages have no H1. | Add one clear, unique primary H1 to each affected page. |
| **Missing Meta Description** | 2 pages have no meta description. | Add unique descriptions relevant to the page content. |
| **Missing H2** | 2 pages have no H2. | Add proper section headings where required. |
| **Broken heading hierarchy** | 3 pages skip heading levels. | Maintain a logical H1 → H2 → H3 structure. |
| **Duplicate headings** | 1 page has identical heading elements. | Review and make headings unique and meaningful. |
| **Missing canonical** | 2 pages have no canonical tag. | Add the correct canonical URL to prevent duplicate URL signals. |
| **Low content** | 2 pages contain fewer than 50 words. | Review whether the pages need useful, service-relevant content. |

---

## 3. Internal Linking

| Issue | Audit Finding | Required Check |
| --- | --- | --- |
| **Broken internal links** | 3 pages link to 4xx pages. | Update or remove the broken internal links. |
| **No outgoing links** | 2 pages have no outgoing internal links. | Add relevant internal links where appropriate. |
| **Low internal backlinks** | 5 pages have fewer than 10 internal backlinks. | Add relevant contextual links from related pages. |
| **Repeated / weak anchor text** | Some links use identical or one-word anchor text. | Use descriptive and varied anchor text relevant to the destination page. |
| **Excessive internal links** | 3 pages contain more than 100 internal links. | Review unnecessary or repetitive links and keep navigation useful. |

---

## 4. Performance, Social & Technical

| Issue | Audit Finding | Required Check |
| --- | --- | --- |
| **Mobile performance** | Homepage Mobile PageSpeed score: 28/100. | Re-test after optimization and confirm measurable improvement. |
| **Desktop performance** | Homepage Desktop PageSpeed score: 61/100. | Review remaining performance bottlenecks. |
| **Image formats** | 3 pages use older image formats. | Convert suitable images to WebP or AVIF and verify quality. |
| **Twitter Card** | 5 pages have incomplete Twitter Card data. | Complete the required social metadata. |
| **Social links** | Homepage had no links to social media pages. | Verify official social links are present and working. |
| **Multiple GTM codes** | 5 pages contain more than one Google Tag Manager code. | Confirm only the required GTM container is loaded once per page. |
| **Inline styles** | 5 pages contain style attributes. | Review whether these can be cleaned up without affecting the design. |
| **HTTP W3C links** | 3 pages contain HTTP links to www.w3.org. | Change to HTTPS. |
| **Robots.txt** | 2 URLs were disallowed by robots.txt. | Confirm these URLs are intentionally blocked and not important SEO pages. |

---

## 5. Pages Specifically Flagged in the Audit

The following URLs were specifically shown in the audit as returning 429 responses during the crawl and should be rechecked after the implementation changes:

* `[https://deccanfilings.com/blog/12](https://deccanfilings.com/blog/12)`
* `[https://deccanfilings.com/tools/gst-calculator](https://deccanfilings.com/tools/gst-calculator)`
* `[https://deccanfilings.com/blog/6](https://deccanfilings.com/blog/6)`
* `[https://deccanfilings.com/services/license/iso-certification](https://deccanfilings.com/services/license/iso-certification)`
* `[https://deccanfilings.com/services/gst/gst-quarterly-return-filing](https://deccanfilings.com/services/gst/gst-quarterly-return-filing)`
* `[https://deccanfilings.com/services/trademark/trademark-opposition](https://deccanfilings.com/services/trademark/trademark-opposition)`
* `[https://deccanfilings.com/services](https://deccanfilings.com/services)`
* `[https://deccanfilings.com/contact](https://deccanfilings.com/contact)`
* `[https://deccanfilings.com/services/gst/gst-registration](https://deccanfilings.com/services/gst/gst-registration)`
* `[https://deccanfilings.com/services/startup-registrations/private-limited-company-registration](https://deccanfilings.com/services/startup-registrations/private-limited-company-registration)`

---

## Message to Development Team

> Hi Team,
> I reviewed the SEO audit report dated 21 July 2026. Please review the attached issue list against the fixes implemented from your side. After the changes are deployed, please confirm the exact affected URLs that were fixed and run a fresh crawl so we can compare the results with the previous audit.
> In particular, please verify the 4xx/429 responses, XML sitemap URLs, missing meta elements, canonical tags, heading structure, internal links, duplicate GTM codes, and homepage performance.

---

**Source:** Site Audit report for deccanfilings.com, dated 21 July 2026.