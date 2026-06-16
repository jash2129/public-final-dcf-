export const serviceCategories = [
  {
    title: "Start up Registrations",
    slug: "start-up-registrations",
    services: [
      "Proprietorship Registration",
      "Partnership Firm Registration",
      "One Person Company (OPC) Registration",
      "Limited Liability Partnership (LLP) Registration",
      "Private Limited Company Registration",
      "Section 8 Company Registration",
      "Trust Registration",
      "Society Registration",
      "Producer Company Registration",
      "Indian Subsidiary Registration",
      "Nidhi Company Registration",
      "Foreign Company Registration",
      "Public Limited Company registration"
    ]
  },
  {
    title: "License",
    slug: "license",
    services: [
      "Startup India",
      "Factory Pollution",
      "MSME/Udyam Registration",
      "Trade License",
      "FSSAI License / Food License Registration",
      "Labour license",
      "ISO Certification",
      "Import Export Code (IEC) Registration",
      "Shop & Establishment License Registration",
      "Professional Tax Registration",
      "PF Registration",
      "ESI Registration",
      "ICEGATE Registration",
      "Barcode Registration",
      "RCMC Registration",
      "Darpan Registration",
      "FSSAI Food Product Approval",
      "Drug License",
      "Fire License / NOC",
      "Halal Certification"
    ]
  },
  {
    title: "Income Tax",
    slug: "income-tax",
    services: [
      "Tax Audit",
      "Individual ITR Filing",
      "Business ITR Filing",
      "Tax Notice Handling",
      "15CA / 15CB Form Filing",
      "Company e-Taxing (Formerly Income Tax e-Filing)",
      "TDS Return Filing",
      "Form 16 Generation",
      "Lower TDS Certificate"
    ]
  },
  {
    title: "GST",
    slug: "gst",
    services: [
      "GST Registration",
      "GST Registration for Foreigners",
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
      "MCA/ROC Registration",
      "GST Compliance",
      "TDS Compliance",
      "PF/ESI Compliance",
      "PT Compliance",
      "Annual Returns",
      "Accounting & Bookkeeping",
      "Financial Statements preparation",
      "Payroll Processing",
      "FEMA Compliance",
      "RBI Compliances filings",
      "AGM Preparation",
      "Statutory Register Maintenance",
      "Company ComplianceCalendar & alerts",
      "Company compliance Software/management",
      "Invoice Management & Reconciliation",
      "Accounting Software Integration",
      "Board meetings Minutes",
      "HR & Payroll Management",
      "Employee Attendance Tracking",
      "PF / ESI Calculations & Returns"
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
      "Us accounting",
      "us taxation"
    ]
  }
];

export const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};
