export const QUERY_KEYS = {
  DASHBOARD: ["dashboard"],

  CUSTOMERS: ["customers"],
  CUSTOMER: (id: number) => ["customers", id],

  BIKES: ["bikes"],
  BIKE: (id: number) => ["bikes", id],
  BIKE_MODELS: ["bike_models"],

  LEADS: ["leads"],
  LEAD: (id: number) => ["leads", id],
  SALES: ["sales"],
  SALE: (id: number) => ["sales", id],

  LOANS: ["loans"],
  LOAN: (id: number) => ["loans", id],
  PAYMENTS: ["payments"],

  CAMPAIGNS: ["campaigns"],
  CAMPAIGN: (id: number) => ["campaigns", id],
  CAMPAIGN_SUMMARY: ["campaign_summary"],

  SITE_ADS: ["site_ads"],
  SITE_AD: (id: number) => ["site_ads", id],
  SITE_AD_SUMMARY: ["site_ad_summary"],
  PUBLIC_SITE_ADS: (placement: string, viewer: number | string = "anonymous") => [
    "public_site_ads",
    placement,
    viewer,
  ],

  SMS_CAMPAIGNS: ["sms_campaigns"],
  SMS_CAMPAIGN: (id: number) => ["sms_campaigns", id],
  PROMOTIONS: ["promotions"],
  PROMOTION: (id: number) => ["promotions", id],

  SERVICE_RECORDS: ["service_records"],
  SERVICE_RECORD: (id: number) => ["service_records", id],
  SPARE_PARTS: ["spare_parts"],

  SALES_REPORT: ["sales_report"],
  INVENTORY_REPORT: ["inventory_report"],
  FINANCING_REPORT: ["financing_report"],
  ADVERTISING_REPORT: ["advertising_report"],
  MARKETING_REPORT: ["marketing_report"],

  USERS: ["users"],
  USER: (id: number) => ["users", id],
  PROFILE: ["profile"],
} as const;
