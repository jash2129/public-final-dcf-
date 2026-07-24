export interface FooterLink {
  name: string;
  path: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterColumn {
  groups: FooterLinkGroup[];
}

export const footerNavigation: FooterColumn[] = [
  {
    groups: [
      {
        title: "Startup Registrations",
        links: [
          { name: "Private Limited Company", path: "/services/startup-registrations/private-limited-company-registration" },
          { name: "Limited Liability Partnership", path: "/services/startup-registrations/limited-liability-partnership-registration" },
          { name: "One Person Company", path: "/services/startup-registrations/one-person-company-registration" },
          { name: "Partnership Firm", path: "/services/startup-registrations/partnership-firm-registration" },
          { name: "Proprietorship Firm", path: "/services/startup-registrations/proprietorship-firm-registration" },
          { name: "Nidhi Company", path: "/services/startup-registrations/nidhi-company-registration" },
          { name: "Section 8 Company", path: "/services/startup-registrations/section-8-company-registration" }
        ]
      }
    ]
  },
  {
    groups: [
      {
        title: "Tax & GST",
        links: [
          { name: "GST Registration", path: "/services/gst/gst-registration" },
          { name: "GST Return Filing", path: "/services/gst/gst-return-filing" },
          { name: "Income Tax Return", path: "/itr-filing" },
          { name: "TDS Return Filing", path: "/services/income-tax/tds-return-filing" }
        ]
      },
      {
        title: "Intellectual Property",
        links: [
          { name: "Trademark Registration", path: "/services/trademark/trademark-registration-indian" },
          { name: "Copyright Registration", path: "/services/trademark/copyright-registration" },
          { name: "Trademark Objection", path: "/services/trademark/trademark-objection-reply" }
        ]
      }
    ]
  },
  {
    groups: [
      {
        title: "Company Compliance",
        links: [
          { name: "ROC Annual Filing", path: "/services/company-compliance/roc-annual-filing" },
          { name: "Director KYC", path: "/services/company-compliance/director-kyc-dir-3" },
          { name: "Add/Remove Director", path: "/services/company-compliance/add-or-remove-director" },
          { name: "Change Registered Office", path: "/services/company-compliance/change-registered-office" }
        ]
      },
      {
        title: "Business Licenses",
        links: [
          { name: "FSSAI Registration", path: "/services/license/fssai-registration" },
          { name: "Import Export Code", path: "/services/license/import-export-code" },
          { name: "MSME Registration", path: "/services/license/msme-registration" },
          { name: "Startup India", path: "/services/license/startup-india-registration" }
        ]
      }
    ]
  },
  {
    groups: [
      {
        title: "Company",
        links: [
          { name: "About Us", path: "/about" },
          { name: "Careers", path: "/careers" },
          { name: "Contact", path: "/contact" },
          { name: "All Services", path: "/services" }
        ]
      },
      {
        title: "Resources",
        links: [
          { name: "Blog", path: "/blog" },
          { name: "GST Calculator", path: "/tools/gst-calculator" }
        ]
      }
    ]
  }
];
