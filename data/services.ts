export type ServiceFeature = { title: string; description: string };

export type Service = {
  slug: string;
  title: string;
  category: string;
  heroSupportingText: string;
  trustLine: string;
  highlights: string[];
  problemIntro: string;
  problemList: string[];
  problemOutro: string;
  services: ServiceFeature[];
  audience: ServiceFeature[];
  deliverables: string[];
  commonGaps: string[];
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
  ctaText: string;
};

export const servicesData: Service[] = [
  {
    slug: 'hr-consulting',
    title: 'Practical HR Consulting for Growing Businesses',
    category: 'HR Consulting',
    heroSupportingText: 'Build structured HR processes, policies, and operational frameworks for growing businesses and industrial establishments.',
    trustLine: 'For growing businesses, MSMEs, factories, and industrial organizations.',
    highlights: ['Process Setup', 'Policies & Documentation', 'Employee Onboarding', 'Recruitment Support', 'HR Operations'],
    problemIntro: 'Many MSMEs start hiring employees before establishing proper HR processes.',
    problemList: [
      'Inconsistent onboarding and orientation',
      'Disorganized employee records and files',
      'Lack of clear HR policies or handbooks',
      'Ad-hoc HR operations leading to grievances',
      'Unstructured performance and leave tracking'
    ],
    problemOutro: 'LabourAxis helps bring your core HR operations into a structured, trackable, and compliant process.',
    services: [
      { title: 'HR Process Setup & Improvement', description: 'Establish and improve standardized workflows for hiring, lifecycle management, and offboarding.' },
      { title: 'HR Policies & Documentation', description: 'Develop employee handbooks, HR policies, and standard operating procedures tailored to your operations.' },
      { title: 'Employee Onboarding & Records', description: 'Create structured onboarding programs and manage compliant employee records.' },
      { title: 'HR Operations & Recruitment Support', description: 'Assist with day-to-day HR administration and recruitment process structuring.' },
      { title: 'Performance Management Setup', description: 'Design clear frameworks for evaluating employee performance and managing appraisals.' },
      { title: 'Employee Grievance Channels', description: 'Establish internal mechanisms for employees to safely report concerns and grievances.' },
      { title: 'Exit Management & F&F', description: 'Structure offboarding processes, exit interviews, and ensure accurate full and final settlements.' },
      { title: 'Compensation Structuring', description: 'Design wage structures that are both competitive and compliant with minimum wage and statutory norms.' },
      { title: 'Statutory Bonus & Gratuity', description: 'Provide guidance on calculating and processing statutory bonus and gratuity payouts correctly.' }
    ],
    audience: [
      { title: 'Growing Businesses', description: 'Companies establishing structured HR processes for the first time.' },
      { title: 'MSMEs', description: 'Businesses that do not have a large dedicated HR department.' },
      { title: 'Factories', description: 'Industrial units needing HR structures that align with strict compliance requirements.' },
      { title: 'Service Sector Firms', description: 'Companies with large field forces needing structured HR processes.' }
    ],
    deliverables: [
      'HR process documentation',
      'Employee handbook / policy manual',
      'Onboarding checklists and forms',
      'Standardized offer/appointment letters',
      'Employee record templates'
    ],
    commonGaps: [
      'Missing appointment letters and contracts',
      'Unclear leave and attendance policies',
      'Incomplete employee files',
      'Lack of formal grievance mechanisms'
    ],
    faqs: [
      { question: 'Do you help with basic HR setup?', answer: 'Yes, we help businesses establish fundamental HR policies, onboarding procedures, and documentation standards.' },
      { question: 'Do you provide recruitment services?', answer: 'We focus on HR operations and process setup. While we can support recruitment process structuring, we are not a placement agency.' }
    ],
    relatedServices: ['labour-compliance', 'industrial-relations'],
    ctaText: 'Discuss Your HR Requirement'
  },
  {
    slug: 'labour-compliance',
    title: 'Labour & Statutory Compliance Support for Businesses',
    category: 'Labour & Statutory Compliance',
    heroSupportingText: 'Practical support for managing recurring statutory requirements and maintaining accurate workforce records.',
    trustLine: 'For factories, MSMEs, contractors and workforce-intensive organizations.',
    highlights: ['Compliance Assessment', 'Statutory Records', 'Compliance Calendars', 'Inspection Preparation', 'Corrective Action'],
    problemIntro: 'Labour compliance becomes difficult when requirements are scattered across people, records and recurring deadlines.',
    problemList: [
      'Knowing which requirements apply',
      'Maintaining statutory records',
      'Tracking recurring compliance',
      'Managing contractor documentation',
      'Keeping employee records updated',
      'Preparing for inspections',
      'Identifying gaps before they become problems'
    ],
    problemOutro: 'LabourAxis helps bring these requirements into a structured, trackable process.',
    services: [
      { title: 'Compliance Assessment & Reviews', description: 'Review applicable HR and labour compliance requirements and identify potential gaps through thorough compliance reviews.' },
      { title: 'Statutory Records & Documentation', description: 'Support for maintaining relevant statutory records, registers, and required documentation.' },
      { title: 'Compliance Calendars', description: 'Develop and maintain compliance calendars to track recurring labour-related processes.' },
      { title: 'Wage & Workforce Compliance', description: 'Support for reviewing applicable wage, attendance, working-hour and workforce documentation requirements.' },
      { title: 'Inspection Preparation', description: 'Help organize documentation and prepare businesses for labour-related inspections or notices, within the applicable scope.' },
      { title: 'Corrective Action & Monitoring', description: 'Create recurring compliance tracking, implement corrective action plans, and establish reporting processes.' },
      { title: 'Display of Statutory Notices', description: 'Ensure all legally required abstracts, notices, and policies are properly displayed on premises.' },
      { title: 'Submissions of Annual Returns', description: 'Preparation and timely filing of mandatory annual and half-yearly labour returns.' },
      { title: 'Labour Welfare Fund (LWF)', description: 'Coordination and tracking of LWF deductions and submissions where applicable.' }
    ],
    audience: [
      { title: 'Manufacturing Companies', description: 'Factories managing permanent and contract workforces.' },
      { title: 'MSMEs', description: 'Businesses that do not have a dedicated compliance team.' },
      { title: 'Contractors', description: 'Organizations managing deployed manpower.' },
      { title: 'Growing Businesses', description: 'Companies establishing structured HR and compliance processes.' }
    ],
    deliverables: [
      'Compliance assessment',
      'Documentation checklist',
      'Compliance calendar',
      'Employee records review',
      'Monthly compliance tracking',
      'Compliance reports'
    ],
    commonGaps: [
      'Missing or incorrect statutory registers',
      'Wage and attendance record discrepancies',
      'Incorrect working hour computations',
      'Failure to display statutory notices',
      'Lapsed licenses or registrations'
    ],
    faqs: [
      { question: 'What is included in a compliance review?', answer: 'We assess your current registers, returns, and documentation against statutory requirements to identify any operational risks.' },
      { question: 'Do you handle the actual monthly filings?', answer: 'Yes, we provide ongoing compliance support which includes coordinating and preparing necessary recurring filings.' }
    ],
    relatedServices: ['factory-compliance', 'contract-labour-compliance', 'pf-esic-compliance'],
    ctaText: 'Request Compliance Assessment'
  },
  {
    slug: 'pf-esic-compliance',
    title: 'PF & ESIC Compliance Support',
    category: 'PF & ESIC',
    heroSupportingText: 'Practical support for managing PF and ESIC registration, employee processes, recurring compliance, records and statutory documentation.',
    trustLine: 'For factories, MSMEs, contractors and workforce-intensive organizations.',
    highlights: ['Registration Support', 'Monthly Compliance', 'Employee Records', 'Documentation', 'Compliance Review'],
    problemIntro: 'Managing PF and ESIC compliance requires strict adherence to timelines, accurate calculations, and precise employee data management.',
    problemList: [
      'Incorrect contribution calculations',
      'Missing employee KYC and UAN mapping',
      'Delayed or missed monthly filings',
      'Disorganized documentation and challans',
      'Handling employee corrections and exits'
    ],
    problemOutro: 'LabourAxis ensures your statutory contributions are managed accurately, on time, and with complete documentation.',
    services: [
      { title: 'Registration Assistance', description: 'PF/EPFO registration assistance and ESIC employer registration assistance for new and growing establishments.' },
      { title: 'Employee Processes', description: 'Comprehensive support for employee onboarding, UAN generation, ESIC IP registration, and exit updates.' },
      { title: 'Monthly Compliance Support', description: 'Coordination of monthly contribution data, timely challan generation, and filing for both PF and ESIC.' },
      { title: 'Records & Documentation', description: 'Maintenance of statutory registers, contribution records, and all required compliance documentation for both acts.' },
      { title: 'Corrections & Coordination', description: 'Assistance with joint declarations, profile corrections, and coordination with authorities where applicable for PF.' },
      { title: 'Compliance Review', description: 'Auditing past ESIC and PF contributions and records to identify and rectify discrepancies.' },
      { title: 'Employer Code Sub-code Generation', description: 'Assistance in generating sub-codes for branches or distinct units where required.' },
      { title: 'Accident Report Filing (ESIC)', description: 'Support in drafting and submitting timely accident reports to ESIC in case of workplace injuries.' },
      { title: 'Digital Signature (DSC) Mapping', description: 'Assistance with registering and mapping employer DSCs on the unified portals.' }
    ],
    audience: [
      { title: 'Factories', description: 'Manufacturing units with large workforces subject to mandatory coverage.' },
      { title: 'Contractors', description: 'Manpower suppliers requiring strict PF/ESIC adherence for principal employer clearance.' },
      { title: 'MSMEs', description: 'Growing businesses crossing the applicability threshold for the first time.' },
      { title: 'Retail & Logistics Chains', description: 'Businesses with multiple branches needing centralized PF/ESIC handling.' }
    ],
    deliverables: [
      'Registration certificates',
      'Monthly challans and ECRs',
      'Employee KYC status reports',
      'Statutory registers',
      'Compliance health reports'
    ],
    commonGaps: [
      'Incorrect employee information and KYC',
      'Missing or inconsistent records',
      'Delayed compliance activities',
      'Employee onboarding and exit update issues',
      'Contractor-related contribution inconsistencies'
    ],
    faqs: [
      { question: 'Do all businesses need PF and ESIC?', answer: 'Applicability depends on factors such as establishment type, employee headcount, and wage thresholds. We can conduct a specific assessment for your business.' },
      { question: 'Can LabourAxis handle monthly PF/ESIC compliance?', answer: 'Yes, we manage the entire monthly cycle from data preparation to challan generation.' },
      { question: 'Can you review our existing PF/ESIC compliance?', answer: 'Yes, subject to the engagement scope, we can audit past records to identify gaps.' },
      { question: 'Can you help if we receive a notice?', answer: 'We provide documentation, preparation, and coordination support, and clarify boundaries around legal representation where specialist advocates are required.' }
    ],
    relatedServices: ['labour-compliance', 'contract-labour-compliance', 'hr-consulting'],
    ctaText: 'Request PF/ESIC Consultation'
  },
  {
    slug: 'payroll-hr-operations',
    title: 'Payroll & HR Operations Support',
    category: 'Payroll & HR',
    heroSupportingText: 'Integrated support spanning payroll processing, HR operations, and statutory compliance coordination.',
    trustLine: 'More than just payroll processing. A unified approach to workforce management.',
    highlights: ['Attendance & Leave', 'Salary Coordination', 'Statutory Coordination', 'Employee Documentation', 'HR MIS'],
    problemIntro: 'Treating payroll as just a simple calculation often leads to compliance gaps and operational issues.',
    problemList: [
      'Disconnect between payroll, attendance, and leave records',
      'Inconsistent employee master data',
      'Failure to coordinate payroll with statutory (PF/ESIC) filings',
      'Messy employee documentation',
      'Lack of reliable HR MIS reporting'
    ],
    problemOutro: 'LabourAxis brings payroll, HR operations, and compliance together into one streamlined, reliable process.',
    services: [
      { title: 'Attendance & Leave', description: 'Structured tracking and processing of employee attendance and leave records.' },
      { title: 'Salary Processing & Coordination', description: 'Accurate salary processing that aligns with both operational realities and statutory requirements.' },
      { title: 'Employee Master Data', description: 'Centralized management and maintenance of accurate employee master records.' },
      { title: 'Payroll Records & Statutory', description: 'Maintaining compliant payroll records and seamlessly coordinating them with PF, ESIC, and labour filings.' },
      { title: 'Employee Documentation', description: 'Managing the complete lifecycle of employee paperwork from onboarding to exit.' },
      { title: 'HR MIS', description: 'Generating actionable HR and payroll reports for management.' },
      { title: 'Overtime & Shift Allowances', description: 'Accurate computation of overtime wages and shift allowances compliant with factory rules.' },
      { title: 'Full & Final (F&F) Settlement', description: 'Processing accurate final settlements for exiting employees including statutory dues.' },
      { title: 'Variable Pay & Incentives', description: 'Tracking and integrating production-linked incentives or performance variable pay into the payroll.' }
    ],
    audience: [
      { title: 'Factories', description: 'Handling complex shift-based attendance and varying wage structures.' },
      { title: 'MSMEs', description: 'Businesses needing a professional payroll and HR desk without hiring a full department.' },
      { title: 'Growing Businesses', description: 'Organizations looking to unify their fragmented HR and payroll processes.' },
      { title: 'Engineering & Construction', description: 'Managing variable site allowances and site-based attendance.' }
    ],
    deliverables: [
      'Processed salary sheets',
      'Attendance and leave summaries',
      'Statutory deduction reports',
      'Employee master data maintenance',
      'Monthly HR MIS'
    ],
    commonGaps: [
      'Processing salary without considering statutory deduction limits',
      'Misaligned PF/ESIC records and payroll sheets',
      'Inaccurate leave balance tracking',
      'Lack of proper payslips and wage registers'
    ],
    faqs: [
      { question: 'Do you just process the payroll software?', answer: 'No, we position our service as Payroll + HR Operations + Compliance. We ensure the data going in is accurate and the outputs meet statutory requirements.' },
      { question: 'Can you handle complex attendance structures?', answer: 'Yes, we specialize in workforce-intensive environments like factories which often have shift-based and varied wage structures.' }
    ],
    relatedServices: ['hr-consulting', 'labour-compliance', 'pf-esic-compliance'],
    ctaText: 'Discuss Your Payroll Requirements'
  },
  {
    slug: 'factory-compliance',
    title: 'Factory & Industrial Compliance Support',
    category: 'Factory Compliance',
    heroSupportingText: 'Comprehensive compliance assistance for factories, covering pre-operations setup and ongoing workforce documentation.',
    trustLine: 'For manufacturing businesses, engineering firms, and industrial setups.',
    highlights: ['Licensing Support', 'HR Setup', 'Statutory Registers', 'Ongoing Compliance', 'Audit Preparation'],
    problemIntro: 'Factory owners face unique and heavy compliance burdens before they can even start operations, and the requirements only grow as production scales.',
    problemList: [
      'Navigating complex registration and licensing requirements',
      'Setting up factory-specific HR policies',
      'Maintaining exhaustive statutory registers under the Factories Act',
      'Ensuring contractor compliance on the factory premises',
      'Preparing for unannounced labour inspections'
    ],
    problemOutro: 'LabourAxis provides structured support at every stage of your factory\'s lifecycle, from pre-operations to ongoing management.',
    services: [
      { title: 'Before Operations: Planning', description: 'Compliance planning and registration/licensing assistance where applicable to ensure you start on the right foot.' },
      { title: 'Before Operations: HR Setup', description: 'Establishing robust HR structures, policies, and workforce documentation frameworks for your new factory.' },
      { title: 'During Operations: Recurring', description: 'Managing ongoing and recurring statutory compliance, returns, and maintaining statutory documentation.' },
      { title: 'During Operations: Records', description: 'Managing comprehensive employee records and ensuring strict contractor compliance across the shop floor.' },
      { title: 'During Operations: Audits', description: 'Conducting regular compliance reviews and preparing documentation for labour inspections.' },
      { title: 'Standing Orders Drafting', description: 'Assisting in the drafting and certification process of industrial standing orders.' },
      { title: 'Building Plan Coordination', description: 'Coordinating documentation required for factory building plan approvals.' },
      { title: 'Inspectorate Notices Handling', description: 'Assisting in drafting compliant responses to notices from the Directorate of Industrial Safety and Health.' },
      { title: 'Safety Committee Formation', description: 'Supporting the legal structuring and documentation of mandatory safety and canteen committees.' }
    ],
    audience: [
      { title: 'Manufacturing Companies', description: 'Factories engaged in production requiring strict adherence to the Factories Act.' },
      { title: 'Industrial Setups', description: 'Warehouses, processing plants, and assembly units.' },
      { title: 'Engineering Firms', description: 'Units dealing with skilled and semi-skilled labour and hazardous processes.' },
      { title: 'Warehousing & Logistics', description: 'Large-scale storage facilities falling under factory or commercial acts.' }
    ],
    deliverables: [
      'Factory licenses and renewals',
      'Statutory registers and records',
      'Annual and half-yearly returns',
      'Compliance calendar',
      'Inspection readiness checklist'
    ],
    commonGaps: [
      'Expired licenses or unapproved plan variations',
      'Failure to file mandatory returns on time',
      'Incomplete contractor records leading to principal employer liability',
      'Improperly maintained wage and overtime registers'
    ],
    faqs: [
      { question: 'Do you help with inspection preparation?', answer: 'Yes, we conduct preliminary reviews and help organize your documentation to ensure you are prepared.' },
      { question: 'Can you assist with setting up a new factory?', answer: 'We support the HR and labour compliance aspects of pre-operations, including registrations and initial policy setup.' }
    ],
    relatedServices: ['labour-compliance', 'contract-labour-compliance', 'industrial-relations', 'pf-esic-compliance'],
    ctaText: 'Discuss Your Factory Compliance Requirements'
  },
  {
    slug: 'contract-labour-compliance',
    title: 'Contract Labour Compliance for Industrial Businesses',
    category: 'Contract Labour',
    heroSupportingText: 'Keep contractor compliance under control with systematic tracking, documentation, and auditing for principal employers.',
    trustLine: 'For principal employers, factories, and large organizations managing deployed manpower.',
    highlights: ['Contractor Tracking', 'Principal Employer Advisory', 'Record Audits', 'PF/ESIC Verification', 'Compliance Reports'],
    problemIntro: 'Managing contract labour compliance shouldn\'t become a monthly headache, but principal employers often face immense risk due to defaulting contractors.',
    problemList: [
      'Principal employer liability for contractor defaults',
      'Missing or unverified contractor wage records',
      'Unverified PF and ESIC contributions for contract workers',
      'Disorganized attendance and deployment records',
      'Lack of visibility into multiple contractors compliance status'
    ],
    problemOutro: 'LabourAxis implements tracking mechanisms and audits to minimize your risk and ensure your contractors remain compliant.',
    services: [
      { title: 'Contractor Onboarding', description: 'Establish clear compliance requirements and documentation standards during contractor onboarding.' },
      { title: 'Contract Worker Records', description: 'Ensure all contract workers have required KYC, onboarding docs, and valid ID cards.' },
      { title: 'Attendance & Wage Records', description: 'Verify contractor attendance data against gate records and audit wage registers for compliance.' },
      { title: 'PF / ESIC Coordination', description: 'Verify contractor challans, ECRs, and wage registers to ensure accurate statutory contributions.' },
      { title: 'Compliance Review & Audit', description: 'Conduct monthly or quarterly audits of contractor documentation before clearing bills.' },
      { title: 'Principal Employer Registration', description: 'Assistance in obtaining and modifying Principal Employer Certificates under the CLRA.' },
      { title: 'Contractor License Support', description: 'Guiding contractors in procuring necessary CLRA licenses based on deployed headcount.' },
      { title: 'Half-Yearly CLRA Returns', description: 'Preparation and submission of required principal employer returns.' },
      { title: 'Biometric Integration Advisory', description: 'Aligning contractor biometric data with principal employer attendance systems securely.' }
    ],
    audience: [
      { title: 'Principal Employers', description: 'Organizations engaging manpower through third-party contractors.' },
      { title: 'Factories', description: 'Manufacturing units utilizing contract labour for production or allied services.' },
      { title: 'Large Warehouses', description: 'Logistics hubs with high volumes of contract workers.' },
      { title: 'Infrastructure Projects', description: 'Large-scale sites relying heavily on layered sub-contractors.' }
    ],
    deliverables: [
      'Monthly contractor compliance reports',
      'Verification certificates for bill clearance',
      'Principal employer statutory registers',
      'Contractor audit summaries'
    ],
    commonGaps: [
      'Failure to verify contractor ECRs against actual deployed manpower',
      'Missing contractor licenses or principal employer registrations',
      'Inadequate record-keeping of contract worker attendance',
      'Clearing contractor bills without compliance verification'
    ],
    faqs: [
      { question: 'Why is contractor compliance important for principal employers?', answer: 'Principal employers can be held legally and financially liable for statutory defaults (like unpaid wages or PF) by their contractors.' },
      { question: 'Do you audit contractor bills?', answer: 'We audit the compliance documentation attached to the bills (like wage registers and challans) to advise on clearance.' }
    ],
    relatedServices: ['factory-compliance', 'labour-compliance', 'pf-esic-compliance'],
    ctaText: 'Request Contractor Compliance Review'
  },
  {
    slug: 'industrial-relations',
    title: 'Industrial Relations & Employee Relations Support',
    category: 'Industrial Relations',
    heroSupportingText: 'Professional support for managing workplace conflict, disciplinary processes, and worker-management communication.',
    trustLine: 'For factories, manufacturing businesses, and industrial HR departments.',
    highlights: ['Employee Relations', 'Grievance Handling', 'Disciplinary Processes', 'Conflict Management', 'Documentation'],
    problemIntro: 'Workplace conflict and disciplinary issues can quickly escalate if not handled methodically, fairly, and with proper documentation.',
    problemList: [
      'Workplace disputes and unaddressed grievances',
      'Improperly documented disciplinary actions',
      'Communication breakdown between workers and management',
      'Navigating show-cause notices and domestic inquiries',
      'Risk of escalating industrial disputes'
    ],
    problemOutro: 'LabourAxis helps you navigate complex workforce dynamics methodically, ensuring proper process adherence.',
    services: [
      { title: 'Employee Relations', description: 'Establish structured communication channels and engagement practices.' },
      { title: 'Grievance Handling', description: 'Setup formal grievance redressal mechanisms and support in resolving escalations.' },
      { title: 'Disciplinary Documentation', description: 'Assist with drafting show-cause notices, charge sheets, and guiding the disciplinary process documentation.' },
      { title: 'Workplace Conflict', description: 'Provide objective support in navigating disputes and conflicts on the shop floor.' },
      { title: 'Worker-Management Comms', description: 'Facilitate clear and documented communication between the workforce and management.' },
      { title: 'Industrial Relations Support', description: 'Strategic advice on maintaining harmonious IR while strictly maintaining the boundary of not providing formal legal representation.' },
      { title: 'Union Negotiation Strategy', description: 'Strategic advisory and data preparation for collective bargaining and union discussions.' },
      { title: 'Domestic Inquiry Coordination', description: 'Guiding internal committees on maintaining proper procedures during domestic inquiries.' },
      { title: 'Strike & Lockout Advisory', description: 'Providing crisis management documentation and procedural advice during industrial action.' }
    ],
    audience: [
      { title: 'Factories', description: 'Industrial units requiring structured IR frameworks.' },
      { title: 'Manufacturing Businesses', description: 'Organizations with unionized or large non-unionized blue-collar workforces.' },
      { title: 'HR Departments', description: 'Internal teams needing specialized support for complex disciplinary cases.' },
      { title: 'Principal Employers', description: 'Organizations managing complex dynamics between direct employees and contract workers.' }
    ],
    deliverables: [
      'Grievance redressal policy',
      'Drafts for disciplinary communications (warnings, notices)',
      'IR process documentation',
      'Consultation notes on conflict management'
    ],
    commonGaps: [
      'Terminating employees without following due process',
      'Failing to document verbal warnings or performance issues',
      'Lack of a formal grievance redressal committee',
      'Inconsistent application of standing orders or policies'
    ],
    faqs: [
      { question: 'Do you provide legal representation in labour courts?', answer: 'No. We provide consultancy, process support, and documentation. For legal representation, we coordinate with appropriately qualified advocates.' },
      { question: 'Can you help draft a show-cause notice?', answer: 'Yes, we assist management in drafting communications that adhere to established disciplinary procedures and standing orders.' }
    ],
    relatedServices: ['factory-compliance', 'hr-consulting'],
    ctaText: 'Request an IR Consultation'
  },
  {
    slug: 'compliance-audit',
    title: 'Labour Compliance Health Checks & Internal Reviews',
    category: 'Compliance Advisory',
    heroSupportingText: 'A proactive approach to identifying risks before they become costly penalties. We review your current compliance process and identify potential gaps.',
    trustLine: 'Designed for proactive businesses who want to eliminate hidden liabilities.',
    highlights: ['Review & Assess', 'Identify Gaps', 'Prioritize Risks', 'Corrective Actions', 'Improvement Tracking'],
    problemIntro: 'Most compliance issues go unnoticed until an inspection notice arrives or an employee raises a dispute.',
    problemList: [
      'Uncertainty about whether current records are fully compliant',
      'Hidden liabilities from contractor defaults',
      'Outdated policies that no longer meet statutory requirements',
      'Fear of unexpected labour inspections or notices'
    ],
    problemOutro: 'LabourAxis conducts comprehensive health checks to identify, prioritize, and resolve these gaps proactively.',
    services: [
      { title: '1. Review', description: 'Comprehensive review of your existing HR processes, statutory registers, and workforce documentation.' },
      { title: '2. Identify Gaps', description: 'Cross-referencing your records against current statutory requirements to spot discrepancies.' },
      { title: '3. Prioritize', description: 'Categorizing identified gaps based on risk severity and urgency.' },
      { title: '4. Recommend Actions', description: 'Providing practical, actionable steps to rectify each identified issue.' },
      { title: '5. Track Improvement', description: 'Establishing a monitoring process to ensure corrective actions are successfully implemented.' },
      { title: 'Pre-Inspection Mock Audits', description: 'Simulating a factory or labour inspection to ensure your team and documentation are prepared.' },
      { title: 'Contractor Deep-Dives', description: 'Intensive audits specifically targeting high-risk contractor portfolios.' },
      { title: 'PF/ESIC Liability Assessments', description: 'Analyzing past contribution data to uncover potential hidden financial liabilities.' },
      { title: 'Documentation Health Scoring', description: 'Providing an objective scorecard of your current record-keeping quality.' }
    ],
    audience: [
      { title: 'Growing MSMEs', description: 'Businesses that have scaled quickly and want to ensure their foundation is compliant.' },
      { title: 'Factories', description: 'Industrial units needing a third-party review of their exhaustive statutory obligations.' },
      { title: 'Principal Employers', description: 'Organizations wanting to audit their contractors to mitigate liability.' },
      { title: 'Investors & Acquirers', description: 'Entities conducting due diligence on target companies\' labour compliance health.' }
    ],
    deliverables: [
      'Comprehensive Compliance Assessment Report',
      'Risk Prioritization Matrix',
      'Corrective Action Plan',
      'Review Consultation'
    ],
    commonGaps: [
      'Assuming payroll software automatically ensures compliance',
      'Treating compliance as a one-time setup rather than a recurring requirement',
      'Ignoring contractor compliance until a problem occurs'
    ],
    faqs: [
      { question: 'What is a compliance health check?', answer: 'It is an internal audit where we review your HR and statutory records to identify any gaps or risks of non-compliance.' },
      { question: 'Do you share this report with authorities?', answer: 'No. This is strictly an internal review meant to help you improve your processes proactively.' }
    ],
    relatedServices: ['labour-compliance', 'pf-esic-compliance', 'factory-compliance'],
    ctaText: 'Request a Compliance Health Check'
  }
];
