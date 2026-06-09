export const serviceCategories = [
  {
    title: "Startup",
    slug: "startup",
    services: [
      "Proprietorship Registration",
      "Partnership Firm Registration",
      "One Person Company (OPC) Registration",
      "Limited Liability Partnership (LLP) Registration",
      "Private Limited Company Registration",
      "Section 8 Company Registration",
      "Trust Registration",
      "Public Limited Company Registration",
      "Producer Company Registration",
      "Indian Subsidiary Registration",
      "Nidhi Company Registration"
    ]
  },
  {
    title: "Registrations",
    slug: "registrations",
    services: [
      "GST Registration",
      "GST Registration for Foreigners",
      "MSME/Udyam Registration",
      "Import Export Code (IEC) Registration",
      "Shop & Establishment License Registration",
      "Trade License",
      "Professional Tax Registration",
      "PF Registration",
      "ESI Registration",
      "ICEGATE Registration",
      "Barcode Registration",
      "RCMC Registration",
      "Darpan Registration",
      "FSSAI License / Food License Registration",
      "FSSAI Food Product Approval",
      "Drug License",
      "Fire License / NOC",
      "Halal Certification",
      "ISO Certification"
    ]
  },
  {
    title: "Trademark",
    slug: "trademark",
    services: [
      "Trademark Registration (Indian)",
      "International Trademark Registration",
      "Expedited Trademark Registration",
      "Trademark Search",
      "Trademark Objection Reply",
      "Trademark Opposition",
      "Trademark Renewal",
      "Trademark Assignment / Transfer",
      "Trademark Infringement Notice",
      "Copyright Registration",
      "Patent Registration",
      "Design Registration"
    ]
  },
  {
    title: "GST",
    slug: "gst",
    services: [
      "GST Registration",
      "GST Cancellation",
      "GST Amendment",
      "GST LUT Form Filing",
      "GST Monthly Return Filing",
      "GST Quarterly Return Filing",
      "GST Annual Return Filing",
      "GST Nil Return Filing",
      "GST Refund Filing",
      "GST Invoicing and Filing Software",
      "GST Software for Accountants",
      "GST Notice Handling",
      "GST Audit Assistance"
    ]
  },
  {
    title: "Income Tax",
    slug: "income-tax",
    services: [
      "Individual ITR Filing",
      "Business ITR Filing",
      "Tax Notice Handling",
      "15CA / 15CB Form Filing",
      "Income Tax e-Filing",
      "TDS Return Filing",
      "Form 16 Generation"
    ]
  },
  {
    title: "MCA",
    slug: "mca",
    services: [
      "Annual ROC Filing",
      "Annual Return Filing",
      "DIR-3 KYC / DIN eKYC Filing",
      "MCA Form Filings",
      "Director Appointment / Resignation",
      "Share Transfer",
      "Address Change",
      "Name Change - Company",
      "Authorized Capital Increase",
      "MOA Amendment",
      "AOA Amendment",
      "Object Clause Change",
      "LLP Form Filings",
      "LLP Agreement Drafting",
      "LLP Annual Filing",
      "Company Strike Off",
      "LLP Closure / Winding Up"
    ]
  },
  {
    title: "Compliance",
    slug: "compliance",
    services: [
      "Company Compliance Calendar & Alerts",
      "Company Compliance Software / Management",
      "RBI Compliance Filings",
      "FEMA Compliance",
      "Board Meeting Minutes",
      "AGM Preparation",
      "Statutory Register Maintenance",
      "Bookkeeping Services",
      "Financial Statement Preparation",
      "Invoice Management & Reconciliation",
      "Accounting Software Integration",
      "Payroll Processing",
      "HR & Payroll Management",
      "Employee Attendance Tracking",
      "PF / ESI Calculations & Returns"
    ]
  },
  {
    title: "Finance",
    slug: "finance",
    services: [
      "Loans",
      "Insurance",
      "Mutual Fund"
    ]
  },
  {
    title: "Global",
    slug: "global",
    services: [
      "USA Company Registration",
      "UAE Company Registration",
      "UAE Ecommerce Setup",
      "UAE Embassy Attestation",
      "Foreign Subsidiary Setup",
      "UAE Services Platform"
    ]
  },
  {
    title: "More Services",
    slug: "more-services",
    services: [
      "Partnership Deed Drafting",
      "Shareholder Agreement",
      "Non-Disclosure Agreement",
      "Contract Drafting",
      "Legal Documentation",
      "Business Incorporation Advisory",
      "Tax Planning & Advisory",
      "Compliance Advisory",
      "Valuation Services",
      "Financial Training Services",
      "Franchise Consulting",
      "RERA Registration",
      "Property Valuation Services"
    ]
  }
];

export const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};
