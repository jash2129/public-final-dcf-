export interface ComplianceDay {
  day: number;
  task: string;
  type: 'gst' | 'tds' | 'payroll' | 'statutory' | 'holiday' | 'working' | 'other';
}

export interface ComplianceMonth {
  name: string;
  days: ComplianceDay[];
}

export const complianceCalendar2026: ComplianceMonth[] = [
  {
    name: "January",
    days: [
      { day: 1, task: "New Year", type: "holiday" },
      { day: 4, task: "GSTR-1", type: "gst" },
      { day: 5, task: "GSTR-1", type: "gst" },
      { day: 6, task: "GSTR-1", type: "gst" },
      { day: 7, task: "TDS", type: "tds" },
      { day: 8, task: "GSTR-1", type: "gst" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 10, task: "Holiday", type: "holiday" },
      { day: 13, task: "Bogi", type: "holiday" },
      { day: 14, task: "Q-GSTR1", type: "gst" },
      { day: 15, task: "Pongal", type: "holiday" },
      { day: 16, task: "Kanuma ESI&PF", type: "payroll" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 21, task: "GSTR-3B", type: "gst" },
      { day: 22, task: "GSTR-3B", type: "gst" },
      { day: 23, task: "Q-GSTR3B", type: "gst" },
      { day: 26, task: "Republic Day", type: "holiday" }
    ]
  },
  {
    name: "February",
    days: [
      { day: 1, task: "GSTR-1", type: "gst" },
      { day: 2, task: "GSTR-1", type: "gst" },
      { day: 3, task: "GSTR-1", type: "gst" },
      { day: 4, task: "TDS", type: "tds" },
      { day: 8, task: "GSTR-1", type: "gst" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 14, task: "Holiday", type: "holiday" },
      { day: 16, task: "ESI&PF", type: "payroll" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "Shivaratri", type: "holiday" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 21, task: "GSTR-3B", type: "gst" },
      { day: 22, task: "Holiday", type: "holiday" },
      { day: 23, task: "Q-Filing", type: "statutory" },
      { day: 24, task: "Q-Filing", type: "statutory" },
      { day: 25, task: "Q-Filing", type: "statutory" },
      { day: 26, task: "Q-Filing", type: "statutory" },
      { day: 27, task: "Q-Filing", type: "statutory" },
      { day: 28, task: "Q-Filing", type: "statutory" }
    ]
  },
  {
    name: "March",
    days: [
      { day: 1, task: "Holi", type: "holiday" },
      { day: 2, task: "GSTR-1", type: "gst" },
      { day: 3, task: "GSTR-1", type: "gst" },
      { day: 4, task: "GSTR-1", type: "gst" },
      { day: 5, task: "TDS", type: "tds" },
      { day: 8, task: "GSTR-1", type: "gst" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 14, task: "Holiday", type: "holiday" },
      { day: 15, task: "ESI&PF", type: "payroll" },
      { day: 16, task: "GSTR-3B", type: "gst" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "Ugadi", type: "holiday" },
      { day: 21, task: "Ramzan", type: "holiday" },
      { day: 22, task: "Rama Navami", type: "holiday" },
      { day: 28, task: "Holiday", type: "holiday" }
    ]
  },
  {
    name: "April",
    days: [
      { day: 5, task: "GSTR-1", type: "gst" },
      { day: 6, task: "GSTR-1", type: "gst" },
      { day: 7, task: "TDS", type: "tds" },
      { day: 8, task: "GSTR-1", type: "gst" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 10, task: "GSTR-1", type: "gst" },
      { day: 11, task: "Holiday", type: "holiday" },
      { day: 12, task: "Q-GSTR1", type: "gst" },
      { day: 13, task: "GSTR-3B", type: "gst" },
      { day: 14, task: "ESI&PF", type: "payroll" },
      { day: 15, task: "GSTR-3B", type: "gst" },
      { day: 16, task: "GSTR-3B", type: "gst" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 22, task: "Q-GSTR3B", type: "gst" },
      { day: 23, task: "Q-GSTR3B", type: "gst" },
      { day: 24, task: "Holiday", type: "holiday" }
    ]
  },
  {
    name: "May",
    days: [
      { day: 3, task: "GSTR-1", type: "gst" },
      { day: 4, task: "GSTR-1", type: "gst" },
      { day: 5, task: "GSTR-1", type: "gst" },
      { day: 6, task: "TDS", type: "tds" },
      { day: 7, task: "GSTR-1", type: "gst" },
      { day: 8, task: "Holiday", type: "holiday" },
      { day: 10, task: "GSTR-3B", type: "gst" },
      { day: 12, task: "ESI&PF", type: "payroll" },
      { day: 13, task: "GSTR-3B", type: "gst" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 22, task: "Holiday", type: "holiday" },
      { day: 24, task: "Bakrid", type: "holiday" },
      { day: 25, task: "Q-Filing", type: "statutory" },
      { day: 26, task: "Q-Filing", type: "statutory" },
      { day: 27, task: "Q-Filing", type: "statutory" },
      { day: 28, task: "Q-Filing", type: "statutory" },
      { day: 29, task: "Q-Filing", type: "statutory" }
    ]
  },
  {
    name: "June",
    days: [
      { day: 1, task: "GSTR-1", type: "gst" },
      { day: 2, task: "GSTR-1", type: "gst" },
      { day: 7, task: "GSTR-1", type: "gst" },
      { day: 9, task: "TDS", type: "tds" },
      { day: 10, task: "GSTR-1", type: "gst" },
      { day: 11, task: "GSTR-1", type: "gst" },
      { day: 12, task: "GSTR-1", type: "gst" },
      { day: 13, task: "Holiday", type: "holiday" },
      { day: 14, task: "GSTR-3B", type: "gst" },
      { day: 16, task: "ESI&PF", type: "payroll" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 21, task: "Holiday", type: "holiday" }
    ]
  },
  {
    name: "July",
    days: [
      { day: 5, task: "GSTR-1", type: "gst" },
      { day: 6, task: "GSTR-1", type: "gst" },
      { day: 7, task: "GSTR-1", type: "gst" },
      { day: 8, task: "TDS", type: "tds" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 10, task: "GSTR-1", type: "gst" },
      { day: 11, task: "Holiday", type: "holiday" },
      { day: 12, task: "Q-GSTR1", type: "gst" },
      { day: 13, task: "GSTR-3B", type: "gst" },
      { day: 14, task: "ESI&PF", type: "payroll" },
      { day: 15, task: "GSTR-3B", type: "gst" },
      { day: 16, task: "GSTR-3B", type: "gst" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 23, task: "Q-GSTR3B", type: "gst" },
      { day: 24, task: "Holiday", type: "holiday" },
      { day: 26, task: "Q-Filing", type: "statutory" },
      { day: 27, task: "Q-Filing", type: "statutory" }
    ]
  },
  {
    name: "August",
    days: [
      { day: 2, task: "GSTR-1", type: "gst" },
      { day: 3, task: "GSTR-1", type: "gst" },
      { day: 4, task: "GSTR-1", type: "gst" },
      { day: 5, task: "TDS", type: "tds" },
      { day: 6, task: "Holiday", type: "holiday" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 10, task: "GSTR-1", type: "gst" },
      { day: 13, task: "GSTR-3B", type: "gst" },
      { day: 14, task: "ESI&PF", type: "payroll" },
      { day: 15, task: "Independence Day", type: "holiday" },
      { day: 16, task: "GSTR-3B", type: "gst" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 21, task: "Holiday", type: "holiday" },
      { day: 23, task: "Raksha Bandhan", type: "holiday" }
    ]
  },
  {
    name: "September",
    days: [
      { day: 1, task: "Janmashtami", type: "holiday" },
      { day: 2, task: "GSTR-1", type: "gst" },
      { day: 3, task: "GSTR-1", type: "gst" },
      { day: 6, task: "GSTR-1", type: "gst" },
      { day: 7, task: "GSTR-1", type: "gst" },
      { day: 8, task: "TDS", type: "tds" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 10, task: "GSTR-1", type: "gst" },
      { day: 11, task: "GSTR-1", type: "gst" },
      { day: 12, task: "Holiday", type: "holiday" },
      { day: 13, task: "Ganesh Chaturthi", type: "holiday" },
      { day: 14, task: "GSTR-3B", type: "gst" },
      { day: 15, task: "ESI&PF", type: "payroll" },
      { day: 16, task: "GSTR-3B", type: "gst" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 21, task: "Holiday", type: "holiday" },
      { day: 27, task: "AOC", type: "statutory" },
      { day: 28, task: "DIR-3 KYC", type: "statutory" },
      { day: 29, task: "Tax Audit", type: "statutory" }
    ]
  },
  {
    name: "October",
    days: [
      { day: 4, task: "GSTR-1", type: "gst" },
      { day: 5, task: "GSTR-1", type: "gst" },
      { day: 6, task: "GSTR-1", type: "gst" },
      { day: 7, task: "TDS", type: "tds" },
      { day: 8, task: "GSTR-1", type: "gst" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 10, task: "Holiday", type: "holiday" },
      { day: 11, task: "GSTR-3B", type: "gst" },
      { day: 13, task: "ESI&PF", type: "payroll" },
      { day: 14, task: "GSTR-3B", type: "gst" },
      { day: 15, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 22, task: "Dussehra", type: "holiday" },
      { day: 23, task: "Holiday", type: "holiday" },
      { day: 25, task: "MGT-7", type: "statutory" },
      { day: 26, task: "AOC", type: "statutory" }
    ]
  },
  {
    name: "November",
    days: [
      { day: 1, task: "GSTR-1", type: "gst" },
      { day: 2, task: "GSTR-1", type: "gst" },
      { day: 3, task: "GSTR-1", type: "gst" },
      { day: 4, task: "TDS", type: "tds" },
      { day: 8, task: "Diwali", type: "holiday" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 10, task: "GSTR-1", type: "gst" },
      { day: 11, task: "GSTR-1", type: "gst" },
      { day: 14, task: "Holiday", type: "holiday" },
      { day: 15, task: "GSTR-3B", type: "gst" },
      { day: 17, task: "ESI&PF", type: "payroll" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 21, task: "GSTR-3B", type: "gst" },
      { day: 22, task: "Holiday", type: "holiday" },
      { day: 29, task: "MGT-7", type: "statutory" },
      { day: 30, task: "Q-Filing", type: "statutory" }
    ]
  },
  {
    name: "December",
    days: [
      { day: 1, task: "GSTR-1", type: "gst" },
      { day: 6, task: "GSTR-1", type: "gst" },
      { day: 7, task: "GSTR-1", type: "gst" },
      { day: 8, task: "TDS", type: "tds" },
      { day: 9, task: "GSTR-1", type: "gst" },
      { day: 10, task: "GSTR-1", type: "gst" },
      { day: 12, task: "Holiday", type: "holiday" },
      { day: 13, task: "Q-GSTR1", type: "gst" },
      { day: 14, task: "GSTR-3B", type: "gst" },
      { day: 15, task: "ESI&PF", type: "payroll" },
      { day: 16, task: "GSTR-3B", type: "gst" },
      { day: 17, task: "GSTR-3B", type: "gst" },
      { day: 18, task: "GSTR-3B", type: "gst" },
      { day: 19, task: "GSTR-3B", type: "gst" },
      { day: 20, task: "GSTR-3B", type: "gst" },
      { day: 21, task: "Q-GSTR3B", type: "gst" },
      { day: 22, task: "Q-GSTR3B", type: "gst" },
      { day: 23, task: "Q-GSTR3B", type: "gst" },
      { day: 25, task: "Christmas", type: "holiday" },
      { day: 26, task: "Holiday", type: "holiday" }
    ]
  }
];
