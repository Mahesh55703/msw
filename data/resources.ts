export type ResourceType = 'guide' | 'checklist' | 'faq' | 'update' | 'article';

export interface ResourceItem {
  title: string;
  slug: string;
  type: ResourceType;
  category: string;
  excerpt: string;
  content?: string; // HTML or Markdown content
  author?: string;
  authorBio?: string;
  authorImage?: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: string;
  featuredImage?: string;
  featured?: boolean;
  keyTakeaways?: string[];
  relatedServices: string[]; // slugs
  relatedIndustries: string[]; // slugs
  relatedResources?: string[]; // slugs
  seoTitle?: string;
  seoDescription?: string;
  // Updates specific
  source?: { name: string; url: string };
  // Checklist specific
  downloadUrl?: string;
  downloadType?: string;
  leadGate?: boolean;
  checklistItems?: { category: string; items: string[] }[];
  // FAQ specific
  question?: string;
  answer?: string;
}

export const resourcesData: ResourceItem[] = [
  // CHECKLISTS
  {
    title: 'Factory Labour Compliance Checklist',
    slug: 'factory-labour-compliance-checklist',
    type: 'checklist',
    category: 'Factory Compliance',
    excerpt: 'Use this 40-point checklist as a starting point for reviewing your factory\'s HR and labour compliance processes.',
    publishedAt: '2026-08-26',
    featured: true,
    leadGate: true,
    relatedServices: ['factory-compliance', 'labour-compliance'],
    relatedIndustries: ['manufacturing', 'engineering'],
    checklistItems: [
      {
        category: 'Employee Records',
        items: [
          'Employee master records maintained',
          'Joining documentation maintained',
          'Attendance records maintained',
          'Leave records maintained',
          'Wage/payroll records maintained'
        ]
      },
      {
        category: 'Statutory Compliance',
        items: [
          'Applicable registrations reviewed',
          'PF compliance reviewed',
          'ESIC compliance reviewed',
          'Applicable statutory records maintained',
          'Compliance calendar maintained'
        ]
      },
      {
        category: 'Contractor Workforce',
        items: [
          'Contractor documentation maintained',
          'Contract worker records maintained',
          'Wage/attendance documentation reviewed',
          'Applicable PF/ESIC records reviewed'
        ]
      }
    ]
  },
  {
    title: 'Contractor Compliance Checklist',
    slug: 'contractor-compliance-checklist',
    type: 'checklist',
    category: 'Contract Labour',
    excerpt: 'A comprehensive checklist for principal employers to ensure their contractors are fully compliant with statutory obligations.',
    publishedAt: '2026-08-26',
    featured: true,
    leadGate: true,
    relatedServices: ['contract-labour-compliance'],
    relatedIndustries: ['construction', 'logistics-warehousing', 'manufacturing'],
    checklistItems: [
      {
        category: 'Principal Employer Duties',
        items: [
          'Registration under CLRA obtained',
          'Notice of commencement filed',
          'Register of contractors maintained',
          'Annual returns filed'
        ]
      },
      {
        category: 'Contractor Verification',
        items: [
          'Contractor labor license verified',
          'PF and ESIC codes verified',
          'Monthly wage registers verified before bill clearance',
          'PF/ESIC challans matched with deployed headcount'
        ]
      }
    ]
  },
  {
    title: 'PF & ESIC Compliance Checklist',
    slug: 'pf-esic-compliance-checklist',
    type: 'checklist',
    category: 'PF & ESIC',
    excerpt: 'Ensure your monthly PF and ESIC contributions, filings, and employee records are accurate and up to date.',
    publishedAt: '2026-08-25',
    featured: false,
    leadGate: true,
    relatedServices: ['pf-esic-compliance'],
    relatedIndustries: ['msmes', 'retail', 'hospitality'],
    checklistItems: [
      {
        category: 'Monthly Filings',
        items: [
          'ECR generated and verified',
          'PF contributions deposited by 15th',
          'ESIC contributions deposited by 15th',
          'Challans securely filed'
        ]
      },
      {
        category: 'Employee Records',
        items: [
          'UAN generated for new joiners',
          'KYC seeded for all active UANs',
          'ESIC Pehchan cards distributed',
          'Nomination forms (Form 2) updated'
        ]
      }
    ]
  },
  {
    title: 'HR Documentation Checklist',
    slug: 'hr-documentation-checklist',
    type: 'checklist',
    category: 'HR Operations',
    excerpt: 'A foundational checklist of required HR documents from onboarding to full and final settlement.',
    publishedAt: '2026-08-24',
    featured: false,
    leadGate: true,
    relatedServices: ['hr-consulting', 'payroll-hr-operations'],
    relatedIndustries: ['msmes', 'education', 'healthcare'],
    checklistItems: [
      {
        category: 'Onboarding',
        items: [
          'Offer letter signed',
          'Appointment letter issued',
          'NDA and confidentiality agreements signed',
          'Background verification completed',
          'Statutory forms (PF/ESIC/Gratuity) collected'
        ]
      },
      {
        category: 'Ongoing & Exit',
        items: [
          'Employee handbook acknowledged',
          'Leave policy communicated',
          'Relieving letter drafted',
          'F&F settlement calculated and processed'
        ]
      }
    ]
  },
  {
    title: 'Payroll Compliance Checklist',
    slug: 'payroll-compliance-checklist',
    type: 'checklist',
    category: 'Payroll',
    excerpt: 'A monthly pre-processing checklist to ensure accurate, compliant, and timely payroll execution.',
    publishedAt: '2026-08-23',
    featured: false,
    leadGate: true,
    relatedServices: ['payroll-hr-operations'],
    relatedIndustries: ['retail', 'hospitality', 'automotive'],
    checklistItems: [
      {
        category: 'Pre-Processing',
        items: [
          'Attendance data frozen and verified',
          'Leave adjustments calculated',
          'Overtime verified against statutory limits',
          'New joiner and exit data updated'
        ]
      },
      {
        category: 'Processing & Deductions',
        items: [
          'Minimum wage adherence verified',
          'PF, ESIC, PT, and TDS accurately deducted',
          'Advances or loan recoveries applied',
          'Payslips generated and distributed'
        ]
      }
    ]
  },

  // GUIDES
  {
    title: 'Factory Labour Compliance Guide',
    slug: 'factory-labour-compliance-guide',
    type: 'guide',
    category: 'Factory Compliance',
    excerpt: 'A comprehensive guide to understanding and managing the complex web of statutory requirements for factories and industrial establishments.',
    content: `
## Understanding Factory Labour Compliance
Factory labour compliance encompasses the framework of statutory laws, state-specific rules, and regulatory obligations governing employment, occupational safety, health, and welfare within a manufacturing or industrial environment.

Because factories operate with unique risks and workforce dynamics, the regulatory burden is significantly higher than that of a standard commercial office. 

## Applicability Thresholds
Applicability of factory-specific regulations (such as the Factories Act, 1948, and corresponding state rules) generally depends on the nature of the manufacturing process, the number of workers, and the use of power.

Historically, the baseline thresholds have been:
- **10 or more workers** (where the manufacturing process is carried on with the aid of power).
- **20 or more workers** (where the manufacturing process is carried on without the aid of power).

> **Important Note:** Several Indian states have amended these thresholds in recent years (often increasing them to 20 and 40 workers, respectively) to promote ease of doing business. Furthermore, the impending implementation of the Occupational Safety, Health and Working Conditions (OSH) Code may alter these definitions further. Always verify applicability against your specific state's current gazette notifications.

## Key Compliance Pillars

### 1. Working Hours, Spread-over & Overtime
Establishing clear policies for shift timings is critical. While general rules often cap adult working hours at 9 hours a day and 48 hours a week, exceptions exist for continuous processes. Overtime wages typically must be calculated at twice the ordinary rate of wages, but exemptions and limits on total overtime hours vary strictly by state.

### 2. Occupational Health & Safety
Industrial setups must adhere to strict safety protocols. Depending on the workforce size and the presence of hazardous processes, establishments may be required to:
- Maintain specific ventilation, lighting, and temperature controls.
- Provide and maintain adequate personal protective equipment (PPE).
- Appoint qualified Safety Officers.
- Constitute a Safety Committee with equal representation of workers and management.

### 3. Welfare Facilities
The law mandates specific welfare provisions which trigger as the workforce scales. Common threshold-based requirements include:
- **First-aid appliances:** Mandatory across facilities, with specific contents based on workforce size.
- **Crèche facilities:** Often required when employing more than 30 women workers.
- **Rest rooms and shelters:** Typically mandated for facilities with more than 150 workers.
- **Canteens:** Generally required when the workforce exceeds 250 workers.

## Critical Documentation & Registers
Inspectors frequently review physical and digital documentation to verify compliance. While many states have moved towards consolidated registers under ease-of-doing-business initiatives, establishments generally must maintain records analogous to:
- Adult Worker Register
- Muster Roll (Attendance)
- Register of Wages (including overtime records)
- Register of Leave with Wages
- Accident Register

## The Principal Employer's Liability
In modern manufacturing, contract labour is widely utilized. It is crucial to understand that under acts like the Contract Labour (Regulation and Abolition) Act, EPF, and ESIC, the factory management acts as the **Principal Employer**. 

If a contractor fails to pay minimum wages, deposit PF/ESIC contributions, or provide welfare facilities, the liability can ultimately fall upon the Principal Employer.

## Building a Compliance Roadmap
Compliance should not be treated as a reactive exercise for inspection days. Establishments should:
1. Conduct an independent baseline compliance audit.
2. Verify all state-specific amendments and threshold triggers.
3. Centralize workforce data (both direct and indirect).
4. Establish a recurring monthly compliance calendar.

*Disclaimer: This guide is for informational purposes only and does not constitute legal advice. Labour laws in India are concurrent and subject to frequent state-level amendments. Establishments should consult with qualified compliance professionals or legal counsel regarding their specific obligations.*
    `,
    author: 'LabourAxis Compliance Team',
    publishedAt: '2026-08-20',
    updatedAt: '2026-08-26',
    readingTime: '12 min read',
    featured: true,
    relatedServices: ['factory-compliance', 'labour-compliance'],
    relatedIndustries: ['manufacturing', 'engineering', 'automotive']
  },

  // ARTICLES
  {
    title: '7 Labour Compliance Mistakes MSMEs Should Avoid',
    slug: '7-labour-compliance-mistakes-msmes-should-avoid',
    type: 'article',
    category: 'Labour Compliance',
    excerpt: 'Small businesses don\'t intentionally ignore compliance. The problem is often fragmented records, unclear responsibilities and missed recurring requirements.',
    content: `
Small businesses and scaling MSMEs often view HR and compliance as a large-enterprise problem. However, crossing specific employee thresholds triggers immediate statutory obligations. Ignoring these can lead to severe penalties, back-dated liabilities, and operational disruptions.

## 1. Ignoring Applicability & Threshold Requirements

Many businesses fail to realize that the moment they hire their 10th or 20th employee, complex statutory requirements can suddenly become applicable depending on state laws and the nature of the business. 

> **Important:** Applicability may vary depending on the establishment, workforce, location and applicable legal framework.

**Why it matters**
Failing to register for EPF, ESIC, or Gratuity immediately upon crossing the threshold means you begin accumulating back-dated liabilities, interest, and penal damages which compound rapidly over time.

**What businesses should review**
Track your exact headcount (including contract workers, temporary staff, and daily wagers) continuously. Never rely on assumptions—verify applicable laws the moment you begin scaling your workforce.

## 2. Misclassifying Employees as Consultants

Paying regular workers as "consultants" or "freelancers" to avoid PF/ESIC liabilities and payroll taxes is a major red flag during any labour inspection.

**Why it matters**
If a person works fixed hours, uses company equipment, and operates under your direct control and supervision, authorities and labor courts will legally classify them as an employee, instantly rendering the consultant agreement void.

**What businesses should review**
Audit all ongoing consulting and freelance agreements. Ensure that individuals classified as independent contractors genuinely operate independently and do not meet the legal criteria for an employer-employee relationship.

## 3. Ignoring State Minimum Wages

Minimum wages are not static. In many states, the Variable Dearness Allowance (VDA) is revised twice a year (typically April and October) by the respective state governments.

**Why it matters**
Paying a fixed salary that inadvertently falls below the newly revised minimum wage for a specific skill category (Unskilled, Semi-skilled, Skilled) is a common and highly costly error that often leads to severe wage-difference claims.

**What businesses should review**
Establish a process to track VDA notifications in all states where you have operations or deployed workers, and immediately update the payroll master to reflect the revised wages.

## 4. Poor Record Keeping

Inspectors demand meticulously maintained statutory registers, including muster rolls, wage registers, leave records, and accident registers.

**Why it matters**
Relying on disorganized Excel sheets, informal emails, or verbal agreements provides absolutely no legal defense during a compliance audit or labor dispute. The law requires specific formats (like Form IV, Form T, etc. depending on the state).

**What businesses should review**
Digitize and centralize all HR and compliance records. Ensure that the formats of your registers strictly align with the latest state-specific rules.

## 5. Neglecting Contract Labour Compliance

If you hire workers through a security, housekeeping, or manpower supply agency, you are legally the Principal Employer.

**Why it matters**
The law places ultimate responsibility on you. If the agency defaults on their PF/ESIC payments or fails to pay minimum wages, the liability falls directly on the Principal Employer to make good the dues.

**What businesses should review**
Implement a strict monthly vendor compliance clearance process. Never clear a contractor's invoice until they provide verified copies of their wage registers and PF/ESIC challans specific to the workers deployed at your site.

## 6. Missing Statutory Display Notices

Various labour laws (including Shops & Establishments, Minimum Wages Act, Maternity Benefit Act) require establishments to physically display abstracts of the acts, minimum wage rates, and working hours on notice boards.

**Why it matters**
This is the most visible compliance requirement. A simple oversight in failing to display these notices often results in immediate fines and sets a negative tone during random inspections.

**What businesses should review**
Conduct a quick physical audit of all your office premises and factory floors to ensure all mandatory notices are prominently displayed in English and the local language.

## 7. DIY Payroll Processing

Founders and small finance teams manually calculating TDS, PF, ESIC, and Professional Tax (PT) often make critical calculation errors or miss rigid filing deadlines.

**Why it matters**
Statutory remittances are highly time-sensitive. A delay of even a single day can lead to compounding interest and penal damages. Furthermore, calculating PF on incorrect wage components can lead to massive liabilities during an EPFO assessment.

**What businesses should review**
Transition away from manual spreadsheets. Utilize professional payroll processing support to ensure 100% accuracy in statutory deductions and timely filing of all returns.
    `,
    author: 'LabourAxis Editorial',
    authorBio: 'Practical insights on HR operations, labour compliance and workforce management.',
    publishedAt: '2026-08-26',
    updatedAt: '2026-08-26',
    readingTime: '6 min read',
    featuredImage: '/logo-transparent.png',
    keyTakeaways: [
      'Labour compliance requirements depend on the nature and circumstances of the establishment.',
      'Businesses should identify applicable requirements rather than relying on assumptions.',
      'Employee and contractor records should be maintained systematically.',
      'Recurring compliance activities should be tracked using a defined process.',
      'Periodic compliance reviews can help identify documentation and process gaps.'
    ],
    featured: true,
    relatedServices: ['labour-compliance', 'compliance-audit', 'hr-consulting'],
    relatedIndustries: ['manufacturing']
  },

  // FAQS
  {
    title: 'What is labour compliance?',
    slug: 'what-is-labour-compliance',
    type: 'faq',
    category: 'Labour Compliance',
    excerpt: 'Understanding the basics of labour compliance.',
    question: 'What is labour compliance?',
    answer: 'Labour compliance refers to a business\'s adherence to the various federal, state, and local laws governing employment. This includes regulations surrounding minimum wages, working hours, social security (PF/ESIC), workplace safety, maternity benefits, and the proper maintenance of employee records and statutory registers.',
    publishedAt: '2026-08-01',
    relatedServices: ['labour-compliance'],
    relatedIndustries: []
  },
  {
    title: 'Which businesses need labour compliance support?',
    slug: 'which-businesses-need-labour-compliance-support',
    type: 'faq',
    category: 'Labour Compliance',
    excerpt: 'Identifying if your business needs compliance support.',
    question: 'Which businesses need labour compliance support?',
    answer: 'Any business that hires employees or contract workers needs to adhere to certain basic labour laws (like Shops & Establishments). However, the complexity increases significantly for manufacturing units, factories, construction sites, and businesses crossing the 10 or 20 employee threshold where acts like EPF, ESIC, and Gratuity apply.',
    publishedAt: '2026-08-01',
    relatedServices: ['compliance-audit'],
    relatedIndustries: []
  },
  {
    title: 'What is PF compliance?',
    slug: 'what-is-pf-compliance',
    type: 'faq',
    category: 'PF & ESIC',
    excerpt: 'The basics of Provident Fund compliance.',
    question: 'What is PF compliance?',
    answer: 'PF (Provident Fund) compliance involves adhering to the EPF & MP Act, 1952. It requires eligible employers (usually with 20 or more employees) to register with the EPFO, deduct a specific percentage from employees\' salaries, make a matching employer contribution, and deposit these funds monthly by the 15th, along with filing the Electronic Challan cum Return (ECR).',
    publishedAt: '2026-08-01',
    relatedServices: ['pf-esic-compliance'],
    relatedIndustries: []
  },
  {
    title: 'What should a principal employer review?',
    slug: 'what-should-principal-employer-review',
    type: 'faq',
    category: 'Contract Labour',
    excerpt: 'Principal employer obligations for contractors.',
    question: 'What should a principal employer review?',
    answer: 'A principal employer must ensure their contractors possess a valid labor license, and must regularly review the contractor\'s monthly wage registers, attendance records, and PF/ESIC challans (specifically verifying that contributions are made for the exact workers deployed at their site) before clearing the contractor\'s invoices.',
    publishedAt: '2026-08-01',
    relatedServices: ['contract-labour-compliance'],
    relatedIndustries: []
  }
];
