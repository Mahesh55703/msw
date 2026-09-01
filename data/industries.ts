export type IndustryCategory = {
  title: string;
  items: string[];
};

export type Industry = {
  slug: string;
  title: string;
  shortDescription: string;
  hubRelevantServices: string[];
  heroH1: string;
  heroSupportingText: string;
  heroCtaText: string;
  challenges: { title: string; description: string }[];
  hrAndComplianceRequirements: IndustryCategory[];
  relevantServices: string[];
  whoWeSupport: string[];
  process: { step: string; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  relatedResources: string[];
  finalCtaTitle: string;
  finalCtaButtonText: string;
};

export const industriesData: Industry[] = [
  {
    slug: 'manufacturing',
    title: 'Manufacturing & Factories',
    shortDescription: 'HR, labour and statutory compliance support for manufacturing units, factories and industrial establishments.',
    hubRelevantServices: ['PF & ESIC', 'Factory Compliance', 'Contract Labour', 'Industrial Relations'],
    heroH1: 'HR & Labour Compliance for Manufacturing Companies',
    heroSupportingText: 'Practical support for factories and manufacturing businesses managing employees, contractors, payroll and recurring statutory compliance.',
    heroCtaText: 'Discuss Your Manufacturing HR Requirements',
    challenges: [
      { title: 'Shift-Based Workforce', description: 'Managing employee attendance, working hours, leave and payroll across shifts.' },
      { title: 'Contract Workforce', description: 'Maintaining proper contractor and contract-worker documentation.' },
      { title: 'Statutory Compliance', description: 'Keeping recurring statutory requirements and records organized.' },
      { title: 'Employee Relations', description: 'Managing grievances, disciplinary matters and worker-management communication.' },
      { title: 'Inspection Readiness', description: 'Maintaining documentation and processes needed when inspections or compliance reviews occur.' },
      { title: 'Workforce Documentation', description: 'Keeping employee and contractor records accurate and accessible.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Workforce Management',
        items: ['Employee documentation', 'Attendance', 'Leave', 'Shift records', 'Payroll']
      },
      {
        title: 'Statutory Compliance',
        items: ['PF / EPFO', 'ESIC', 'Applicable labour compliance', 'Statutory records']
      },
      {
        title: 'Contractor Workforce',
        items: ['Contractor documentation', 'Contract worker records', 'PF / ESIC coordination', 'Attendance and wage records']
      },
      {
        title: 'Industrial Relations',
        items: ['Employee relations', 'Grievances', 'Disciplinary processes', 'Worker-management communication']
      }
    ],
    relevantServices: ['factory-compliance', 'labour-compliance', 'pf-esic-compliance', 'contract-labour-compliance', 'payroll-hr-operations', 'industrial-relations'],
    whoWeSupport: [
      'Manufacturing companies', 'Factories', 'Industrial establishments', 'Engineering units',
      'Auto-component manufacturers', 'Production facilities', 'MSME manufacturers', 'Businesses with contract workforces'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand workforce structure and operational requirements.' },
      { step: '02', title: 'Assess', desc: 'Review HR and compliance processes.' },
      { step: '03', title: 'Identify', desc: 'Identify documentation and process gaps.' },
      { step: '04', title: 'Implement', desc: 'Support implementation and process organization.' },
      { step: '05', title: 'Monitor', desc: 'Track recurring requirements.' }
    ],
    faqs: [
      { question: 'What HR compliance challenges are common in manufacturing?', answer: 'Common challenges include shift-based attendance tracking, maintaining statutory registers, and managing contract worker documentation.' },
      { question: 'Do manufacturing businesses need contractor compliance support?', answer: 'Yes, principal employers can be held liable for statutory defaults by their contractors under the CLRA.' },
      { question: 'Can LabourAxis help with factory HR processes?', answer: 'Absolutely. We help set up HR structures, standing orders, and policies tailored to industrial environments.' },
      { question: 'Can you review PF and ESIC compliance?', answer: 'Yes, we conduct compliance health checks to identify and rectify historical discrepancies in contributions and records.' },
      { question: 'Can you help prepare documentation for inspections?', answer: 'Yes, we conduct mock audits and help organize documentation required by factory and labour inspectors.' },
      { question: 'Do you support contract workers?', answer: 'We ensure that your contractors maintain the necessary compliance records for deployed manpower.' }
    ],
    relatedResources: ['Factory Labour Compliance Checklist', 'Contractor Compliance Checklist', 'PF / ESIC Compliance Guide', 'Labour Inspection Preparation Guide', 'HR Documentation Checklist for Manufacturing'],
    finalCtaTitle: 'Need help managing factory HR or compliance?',
    finalCtaButtonText: 'Discuss Your Manufacturing Requirements'
  },
  {
    slug: 'construction',
    title: 'Construction & Infrastructure',
    shortDescription: 'Support for workforce documentation, contractor management, payroll and labour compliance across construction operations.',
    hubRelevantServices: ['Labour Compliance', 'Contract Labour', 'BOCW Compliance', 'PF & ESIC'],
    heroH1: 'HR & Labour Compliance for Construction Businesses',
    heroSupportingText: 'Support for workforce documentation, contractor management, payroll and labour compliance across construction operations.',
    heroCtaText: 'Discuss Your Construction Requirements',
    challenges: [
      { title: 'Project-Based Deployment', description: 'Managing high-turnover workforces moving across various construction sites.' },
      { title: 'Multi-Layered Contractors', description: 'Tracking compliance across sub-contractors and piece-rate workers.' },
      { title: 'BOCW Compliance', description: 'Adhering to the Building and Other Construction Workers Act requirements.' },
      { title: 'Site Attendance & Payroll', description: 'Capturing accurate attendance data from remote sites for payroll.' },
      { title: 'Statutory Registrations', description: 'Managing principal employer certificates and contractor licenses per site.' },
      { title: 'Workplace Safety Records', description: 'Maintaining required safety registers and accident report documentation.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Site Workforce Management',
        items: ['Site attendance tracking', 'Worker ID cards & KYC', 'Piece-rate wage records', 'Project-based payroll']
      },
      {
        title: 'Statutory Compliance',
        items: ['BOCW Act requirements', 'PF / EPFO & ESIC', 'Site-specific registrations', 'Labour welfare fund']
      },
      {
        title: 'Contractor Management',
        items: ['Principal Employer registrations', 'Contractor license tracking', 'Sub-contractor PF/ESIC verification', 'Bill clearance audits']
      },
      {
        title: 'Health & Safety Records',
        items: ['Accident registers', 'Safety committee documentation', 'Medical examination records', 'Muster rolls']
      }
    ],
    relevantServices: ['labour-compliance', 'contract-labour-compliance', 'payroll-hr-operations', 'pf-esic-compliance', 'hr-consulting'],
    whoWeSupport: [
      'Real estate developers', 'Infrastructure companies', 'Civil contractors', 'EPC contractors',
      'Road & highway builders', 'MEP contractors', 'Project management consultants', 'Large-scale sub-contractors'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand site locations, workforce structure and contractor layers.' },
      { step: '02', title: 'Assess', desc: 'Review existing contractor documentation and site compliance.' },
      { step: '03', title: 'Identify', desc: 'Identify unregistered contractors and statutory gaps.' },
      { step: '04', title: 'Implement', desc: 'Establish centralized contractor tracking and site documentation.' },
      { step: '05', title: 'Monitor', desc: 'Conduct monthly audits before bill clearance.' }
    ],
    faqs: [
      { question: 'How can construction businesses organize contract worker documentation?', answer: 'By establishing strict onboarding protocols at the site level, requiring KYC and PF/ESIC mapping before issuing gate passes.' },
      { question: 'What HR records should be maintained for workforce management?', answer: 'Muster rolls, wage registers, overtime registers, and records of advances/deductions are critical for site workers.' },
      { question: 'Can LabourAxis help with contractor compliance?', answer: 'Yes, we provide tracking and monthly verification of contractor challans and wage registers before bill clearance.' },
      { question: 'Does BOCW apply to all construction projects?', answer: 'BOCW applicability depends on the number of workers and the nature of the establishment; we help assess and fulfill these specific requirements.' },
      { question: 'How do we handle PF for highly transient labour?', answer: 'We assist in streamlining UAN generation and linking to ensure contributions are properly tracked despite high turnover.' },
      { question: 'Do you assist with principal employer registrations?', answer: 'Yes, we assist in obtaining the necessary certificates under CLRA and BOCW for your project sites.' }
    ],
    relatedResources: ['Contract Labour Checklist', 'Workforce Documentation Guide', 'Payroll Compliance Checklist', 'BOCW Compliance Overview', 'Principal Employer Liability Guide'],
    finalCtaTitle: 'Need help with workforce and labour compliance?',
    finalCtaButtonText: 'Discuss Your Requirements'
  },
  {
    slug: 'logistics-warehousing',
    title: 'Logistics & Warehousing',
    shortDescription: 'Compliance and HR solutions for warehouses, distribution centers, and logistics operators.',
    hubRelevantServices: ['Contract Labour', 'Payroll Operations', 'PF & ESIC', 'Labour Compliance'],
    heroH1: 'HR & Labour Compliance for Logistics & Warehousing',
    heroSupportingText: 'Practical support for 3PLs, distribution centers, and warehouses managing 24/7 operations, contract labour, and complex statutory requirements.',
    heroCtaText: 'Discuss Your Logistics Requirements',
    challenges: [
      { title: '24/7 Shift Management', description: 'Handling complex shift rosters, night shifts, and overtime calculations.' },
      { title: 'Heavy Reliance on Contractors', description: 'Managing compliance for loaders, drivers, and warehouse staff sourced via agencies.' },
      { title: 'Geographically Dispersed Workforce', description: 'Tracking HR and compliance across multiple hubs and distribution centers.' },
      { title: 'High Attrition Rates', description: 'Streamlining continuous onboarding, UAN generation, and exit processes.' },
      { title: 'Minimum Wage Variances', description: 'Ensuring compliance with varying state minimum wages across different warehouse locations.' },
      { title: 'Transport Worker Regulations', description: 'Navigating specific compliance rules applicable to drivers and transport workers.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Warehouse HR Operations',
        items: ['Roster management', 'Overtime tracking', 'Leave administration', 'Multi-location payroll']
      },
      {
        title: 'Statutory Compliance',
        items: ['Shops & Establishments / Factory Act applicability', 'PF / ESIC centralized handling', 'State minimum wages', 'Statutory registers']
      },
      {
        title: 'Contract Workforce',
        items: ['Agency compliance verification', 'Loader/packer documentation', 'Attendance integration', 'Bill auditing']
      },
      {
        title: 'Employee Relations',
        items: ['Grievance handling', 'Disciplinary actions for pilferage/absenteeism', 'Worker engagement', 'Safety compliance']
      }
    ],
    relevantServices: ['contract-labour-compliance', 'payroll-hr-operations', 'pf-esic-compliance', 'labour-compliance', 'hr-consulting'],
    whoWeSupport: [
      'Warehouses', '3PL companies', 'Transport businesses', 'Distribution centers',
      'Logistics operators', 'Workforce contractors', 'E-commerce fulfillment centers', 'Cold storage facilities'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand the hub-and-spoke model and workforce distribution.' },
      { step: '02', title: 'Assess', desc: 'Review agency contracts, payroll structures, and state-specific compliance.' },
      { step: '03', title: 'Identify', desc: 'Identify minimum wage gaps and unregistered contract workers.' },
      { step: '04', title: 'Implement', desc: 'Standardize HR policies across all locations.' },
      { step: '05', title: 'Monitor', desc: 'Provide centralized compliance tracking and reporting.' }
    ],
    faqs: [
      { question: 'Are warehouses covered under the Factories Act or Shops & Establishments?', answer: 'It depends on the activities performed (e.g., packaging/re-packing may attract the Factories Act). We provide a specific assessment.' },
      { question: 'How do you handle compliance across different states?', answer: 'We maintain state-specific compliance calendars and track varying minimum wage notifications for multi-location operators.' },
      { question: 'Can you help audit our manpower supply agencies?', answer: 'Yes, we conduct monthly audits of their PF/ESIC challans and wage registers before you clear their invoices.' },
      { question: 'Do you help with night shift compliance?', answer: 'Yes, we assist in ensuring proper approvals, safety measures, and allowances are documented for night operations.' },
      { question: 'What about compliance for transport drivers?', answer: 'We help navigate the specific working hour and documentation requirements applicable to motor transport workers.' },
      { question: 'Can you process payroll for a high-turnover workforce?', answer: 'Yes, we streamline the onboarding and F&F settlement processes to handle high attrition seamlessly.' }
    ],
    relatedResources: ['Warehouse HR Checklist', 'Contractor Compliance Guide', 'Payroll & Attendance Checklist', 'Multi-State Compliance Guide', 'Minimum Wage Tracker Template'],
    finalCtaTitle: 'Looking to organize workforce compliance?',
    finalCtaButtonText: 'Request a Consultation'
  },
  {
    slug: 'engineering',
    title: 'Engineering & Industrial',
    shortDescription: 'Tailored compliance and HR processes for heavy engineering, fabrication, and industrial setups.',
    hubRelevantServices: ['Factory Compliance', 'Labour Compliance', 'PF & ESIC', 'Industrial Relations'],
    heroH1: 'HR & Labour Compliance for Engineering Firms',
    heroSupportingText: 'Navigating the complex statutory requirements, skilled labour management, and factory compliance for heavy engineering and industrial setups.',
    heroCtaText: 'Discuss Your Engineering HR Requirements',
    challenges: [
      { title: 'Skilled Labour Management', description: 'Retaining and managing records for highly skilled technicians and welders.' },
      { title: 'Safety Documentation', description: 'Maintaining rigorous safety training records and accident registers.' },
      { title: 'Apprentice Compliance', description: 'Managing compliance under the Apprentices Act.' },
      { title: 'Standing Orders', description: 'Enforcing certified standing orders for industrial discipline.' },
      { title: 'Overtime Calculations', description: 'Strictly adhering to Factories Act limits and calculations for overtime.' },
      { title: 'Inspectorate Scrutiny', description: 'Preparing for stringent inspections by industrial safety and health authorities.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Workforce Operations',
        items: ['Skilled worker documentation', 'Apprentice records', 'Training logs', 'Shift scheduling']
      },
      {
        title: 'Factory Compliance',
        items: ['Factory license renewals', 'Annual returns', 'Safety committee records', 'Accident reporting']
      },
      {
        title: 'Statutory Payroll',
        items: ['Overtime registers', 'PF/ESIC for skilled workers', 'Bonus calculations', 'Wage slip generation']
      },
      {
        title: 'Industrial Relations',
        items: ['Standing orders implementation', 'Disciplinary actions', 'Union interactions', 'Grievance channels']
      }
    ],
    relevantServices: ['factory-compliance', 'labour-compliance', 'industrial-relations', 'pf-esic-compliance', 'payroll-hr-operations'],
    whoWeSupport: [
      'Heavy engineering firms', 'Fabrication units', 'Capital goods manufacturers', 'Machining centers',
      'Industrial equipment suppliers', 'Foundries', 'Forging plants', 'Tool rooms'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand production processes, skill levels, and factory layout.' },
      { step: '02', title: 'Assess', desc: 'Review factory registers, safety records, and overtime practices.' },
      { step: '03', title: 'Identify', desc: 'Identify gaps in apprentice compliance and standing orders.' },
      { step: '04', title: 'Implement', desc: 'Establish robust factory documentation and HR policies.' },
      { step: '05', title: 'Monitor', desc: 'Track license renewals and return filing deadlines.' }
    ],
    faqs: [
      { question: 'Do you assist with Apprentice Act compliance?', answer: 'Yes, we help manage the documentation, stipends, and portal updates required for engaged apprentices.' },
      { question: 'Can you draft standing orders?', answer: 'We assist in drafting standing orders tailored to your engineering operations and support the certification process.' },
      { question: 'How do you handle complex overtime structures?', answer: 'We ensure overtime is calculated strictly at twice the ordinary rate of wages as per the Factories Act.' },
      { question: 'Do you provide safety training?', answer: 'We focus on the HR and compliance documentation side—ensuring records of training and safety committees are perfectly maintained.' },
      { question: 'Can you review our factory registers?', answer: 'Yes, we conduct mock inspections to ensure all physical and digital registers are up to date.' },
      { question: 'Do you help with industrial disputes?', answer: 'We provide strategic advice, proper disciplinary documentation, and grievance handling to prevent escalations.' }
    ],
    relatedResources: ['Factory Register Checklist', 'Standing Orders Guide', 'Apprentice Compliance Overview', 'Inspection Readiness Checklist', 'Overtime Calculation Guide'],
    finalCtaTitle: 'Need help with industrial HR & compliance?',
    finalCtaButtonText: 'Discuss Your Requirements'
  },
  {
    slug: 'automotive',
    title: 'Automotive & Auto Components',
    shortDescription: 'Fast-paced HR operations and strict compliance tracking for the automotive supply chain.',
    hubRelevantServices: ['Labour Compliance', 'PF & ESIC', 'Factory Compliance', 'Payroll Operations'],
    heroH1: 'HR & Labour Compliance for Automotive Suppliers',
    heroSupportingText: 'Streamlined HR operations and compliance for auto component manufacturers facing strict OEM audits and high production demands.',
    heroCtaText: 'Discuss Your Automotive HR Requirements',
    challenges: [
      { title: 'OEM Compliance Audits', description: 'Meeting the stringent social and labour compliance standards demanded by OEMs.' },
      { title: 'Production-Linked Wages', description: 'Managing complex incentive structures tied to production targets.' },
      { title: 'High Volume Attrition', description: 'Handling rapid onboarding and offboarding on the assembly line.' },
      { title: 'Trainee & NEEM Compliance', description: 'Properly documenting and managing trainees and apprentices.' },
      { title: 'Contract Labour Dependence', description: 'Ensuring agency workers are compliant to prevent production halts.' },
      { title: 'Strict Shift Handovers', description: 'Tracking attendance and overtime precisely across continuous shifts.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'OEM Audit Readiness',
        items: ['Social compliance records', 'Supplier code of conduct adherence', 'Transparent wage records', 'No child/forced labour documentation']
      },
      {
        title: 'Workforce Operations',
        items: ['Production-linked payroll', 'NEEM/Apprentice tracking', 'Rapid onboarding', 'Shift allowance tracking']
      },
      {
        title: 'Statutory Compliance',
        items: ['PF/ESIC on incentives', 'Factory Act compliance', 'LWF contributions', 'Maternity benefit records']
      },
      {
        title: 'Contractor Management',
        items: ['Principal employer duties', 'Verification of contractor ECRs', 'Agency licensing', 'Gate pass control']
      }
    ],
    relevantServices: ['labour-compliance', 'factory-compliance', 'payroll-hr-operations', 'contract-labour-compliance', 'compliance-audit'],
    whoWeSupport: [
      'Tier 1 & Tier 2 Auto Suppliers', 'Assembly plants', 'Component manufacturers', 'Die casting units',
      'Automotive electronics makers', 'Rubber & plastic molders', 'Machined parts suppliers', 'OEMs'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand production cycles and OEM audit requirements.' },
      { step: '02', title: 'Assess', desc: 'Conduct a pre-audit review of existing social and labour compliance.' },
      { step: '03', title: 'Identify', desc: 'Identify risks related to contractor defaults or wage discrepancies.' },
      { step: '04', title: 'Implement', desc: 'Standardize records to instantly satisfy OEM auditor requests.' },
      { step: '05', title: 'Monitor', desc: 'Maintain continuous readiness through monthly health checks.' }
    ],
    faqs: [
      { question: 'Can you help us prepare for an OEM social compliance audit?', answer: 'Yes, this is a core strength. We ensure your statutory registers, wage records, and contractor docs meet strict OEM standards.' },
      { question: 'How do you handle PF on production incentives?', answer: 'We provide guidance on correctly structuring wages and incentives to optimize operations while remaining fully compliant with PF rules.' },
      { question: 'Do you manage trainee compliance?', answer: 'Yes, we help properly document trainees, apprentices, and NEEM scheme workers to avoid them being misclassified as regular employees.' },
      { question: 'Can you verify our manpower agencies?', answer: 'Absolutely. We conduct rigorous monthly checks on your agencies before you clear their bills.' },
      { question: 'Do you handle payroll for large assembly teams?', answer: 'Yes, we process payroll integrating biometric attendance, overtime, and varied shift allowances.' },
      { question: 'What if we receive a notice from the labour department?', answer: 'We assist with gathering documentation and drafting compliant responses to mitigate risks.' }
    ],
    relatedResources: ['OEM Audit Readiness Checklist', 'Incentive Wage Compliance Guide', 'Contractor Management Checklist', 'Trainee Documentation Guide', 'Factory Compliance Overview'],
    finalCtaTitle: 'Preparing for an audit or scaling production?',
    finalCtaButtonText: 'Discuss Your Requirements'
  },
  {
    slug: 'hospitality',
    title: 'Hospitality',
    shortDescription: 'HR operations, payroll, and compliance tailored to the 24/7 service demands of hotels and restaurants.',
    hubRelevantServices: ['HR Operations', 'Payroll', 'PF & ESIC', 'Labour Compliance'],
    heroH1: 'HR & Labour Compliance for the Hospitality Sector',
    heroSupportingText: 'Tailored HR operations, payroll, and compliance support for hotels, resorts, and restaurant chains managing dynamic, 24/7 workforces.',
    heroCtaText: 'Discuss Your Hospitality Requirements',
    challenges: [
      { title: 'Variable Working Hours', description: 'Managing split shifts, weekend work, and compensatory offs.' },
      { title: 'Service Charge & Tips', description: 'Structuring wages properly around service charges and tips.' },
      { title: 'High Turnover', description: 'Streamlining constant hiring, uniform tracking, and F&F settlements.' },
      { title: 'Statutory Registrations', description: 'Navigating Shops & Establishments Act compliance across locations.' },
      { title: 'Contract Housekeeping', description: 'Managing compliance for outsourced security and housekeeping staff.' },
      { title: 'Employee Grievances', description: 'Handling fast-paced employee relations in high-stress service environments.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Hospitality HR Operations',
        items: ['Split-shift attendance', 'Uniform and asset tracking', 'Food & beverage allowances', 'Rapid onboarding']
      },
      {
        title: 'Payroll Management',
        items: ['Service charge distribution', 'Statutory minimum wages', 'Variable pay', 'F&F settlements']
      },
      {
        title: 'Statutory Compliance',
        items: ['Shops & Establishments', 'PF & ESIC registration/filing', 'LWF contributions', 'Statutory registers']
      },
      {
        title: 'Vendor Management',
        items: ['Security agency compliance', 'Housekeeping vendor audits', 'Valet service compliance', 'Principal employer records']
      }
    ],
    relevantServices: ['hr-consulting', 'payroll-hr-operations', 'pf-esic-compliance', 'labour-compliance', 'contract-labour-compliance'],
    whoWeSupport: [
      'Hotels & Resorts', 'Restaurant Chains', 'QSR (Quick Service Restaurants)', 'Catering Companies',
      'Clubs & Lounges', 'Facility Management in Hospitality', 'Cloud Kitchens', 'Event Management Firms'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand branch locations, service hours, and wage structures.' },
      { step: '02', title: 'Assess', desc: 'Review existing employment contracts and minimum wage adherence.' },
      { step: '03', title: 'Identify', desc: 'Identify gaps in split-shift documentation and PF/ESIC.' },
      { step: '04', title: 'Implement', desc: 'Roll out standardized HR policies for front and back-of-house staff.' },
      { step: '05', title: 'Monitor', desc: 'Manage centralized payroll and monthly compliance.' }
    ],
    faqs: [
      { question: 'Do you help with Shops & Establishments registrations?', answer: 'Yes, we assist in obtaining and renewing registrations for all your restaurant or hotel branches.' },
      { question: 'How do you handle payroll with high turnover?', answer: 'We set up structured onboarding and exit processes so F&F settlements and PF exits are processed quickly and accurately.' },
      { question: 'Can you audit our housekeeping vendors?', answer: 'Yes, we ensure your outsourced facility management vendors are compliant, protecting you as the principal employer.' },
      { question: 'Are tips and service charges subject to PF?', answer: 'Wages structuring in hospitality is complex; we provide guidance on what components attract statutory deductions.' },
      { question: 'Do you provide HR policies for hotels?', answer: 'We draft tailored employee handbooks covering grooming standards, split shifts, leaves, and uniform policies.' },
      { question: 'Can you handle multi-state restaurant chains?', answer: 'Absolutely. We manage state-specific compliance and centralized payroll for chains operating across regions.' }
    ],
    relatedResources: ['Hospitality HR Policy Checklist', 'Multi-Location Compliance Guide', 'Vendor Compliance Checklist', 'F&F Settlement Process Guide', 'Minimum Wage Tracker'],
    finalCtaTitle: 'Need structured HR for your hospitality business?',
    finalCtaButtonText: 'Request a Consultation'
  },
  {
    slug: 'healthcare',
    title: 'Healthcare',
    shortDescription: 'HR and compliance solutions for hospitals, clinics, and diagnostic centers.',
    hubRelevantServices: ['Labour Compliance', 'Payroll Operations', 'PF & ESIC', 'HR Consulting'],
    heroH1: 'HR & Labour Compliance for Healthcare Institutions',
    heroSupportingText: 'Specialized support for hospitals, clinics, and diagnostic centers managing clinical staff, administrative teams, and 24/7 operations.',
    heroCtaText: 'Discuss Your Healthcare HR Requirements',
    challenges: [
      { title: 'Varied Employment Types', description: 'Managing full-time staff, visiting consultants, and contract workers.' },
      { title: '24/7 Operations', description: 'Tracking attendance, night shifts, and nursing staff rosters.' },
      { title: 'Professional Tax & TDS', description: 'Structuring payouts for retained doctors vs. salaried employees.' },
      { title: 'Contract Security & Ward Boys', description: 'Ensuring strict compliance for outsourced manpower.' },
      { title: 'Statutory Inspections', description: 'Maintaining rigorous documentation for Shops & Establishments and Labour inspections.' },
      { title: 'Employee Grievances', description: 'Handling HR operations in a high-stress, critical-care environment.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Clinical & Admin HR',
        items: ['Consultant contracts', 'Nursing rosters', 'Credential tracking integration', 'Leave management']
      },
      {
        title: 'Payroll & Taxation',
        items: ['Professional fee processing', 'Standard payroll for admin', 'Overtime calculation', 'Shift allowances']
      },
      {
        title: 'Statutory Compliance',
        items: ['PF/ESIC for eligible staff', 'Professional Tax (PT)', 'LWF', 'Maternity benefit compliance']
      },
      {
        title: 'Facility Management',
        items: ['Security guard compliance audits', 'Housekeeping agency tracking', 'Ambulance driver documentation', 'Principal employer duties']
      }
    ],
    relevantServices: ['hr-consulting', 'payroll-hr-operations', 'labour-compliance', 'pf-esic-compliance', 'contract-labour-compliance'],
    whoWeSupport: [
      'Hospitals', 'Multi-Specialty Clinics', 'Diagnostic Centers', 'Pathology Labs',
      'Nursing Homes', 'Dental Chains', 'Healthcare Tech Startups', 'Wellness Centers'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand the mix of consultants, on-roll staff, and outsourced workers.' },
      { step: '02', title: 'Assess', desc: 'Review consultant agreements versus employment contracts for compliance risks.' },
      { step: '03', title: 'Identify', desc: 'Identify gaps in nursing shift records and agency compliance.' },
      { step: '04', title: 'Implement', desc: 'Structure clear HR policies and segregated payroll processing.' },
      { step: '05', title: 'Monitor', desc: 'Track ongoing statutory filings and agency challans.' }
    ],
    faqs: [
      { question: 'How do you handle payouts for visiting doctors?', answer: 'We help structure processes to clearly differentiate professional fees (consultants) from standard salaried payroll.' },
      { question: 'Do hospitals fall under the Shops & Establishments Act?', answer: 'Yes, in most states, clinical establishments must register and comply with local S&E rules. We manage this for you.' },
      { question: 'Can you manage payroll for shift-based nursing staff?', answer: 'We excel at processing complex shift-based attendance, night allowances, and overtime for clinical staff.' },
      { question: 'How do we ensure our ward boys (from an agency) are compliant?', answer: 'We audit the agency’s monthly PF and ESIC challans to ensure they are depositing contributions for the staff deployed at your hospital.' },
      { question: 'Do you help with Maternity Benefit Act compliance?', answer: 'Yes, we provide guidance on maintaining required records and processing maternity leave benefits accurately.' },
      { question: 'Can you draft an employee handbook for a clinic?', answer: 'We draft tailored HR policies covering patient-confidentiality, code of conduct, leave, and shift policies.' }
    ],
    relatedResources: ['Healthcare HR Policy Guide', 'Consultant vs Employee Compliance', 'Agency Verification Checklist', 'Shift Payroll Guide', 'Maternity Compliance Overview'],
    finalCtaTitle: 'Need to organize HR operations in your hospital?',
    finalCtaButtonText: 'Discuss Your Requirements'
  },
  {
    slug: 'education',
    title: 'Education',
    shortDescription: 'Streamlined HR, payroll, and compliance for schools, colleges, and EdTech companies.',
    hubRelevantServices: ['Payroll Operations', 'PF & ESIC', 'HR Consulting', 'Labour Compliance'],
    heroH1: 'HR & Labour Compliance for Educational Institutions',
    heroSupportingText: 'Professional HR operations and statutory compliance support for schools, colleges, universities, and educational organizations.',
    heroCtaText: 'Discuss Your Educational HR Requirements',
    challenges: [
      { title: 'Academic vs Admin Staff', description: 'Managing different leave, vacation, and payroll structures for teachers vs. support staff.' },
      { title: 'PF Applicability', description: 'Navigating specific PF rules and exemptions applicable to educational institutions.' },
      { title: 'Contractual Staffing', description: 'Managing compliance for outsourced transport, security, and cleaning staff.' },
      { title: 'Seasonal Hiring', description: 'Handling bulk onboarding before the academic year begins.' },
      { title: 'Gratuity & F&F', description: 'Managing complex full and final settlements for retiring or departing faculty.' },
      { title: 'Regulatory Scrutiny', description: 'Maintaining immaculate records for university or board affiliation inspections.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Institutional HR',
        items: ['Faculty appointment letters', 'Vacation leave policies', 'Performance appraisal frameworks', 'Background verification tracking']
      },
      {
        title: 'Payroll & Statutory',
        items: ['Distinct salary structures', 'PF / EPFO management', 'Professional Tax', 'Gratuity calculations']
      },
      {
        title: 'Outsourced Services',
        items: ['Bus driver / conductor compliance', 'Security agency audits', 'Housekeeping vendor tracking', 'Principal employer registration']
      },
      {
        title: 'Record Keeping',
        items: ['Statutory registers', 'Employee service books', 'Affiliation audit readiness', 'Attendance records']
      }
    ],
    relevantServices: ['hr-consulting', 'payroll-hr-operations', 'pf-esic-compliance', 'labour-compliance', 'contract-labour-compliance'],
    whoWeSupport: [
      'K-12 Schools', 'Colleges & Universities', 'Coaching Institutes', 'EdTech Companies',
      'Vocational Training Centers', 'Pre-schools & Daycares', 'Group of Institutions', 'Skill Development Centers'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand the academic calendar and staffing structure.' },
      { step: '02', title: 'Assess', desc: 'Review faculty contracts, PF applicability, and vendor compliance.' },
      { step: '03', title: 'Identify', desc: 'Identify gaps in statutory registers required for board affiliations.' },
      { step: '04', title: 'Implement', desc: 'Establish distinct HR policies for teaching and non-teaching staff.' },
      { step: '05', title: 'Monitor', desc: 'Manage monthly payroll and vendor audits.' }
    ],
    faqs: [
      { question: 'Are schools required to register for PF?', answer: 'Yes, educational institutions are generally covered under the EPF Act subject to headcount thresholds. We manage the entire process.' },
      { question: 'How do you handle vacations in payroll?', answer: 'We configure the payroll and leave management system to account for academic vacations distinct from standard earned leaves.' },
      { question: 'Can you help us audit our school bus contractors?', answer: 'Yes, we verify that your transport contractors are depositing PF/ESIC for the drivers and conductors.' },
      { question: 'Do you help draft appointment letters for faculty?', answer: 'We draft legally vetted appointment letters clearly outlining probation, notice periods, and academic duties.' },
      { question: 'Can you assist with gratuity calculations for retiring teachers?', answer: 'Yes, we calculate and process statutory gratuity and F&F settlements accurately.' },
      { question: 'Do you help with board affiliation inspections?', answer: 'We ensure that all staff records, payroll registers, and statutory documents are perfectly organized for affiliation audits.' }
    ],
    relatedResources: ['Educational HR Policy Checklist', 'School Vendor Audit Guide', 'PF Applicability for Schools', 'Faculty Appointment Template', 'Gratuity Calculation Guide'],
    finalCtaTitle: 'Organizing HR for your institution?',
    finalCtaButtonText: 'Request a Consultation'
  },
  {
    slug: 'retail',
    title: 'Retail & Commercial Businesses',
    shortDescription: 'Multi-location compliance and HR operations for retail chains and commercial establishments.',
    hubRelevantServices: ['Labour Compliance', 'Payroll Operations', 'PF & ESIC', 'HR Consulting'],
    heroH1: 'HR & Labour Compliance for Retail Businesses',
    heroSupportingText: 'Centralized payroll, multi-state compliance, and HR operations for retail chains, showrooms, and commercial businesses.',
    heroCtaText: 'Discuss Your Retail HR Requirements',
    challenges: [
      { title: 'Multi-Location Compliance', description: 'Managing Shops & Establishments registrations across different states and cities.' },
      { title: 'High Store Attrition', description: 'Streamlining constant hiring, store transfers, and fast F&F settlements.' },
      { title: 'Variable Minimum Wages', description: 'Tracking and implementing different state minimum wages for store staff.' },
      { title: 'Store Attendance', description: 'Centralizing attendance data from multiple retail outlets for payroll.' },
      { title: 'Incentive-Based Pay', description: 'Processing sales incentives correctly alongside statutory deductions.' },
      { title: 'Display of Notices', description: 'Ensuring every store displays the mandatory statutory abstracts to avoid penalties.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Multi-State Compliance',
        items: ['Shops & Establishments renewals', 'State minimum wage tracking', 'Local holiday calendars', 'Statutory notice displays']
      },
      {
        title: 'Retail Payroll',
        items: ['Sales incentive processing', 'Centralized attendance integration', 'Deduction management', 'Store-wise payroll reports']
      },
      {
        title: 'Workforce Operations',
        items: ['Rapid onboarding processes', 'Store transfer documentation', 'Uniform policies', 'Background verification']
      },
      {
        title: 'Statutory Filings',
        items: ['Centralized PF & ESIC', 'Professional Tax (PT)', 'Labour Welfare Fund (LWF)', 'Annual returns']
      }
    ],
    relevantServices: ['labour-compliance', 'payroll-hr-operations', 'pf-esic-compliance', 'hr-consulting', 'compliance-audit'],
    whoWeSupport: [
      'Retail Chains', 'Showrooms', 'Supermarkets', 'Apparel Brands',
      'Consumer Electronics Retailers', 'F&B Outlets', 'Commercial Offices', 'Franchise Operators'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand the store footprint, expansion plans, and sales incentive structures.' },
      { step: '02', title: 'Assess', desc: 'Audit current S&E registrations and minimum wage adherence across locations.' },
      { step: '03', title: 'Identify', desc: 'Identify lapsed licenses or stores missing mandatory statutory displays.' },
      { step: '04', title: 'Implement', desc: 'Centralize payroll processing and establish standard onboarding SOPs.' },
      { step: '05', title: 'Monitor', desc: 'Maintain a central compliance dashboard and track state-wise deadlines.' }
    ],
    faqs: [
      { question: 'Can you manage Shops & Establishments registrations across states?', answer: 'Yes, we handle the registration, amendment, and renewal of S&E licenses for all your store locations.' },
      { question: 'How do you keep up with varying minimum wages?', answer: 'We actively track minimum wage notifications across states and advise you on required salary revisions.' },
      { question: 'Do you process sales incentives?', answer: 'We process complex payrolls integrating fixed pay, attendance deductions, and variable sales incentives.' },
      { question: 'Can you help ensure our stores are inspection-ready?', answer: 'We provide physical display kits (statutory notices) and maintain digital registers centrally so every store is compliant.' },
      { question: 'How do you handle store transfers?', answer: 'We establish HR processes to seamlessly update PT, LWF, and internal records when employees move between branches.' },
      { question: 'Do you help with PF sub-codes for different branches?', answer: 'Yes, if required for administrative ease, we can assist in generating and managing PF sub-codes.' }
    ],
    relatedResources: ['Retail Multi-State Compliance Guide', 'Store Inspection Checklist', 'Minimum Wage Tracker', 'Retail HR Policy Template', 'Incentive Pay Compliance Guide'],
    finalCtaTitle: 'Scaling your retail footprint?',
    finalCtaButtonText: 'Discuss Your Requirements'
  },
  {
    slug: 'msmes',
    title: 'MSMEs & Growing Businesses',
    shortDescription: 'Foundational HR setup, payroll, and compliance advisory for growing MSMEs scaling their workforce.',
    hubRelevantServices: ['HR Consulting', 'Payroll Operations', 'Compliance Audit', 'PF & ESIC'],
    heroH1: 'HR & Labour Compliance for Growing MSMEs',
    heroSupportingText: 'Professional HR setup, payroll management, and foundational compliance support for MSMEs transitioning from informal to structured operations.',
    heroCtaText: 'Discuss Your MSME Requirements',
    challenges: [
      { title: 'Lack of Formal HR', description: 'Operating without an employee handbook, structured policies, or appointment letters.' },
      { title: 'Crossing Statutory Thresholds', description: 'Navigating the sudden compliance burden when headcount crosses 10 or 20 employees.' },
      { title: 'Founder Dependency', description: 'Founders spending too much time processing payroll and resolving basic HR queries.' },
      { title: 'Unorganized Records', description: 'Maintaining employee files and leave records on disjointed spreadsheets.' },
      { title: 'Compliance Uncertainty', description: 'Not knowing which labour laws apply to the business.' },
      { title: 'Attracting Talent', description: 'Struggling to project a professional corporate image to new hires.' }
    ],
    hrAndComplianceRequirements: [
      {
        title: 'Foundational HR Setup',
        items: ['Employee handbooks', 'Offer & appointment letters', 'Leave policies', 'Standard operating procedures']
      },
      {
        title: 'Statutory Registration',
        items: ['Shops & Establishments', 'First-time PF/ESIC registration', 'Professional Tax enrollment', 'MSME/Udyam advisory']
      },
      {
        title: 'Managed Payroll',
        items: ['Professional salary processing', 'Statutory deductions', 'Digital payslips', 'F&F settlements']
      },
      {
        title: 'Compliance Advisory',
        items: ['Applicability health checks', 'Ongoing statutory filings', 'Record keeping setup', 'Basic grievance mechanisms']
      }
    ],
    relevantServices: ['hr-consulting', 'payroll-hr-operations', 'compliance-audit', 'pf-esic-compliance', 'labour-compliance'],
    whoWeSupport: [
      'Tech Startups', 'Growing Service Agencies', 'Small Manufacturing Units', 'Trading Companies',
      'Professional Services Firms', 'Boutique Consultancies', 'Family-Owned Businesses Scaling Up', 'E-commerce Sellers'
    ],
    process: [
      { step: '01', title: 'Understand', desc: 'Understand the business goals, current headcount, and informal practices.' },
      { step: '02', title: 'Assess', desc: 'Conduct a health check to determine which labour laws currently apply.' },
      { step: '03', title: 'Identify', desc: 'Identify immediate risks, such as missing contracts or unregistered statutory liabilities.' },
      { step: '04', title: 'Implement', desc: 'Draft foundational HR policies and take over payroll processing.' },
      { step: '05', title: 'Monitor', desc: 'Provide a scalable HR desk as the business grows.' }
    ],
    faqs: [
      { question: 'When does PF and ESIC become applicable to my business?', answer: 'Generally, PF applies at 20 employees and ESIC at 10 (or 20 in some states). We monitor your headcount to ensure timely registration.' },
      { question: 'We don’t have an HR person. Can you help?', answer: 'Yes, our Payroll & HR Operations service acts as your professional back-office, handling day-to-day documentation and queries.' },
      { question: 'Can you draft appointment letters?', answer: 'We provide a comprehensive HR setup which includes legally vetted templates for offers, appointments, and NDAs.' },
      { question: 'Is compliance necessary if we are a very small team?', answer: 'Basic compliance like Shops & Establishments and Professional Tax often apply from day one. We guide you on mandatory vs. scalable practices.' },
      { question: 'How much time will this save the founders?', answer: 'By offloading payroll, leave tracking, and statutory filings to us, founders can refocus entirely on business growth.' },
      { question: 'Do you help structure salaries to be tax-efficient?', answer: 'We help design compliant salary structures that balance operational realities, minimum wage laws, and standard industry practices.' }
    ],
    relatedResources: ['Startup HR Checklist', 'PF/ESIC Applicability Guide', 'Basic Compliance Health Check', 'Employee Handbook Template', 'Payroll Setup Guide'],
    finalCtaTitle: 'Ready to structure your growing business?',
    finalCtaButtonText: 'Request a Consultation'
  }
];
