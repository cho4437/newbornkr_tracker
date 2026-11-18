
export type NewbornDadChecklistItem = {
  title: string;
  summary: string;
  agency: string;
  documents?: string;
};

export type NewbornDadChecklistSection = {
  number: string;
  title: string;
  timing: string;
  tip?: string;
  items: NewbornDadChecklistItem[];
};

export const EN_CHECKLIST_SECTIONS: NewbornDadChecklistSection[] = [
  {
    number: "1",
    title: "Birth Registration & Government Benefits",
    timing: "Within 30 days after birth",
    tip: "Using the Government24 or community center “Happy Birth One-Stop Service” lets you apply for the benefits all at once.",
    items: [
      {
        title: "Birth registration",
        summary: "Required within 30 days after birth (a fine applies if delayed)",
        agency:
          "Visit the competent eup/myeon/dong administrative welfare center (community center), or use the Supreme Court Electronic Family Relations Registration System (online)",
        documents: "Original birth certificate (issued by the hospital), applicant's ID",
      },
      {
        title: "First Meeting Voucher",
        summary: "KRW 2 million for a first child / KRW 3 million for a second or subsequent child (nationwide voucher; check official guidance for the latest conditions)",
        agency: "Administrative welfare center (community center) for your area, Bokjiro (online), or Government24",
      },
      {
        title: "Parent Allowance",
        summary: "Age 0 (0–11 months): KRW 1 million per month / age 1: KRW 500,000 per month (cash)",
        agency: "Administrative welfare center (community center) for your area, Bokjiro (online), or Government24",
      },
      {
        title: "Child Allowance",
        summary: "Children under 9 years old; KRW 100,000–130,000 per month depending on place of residence (check the payment method for your area)",
        agency: "Administrative welfare center (community center) for your area, Bokjiro (online), or Government24",
      },
      {
        title: "Local-government birth congratulatory grant",
        summary: "Amounts vary by local government of residence",
        agency: "Administrative welfare center (community center) for your area or the Happy Birth One-Stop Service",
      },
    ],
  },
  {
    number: "2",
    title: "National Health Insurance & Medical Benefits",
    timing: "Immediately after birth",
    items: [
      {
        title: "Register as a dependent under National Health Insurance",
        summary: "After birth registration, check that the baby is listed as a dependent; if not, file a dependent-registration report (Government24, NHIS branch or website)",
        agency: "National Health Insurance Service (visit a branch, call customer service at 1577-1000, or use the website)",
      },
      {
        title: "Hepatitis B vaccination & baby's health booklet",
        summary: "First dose and booklet received before hospital discharge",
        agency: "Maternity hospital/pediatric hospital where the baby was delivered",
      },
      {
        title: "Medical expense support for high-risk newborns",
        summary: "Support may apply in cases of prematurity or congenital abnormalities",
        agency: "Maternal and Child Health Division at the public health center for your area, or e-Health Center (online)",
      },
    ],
  },
  {
    number: "3",
    title: "Public Utility Discounts",
    timing: "After birth registration is complete",
    items: [
      {
        title: "Electricity bill discount",
        summary: "30% discount on the monthly electricity bill (up to KRW 16,000, for 3 years)",
        agency: "Korea Electric Power Corporation (call 123 without an area code, use the KEPCO ON website, or contact the administrative welfare center)",
      },
      {
        title: "City gas bill reduction (eligible households only)",
        summary: "A birth alone does not qualify; households with 3+ children, basic-livelihood recipients, near-poverty households and others qualify (from ₩18,000/month in winter, varies by eligibility)",
        agency: "Customer service for your local city gas supplier or the Happy Birth One-Stop Service",
      },
    ],
  },
  {
    number: "4",
    title: "Documents for Your Employer & Paternity Leave",
    timing: "Check with your company",
    items: [
      {
        title: "Spouse's childbirth leave",
        summary: "20 paid days (use within 120 days of the date of birth)",
        agency: "Your company (HR) · official Work24 information",
      },
      {
        title: "Documents to submit to your company",
        summary: "For applying for family allowance and registering for congratulatory benefits and health insurance",
        agency: "Your company (HR)",
        documents: "Resident registration certificate (issued after birth registration), copy of birth certificate",
      },
    ],
  },
];

