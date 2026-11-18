
import type { Guide } from "./guides";

const VERIFIED_AT = "2026-09-28";

const HAPPY_BIRTH_URL = "https://www.gov.kr/portal/onestopSvc/happyBirth";
const FIRST_MEETING_SOURCE =
  "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004656";
const PARENT_ALLOWANCE_SOURCE =
  "https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309189_1141.html";
const CHILD_ALLOWANCE_SOURCE = "https://www.mohw.go.kr/menu.es?mid=a10711030100";

export const EN_GUIDES: Record<string, Guide> = {
  seoul: {
    slug: "seoul",
    title: "Seoul Birth Grant and Postpartum Care Support Guide",
    eyebrow: "Seoul Metropolitan City · Check after childbirth",
    summary:
      "The national First Meeting Voucher and Seoul's Postpartum Care Expense Support are separate programs. First check the residence, birth-registration, and application-deadline conditions for Seoul support.",
    verifiedAt: VERIFIED_AT,
    regionId: "seoul",
    relatedBenefitIds: ["seoul-001", "nat-001"],
    sections: [
      {
        heading: "Nationwide: First Meeting Voucher",
        body:
          "The Ministry of Health and Welfare provides newborns with a voucher on a National Happiness Card. The amount is KRW 2 million for a first child and KRW 3 million for a second or subsequent child. Eligible children must have been birth-registered and issued a resident registration number. Bokjiro's guidance describes eligibility as children born in or after 2024 who are less than 2 years old from their date of birth.",
        note:
          "This is not an additional Seoul City grant. The voucher is valid for 2 years from the child's date of birth. Check Bokjiro's guidance for eligible uses and whether you can apply.",
      },
      {
        heading: "Seoul City: Seoul-type Postpartum Care Expense Support",
        body:
          "This is a local program in which Seoul City provides a voucher to a partner card in the mother's own name. Seoul City's program guidance states that there is no median-income limit.",
        bullets: [
          "Support amount: KRW 1 million for a first child, KRW 1.2 million for a second child, and KRW 1.5 million for a third or subsequent child. Mothers of multiple births and mothers following a miscarriage or stillbirth receive support based on the singleton-birth amount.",
          "Residence and registration conditions: As of the application date, the mother must have continuously resided in Seoul for at least 90 days, and the child must also reside in Seoul and have been birth-registered in Seoul.",
          "Application deadline: Within 180 days of the date of childbirth. Exceptions apply in cases such as hospitalization of a premature infant; if applicable, check the exception conditions in Seoul City's guidance.",
          "Use: May be used for listed items such as maternal and newborn health care, medicines and health foods, Korean herbal medicine, postpartum exercise, and psychological counseling. From July 1, 2026, the place of use is partner merchants located in Seoul.",
        ],
        note:
          "You cannot receive Seoul City support if you do not meet the residence requirements. It does not apply to addresses outside Seoul; check the card issuer and merchant conditions before applying as well.",
      },
      {
        heading: "Application steps",
        bullets: [
          "Check that the birth has been registered and that the child's birth registration is reflected in Seoul's resident registration records.",
          "Apply through Seoul's Tansaeng-Yuk-a Mongttang Information Portal using a mobile phone in the mother's own name. According to Seoul City's guidance, applications by a representative other than the applicant are not allowed.",
          "Applications in person at the community service center for your address are also listed. Make sure you meet the 90-day residence requirement as of the application date and do not miss the 180-day application deadline.",
          "The nationwide First Meeting Voucher can be applied for separately through Bokjiro, Government24, or the eup/myeon/dong office for your address.",
        ],
      },
    ],
    applicationLinks: [
      { label: "Seoul Tansaeng-Yuk-a Mongttang Information Portal", url: "https://umppa.seoul.go.kr/" },
      { label: "Government24 Happy Birth One-Stop Service", url: HAPPY_BIRTH_URL },
    ],
    sources: [
      {
        label: "Seoul-type Postpartum Care Expense Support — Seoul Tansaeng-Yuk-a Mongttang Information Portal",
        url: "https://umppa.seoul.go.kr/hmpg/sprt/bzin/bzmgComtDetail.do?biz_mng_no=58D83411277E40D1BFF6255A10CBCDD5",
      },
      { label: "First Meeting Voucher — Bokjiro (2026)", url: FIRST_MEETING_SOURCE },
      { label: "Happy Birth One-Stop Service — Government24", url: HAPPY_BIRTH_URL },
    ],
  },
  "gyeonggi-suwon": {
    slug: "gyeonggi-suwon",
    title: "Suwon Birth Grant and Gyeonggi Postpartum Care Support Guide",
    eyebrow: "Suwon, Gyeonggi Province · Distinguish city and provincial support",
    summary:
      "Suwon's birth grant and Gyeonggi Province's postpartum care support are separate local programs. Check the amounts for children born in 2026, Suwon residence conditions, and application deadlines separately.",
    verifiedAt: VERIFIED_AT,
    regionId: "gyeonggi",
    cityId: "gyeonggi-suwon",
    relatedBenefitIds: ["gyeonggi-suwon-001", "nat-001", "nat-002", "nat-004"],
    sections: [
      {
        heading: "Suwon City: Childbirth and Adoption Grant",
        body:
          "This is Suwon City's own support. The city lists families who have given birth to a first or subsequent child and have resided in Suwon for at least 180 days as eligible. The birth amounts below apply to children born on or after January 1, 2026.",
        bullets: [
          "KRW 500,000 for a first child, KRW 1 million for a second child, KRW 2 million for a third child, KRW 5 million for a fourth child, and KRW 10 million for a fifth or subsequent child.",
          "Suwon City states that families giving birth to triplets or more receive an additional KRW 5 million on top of the birth grant.",
          "Apply within 1 year of the date of birth at the community administrative welfare center for your address, or through the Government24 Happy Birth One-Stop Service.",
          "Documents listed by Suwon City: ID, application form, and a copy of the bankbook. Conditions for installment payments apply to fifth or subsequent children, so check the city's guidance.",
        ],
        note:
          "Suwon City separately states that children born on or before December 31, 2025 are subject to the previous criteria. Adoption support has different conditions and amounts from birth support; do not apply the birth amounts in this guide to adoption.",
      },
      {
        heading: "Gyeonggi Province: Postpartum Care Support",
        body:
          "This is a Gyeonggi Province program. For families residing in Suwon, it provides KRW 500,000 in Suwon Pay per child. For multiple births, the amount is multiplied by the number of children born.",
        bullets: [
          "The father or mother must be registered as a resident of Gyeonggi Province and actually reside there both on the date of birth and on the application date. The infant must be birth-registered in Gyeonggi Province (Suwon City).",
          "As of the application date, no more than 12 months may have passed since the date of birth.",
          "Apply in person at the administrative welfare center with jurisdiction over the child's first registered address, or through Gyeonggi Minwon24. Suwon City states that online applications are limited to the applicant themselves and that foreign nationals cannot apply online.",
        ],
        note:
          "This postpartum care support is a Gyeonggi Province program, while the birth grant in the previous section is a Suwon City program. Check the resident registration and actual-residence requirements for each program separately.",
      },
      {
        heading: "Check nationwide support separately, too",
        body:
          "The First Meeting Voucher, Parent Allowance, and Child Allowance are nationwide programs, not city or provincial support. Check and apply for them separately from Suwon City and Gyeonggi Province programs through the Government24 Happy Birth One-Stop Service or Bokjiro.",
      },
    ],
    applicationLinks: [
      {
        label: "Suwon City Childbirth and Adoption Grant Information",
        url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-10.jsp",
      },
      {
        label: "Apply Online for Gyeonggi Postpartum Care Support — Gyeonggi Minwon24",
        url: "https://gg24.gg.go.kr/",
      },
      { label: "Government24 Happy Birth One-Stop Service", url: HAPPY_BIRTH_URL },
    ],
    sources: [
      {
        label: "Childbirth and Adoption Grant — Suwon City",
        url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-10.jsp",
      },
      {
        label: "Gyeonggi Postpartum Care Support — Suwon City information",
        url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-14.jsp",
      },
      { label: "Happy Birth One-Stop Service — Government24", url: HAPPY_BIRTH_URL },
    ],
  },
  busan: {
    slug: "busan",
    title: "Busan Birth Grant Guide",
    eyebrow: "Busan Metropolitan City · Distinguish from nationwide vouchers",
    summary:
      "In Busan's information for children born in 2026, the support differs for first and second or subsequent children. The First Meeting Voucher is a nationwide program, while Busan's support for second or subsequent children is a separate cash payment.",
    verifiedAt: VERIFIED_AT,
    regionId: "busan",
    relatedBenefitIds: ["busan-001", "nat-001"],
    sections: [
      {
        heading: "Nationwide: First Meeting Voucher",
        body:
          "According to Busan City, children born in 2026 receive a First Meeting Voucher of KRW 2 million for a first child and KRW 3 million for a second or subsequent child. It is a National Happiness Card voucher; it is a nationwide program, not additional cash provided only by Busan City.",
        bullets: [
          "Bokjiro describes eligible children as those who have been birth-registered and issued a resident registration number.",
          "Under Busan City's guidance, the voucher may be used for up to 2 years from the child's date of birth. Unused points expire when the usage period ends.",
          "Apply at an eup/myeon/dong administrative welfare center, through Bokjiro, or through Government24.",
        ],
      },
      {
        heading: "Additional Busan City support: KRW 1 million for second or subsequent children",
        body:
          "Busan Metropolitan City provides an additional one-time city-funded payment of KRW 1 million to families with a second or subsequent child. It is paid in cash to the applicant's bank account. There is no additional KRW 1 million in city funding for a first child.",
        bullets: [
          "Eligible children are second or subsequent children whose birth has been registered in Busan and who are listed in resident registration.",
          "On the date the birth is registered, one parent and the second or subsequent child must be listed at and residing at the same resident registration address within Busan Metropolitan City. Busan City states that moving the address to another province or metropolitan city before payment makes the applicant ineligible.",
          "Apply within 3 months of the date of birth at the eup/myeon/dong administrative welfare center for your residence or through Government24.",
          "According to Busan City's guidance, payment is made on the 10th of the month after the application is received; if the 10th is a holiday, payment is made on the previous day.",
        ],
        note:
          "District- or county-level programs may be separate from this city-funded program. Check official information to see whether your district or county offers additional programs. District/county amounts that have not been verified are not added here.",
      },
      {
        heading: "When applying",
        bullets: [
          "After birth registration, review the First Meeting Voucher together with the services for your local area. Government24 Happy Birth lists nationwide services and local-government services as separate items.",
          "Busan's additional KRW 1 million is only for second or subsequent children and has separate 3-month application and resident-registration requirements, so do not assume that applying only for the nationwide voucher is enough.",
          "Busan City states that online applications are available when the child's guardian is a parent. For other representative applications, contact the administrative welfare center for your address.",
        ],
      },
    ],
    applicationLinks: [
      { label: "Busan City Birth Grant Application Information", url: "https://www.busan.go.kr/childcare/childcare010101" },
      { label: "Government24 Happy Birth One-Stop Service", url: HAPPY_BIRTH_URL },
      { label: "Bokjiro First Meeting Voucher Service", url: FIRST_MEETING_SOURCE },
    ],
    sources: [
      { label: "Birth Grant — Busan Metropolitan City", url: "https://www.busan.go.kr/childcare/childcare010101" },
      { label: "First Meeting Voucher — Bokjiro (2026)", url: FIRST_MEETING_SOURCE },
      { label: "Happy Birth One-Stop Service — Government24", url: HAPPY_BIRTH_URL },
    ],
  },
  "parent-and-child-allowance": {
    slug: "parent-and-child-allowance",
    title: "Can You Receive the Parent Allowance and Child Allowance Together?",
    eyebrow: "Nationwide · 2026 criteria",
    summary:
      "Yes. The Parent Allowance and Child Allowance are separate nationwide programs, so you can apply for both if you meet each program's eligibility requirements. Also check how the Parent Allowance payment method changes when using a daycare center.",
    verifiedAt: VERIFIED_AT,
    regionId: "national",
    relatedBenefitIds: ["nat-002", "nat-003", "nat-004"],
    sections: [
      {
        heading: "The two programs provide support separately",
        body:
          "Government24 Happy Birth lists the Parent Allowance and Child Allowance as separate nationwide services, and the Ministry of Health and Welfare also describes them as separate policies. Therefore, do not skip the Child Allowance application after applying for the Parent Allowance; check both items.",
        note:
          "This guidance is based on the fact that official information lists each program as a separate item. Actual eligibility depends on confirmation of the child's requirements, application, and payment information.",
      },
      {
        heading: "Parent Allowance amounts and application deadline",
        bullets: [
          "Eligibility: Children under 2 years old (0–23 months).",
          "Home-care amounts: KRW 1 million per month for age 0 and KRW 500,000 per month for age 1.",
          "To receive payments starting from the month that includes the date of birth, apply within 60 days, including the date of birth. If you apply after 60 days, payment begins in the month of application and earlier months are not paid retroactively.",
          "When using a daycare center, the full Parent Allowance is not paid as cash; support is provided as a childcare-fee voucher and a difference payment. Bokjiro's 2026 guidance lists basic childcare fees of KRW 584,000 and a difference payment of KRW 416,000 for age 0, and basic childcare fees of KRW 515,000 with no difference payment for age 1.",
        ],
        note:
          "Foreign parents: both allowances require the child to hold Korean nationality and a resident registration number. It's fine if both parents are foreign nationals. Dual citizens and recognized refugees are included; refugee applicants under review are not. See newbornkr.online/en/guide/foreign-parents.",
      },
      {
        heading: "Child Allowance amount and eligibility",
        bullets: [
          "Based on the Ministry of Health and Welfare's revised information dated March 31, 2026, the program covers children under 9 years old.",
          "The amount is KRW 100,000–130,000 per month and varies by place of residence. The Ministry's information lists KRW 100,000 in the metropolitan area, KRW 105,000 outside the metropolitan area, KRW 110,000 in population-decline priority areas, and KRW 120,000 in special areas, with an additional KRW 10,000 in local currency.",
          "Payment is normally deposited in cash, but local government ordinances may allow payment in local vouchers.",
          "Applications are listed as available in person at the eup/myeon/dong community center or online through Bokjiro.",
        ],
        note:
          "The Child Allowance amount and payment method may vary based on the place of residence. If you have moved or want to know whether you qualify for a special area, check with the local government for your address.",
      },
      {
        heading: "How to apply for both",
        bullets: [
          "Check and apply for the Parent Allowance and Child Allowance as separate items through the Government24 Happy Birth One-Stop Service, or apply at the eup/myeon/dong community center for the child's address.",
          "Pay particular attention to the Parent Allowance's 60-day deadline, including the date of birth. You can check the date in the Parent Allowance deadline calculator. Online applications may be restricted by guardian type, so check the applicant eligibility information on Government24 or Bokjiro.",
          "If using a daycare center or full-day childcare service, check the application for the relevant childcare-fee or care service and the Parent Allowance payment method separately.",
        ],
      },
    ],
    applicationLinks: [
      { label: "Parent Allowance deadline calculator", url: "/guide/parent-allowance-deadline" },
      { label: "Government24 Happy Birth One-Stop Service", url: HAPPY_BIRTH_URL },
      { label: "Bokjiro Parent Allowance Application Information", url: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004657" },
      { label: "Bokjiro Find a Service", url: "https://www.bokjiro.go.kr/" },
    ],
    sources: [
      { label: "2026 Parent Allowance Support Information — Bokjiro", url: PARENT_ALLOWANCE_SOURCE },
      { label: "Child Allowance Payment — Ministry of Health and Welfare", url: CHILD_ALLOWANCE_SOURCE },
      { label: "Childbirth support for foreign nationals — Easy to Find, Practical Law (Ministry of Government Legislation)", url: "https://m.easylaw.go.kr/MOM/SubCsmOvRetrieve.laf?ccfNo=1&cciNo=1&cnpClsNo=1&csmSeq=2328&langCd=700101" },
      { label: "Happy Birth One-Stop Service — Government24", url: HAPPY_BIRTH_URL },
    ],
  },
  "birth-registration-checklist": {
    slug: "birth-registration-checklist",
    title: "Checklist of Benefits to Apply for After Birth Registration",
    eyebrow: "Preparing to apply after birth · Nationwide + local support",
    summary:
      "Immediately after birth registration, check nationwide benefits separately from local-government support for your area of residence. The Parent Allowance must be applied for within 60 days, including the date of birth, to receive retroactive support starting from the month of birth.",
    verifiedAt: VERIFIED_AT,
    regionId: "national",
    relatedBenefitIds: ["nat-001", "nat-002", "nat-003", "nat-004"],
    sections: [
      {
        heading: "1. Confirm birth registration and the child's resident registration",
        body:
          "The First Meeting Voucher is for children who have been birth-registered and issued a resident registration number. Local programs may also have separate address or resident-registration conditions, such as birth registration in Seoul, so check the child's registered address before applying.",
        note:
          "Foreign parents: the First Meeting Voucher, Parent Allowance and Child Allowance require the child to hold Korean nationality (both parents may be foreign; dual citizens and recognized refugees are included, refugee applicants under review are not). See the guide for foreign parents at newbornkr.online/en/guide/foreign-parents.",
      },
      {
        heading: "2. Parent Allowance — take care of the 60-day deadline first",
        bullets: [
          "For children under 2 years old. Under the home-care criteria, the amount is KRW 1 million per month for age 0 and KRW 500,000 per month for age 1.",
          "Apply within 60 days, including the date of birth, to receive retroactive support starting from the month of birth. If you miss the deadline, payment begins in the month of application. You can check the date in the Parent Allowance deadline calculator.",
          "When using a daycare center or full-day childcare service, the payment format changes to childcare-fee or care support, so apply for that service separately.",
        ],
      },
      {
        heading: "3. First Meeting Voucher — National Happiness Card voucher",
        bullets: [
          "A nationwide voucher of KRW 2 million for a first child and KRW 3 million for a second or subsequent child.",
          "According to Bokjiro's guidance, eligible children must have been birth-registered and issued a resident registration number; children born in or after 2024 are described as eligible if less than 2 years have passed since their date of birth.",
          "Apply at an administrative welfare center, through Bokjiro, or through Government24. Busan City's guidance explains that the voucher can be used for up to 2 years from the date of birth and that unused points expire when the usage period ends.",
        ],
      },
      {
        heading: "4. Child Allowance — check it as a separate application",
        bullets: [
          "Based on the Ministry of Health and Welfare's revised information dated March 31, 2026, for children under 9 years old; KRW 100,000–130,000 per month, depending on place of residence.",
          "Apply at an eup/myeon/dong community center or through Bokjiro. It is separate from the Parent Allowance, so check both items.",
        ],
      },
      {
        heading: "5. Check birth support where you live, too",
        body:
          "Government24 Happy Birth lists local-government services, including city/province and city/county/district birth grants, separately; services may vary by local government. Based on your address of residence, check official local-government notices and application deadlines.",
        bullets: [
          "Seoul: Seoul-type Postpartum Care Expense Support requires the mother to have resided in Seoul for at least 90 days as of the application date, Seoul birth registration, and application within 180 days after childbirth.",
          "Suwon: Check the Suwon City birth grant's 180-day Suwon residence criterion and application deadline within 1 year after birth. Gyeonggi Province postpartum care support is a separate program and must be applied for within 12 months after birth.",
          "Busan: The city's additional birth grant is for second or subsequent children and requires the parent and child to reside at the same resident registration address in Busan when the birth is registered, and an application within 3 months after birth.",
        ],
        note:
          "Amounts, eligibility, and deadlines for other cities, counties, and districts have not been checked here. Official confirmation is needed from the administrative welfare center responsible for your place of residence or the address at the time of birth.",
      },
      {
        heading: "6. Apply together where available or contact the service counter",
        bullets: [
          "For online applications through Government24 Happy Birth, the applicant must be the mother or her spouse. After identity verification, complete the application form; the community center will review and receive it.",
          "For in-person applications, go to the eup/myeon/dong community center for the child's address. Government24's guidance says to bring ID.",
          "Do not assume that every service can be applied for all at once; check each program's separate requirements, additional documents, and local-government application procedures.",
        ],
      },
    ],
    applicationLinks: [
      { label: "Parent Allowance deadline calculator", url: "/guide/parent-allowance-deadline" },
      { label: "Apply for Government24 Happy Birth One-Stop Service", url: HAPPY_BIRTH_URL },
      { label: "Bokjiro Parent Allowance Information", url: PARENT_ALLOWANCE_SOURCE },
      { label: "Bokjiro First Meeting Voucher Information", url: FIRST_MEETING_SOURCE },
      { label: "Ministry of Health and Welfare Child Allowance Information", url: CHILD_ALLOWANCE_SOURCE },
    ],
    sources: [
      { label: "Happy Birth One-Stop Service — Government24", url: HAPPY_BIRTH_URL },
      { label: "2026 Parent Allowance Support Information — Bokjiro", url: PARENT_ALLOWANCE_SOURCE },
      { label: "First Meeting Voucher — Bokjiro (2026)", url: FIRST_MEETING_SOURCE },
      { label: "Child Allowance Payment — Ministry of Health and Welfare", url: CHILD_ALLOWANCE_SOURCE },
      {
        label: "Seoul-type Postpartum Care Expense Support — Seoul",
        url: "https://umppa.seoul.go.kr/hmpg/sprt/bzin/bzmgComtDetail.do?biz_mng_no=58D83411277E40D1BFF6255A10CBCDD5",
      },
      {
        label: "Suwon City Childbirth and Adoption Grant",
        url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-10.jsp",
      },
      { label: "Busan City Birth Grant", url: "https://www.busan.go.kr/childcare/childcare010101" },
      { label: "Childbirth support for foreign nationals — Easy to Find, Practical Law (Ministry of Government Legislation)", url: "https://m.easylaw.go.kr/MOM/SubCsmOvRetrieve.laf?ccfNo=1&cciNo=1&cnpClsNo=1&csmSeq=2328&langCd=700101" },
    ],
  },
};

