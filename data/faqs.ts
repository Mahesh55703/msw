export type FaqCategory = {
  id: string;
  title: string;
  ctaText: string;
  ctaButton: string;
  ctaLink: string;
  faqs: { question: string; answer: string; isPopular?: boolean }[];
};

export const faqsData: FaqCategory[] = [
  {
    id: "hr",
    title: "HR & HR Operations",
    ctaText: "Need help improving your HR processes?",
    ctaButton: "Discuss Your HR Requirement",
    ctaLink: "/contact",
    faqs: [
      { question: "What is HR operations?", answer: "HR operations refers to the administrative and functional processes required to manage an organization's workforce daily. This includes onboarding, maintaining employee records, tracking attendance, leave management, and offboarding." },
      { question: "What HR processes should a growing business have?", answer: "Growing businesses should establish clear processes for employee onboarding, attendance tracking, leave management, performance documentation, and structured offboarding. A fundamental HR policy framework or employee handbook is also highly recommended." },
      { question: "What documents should be collected when an employee joins?", answer: "Typically, employers should collect proof of identity, address proof, educational certificates, previous employment records, and necessary declarations for statutory compliance (such as PF/ESIC nomination forms and bank details)." },
      { question: "Why is an employee master database important?", answer: "An accurate master database centralizes all critical employee information. It is essential for accurate payroll processing, statutory compliance filings, and quick retrieval of records during internal reviews." },
      { question: "What employee records should an organization maintain?", answer: "Organizations should maintain comprehensive files including offer letters, joining forms, KYC documents, background verification, non-disclosure agreements, and ongoing attendance/payroll records." },
      { question: "How should employee attendance be managed?", answer: "Attendance should ideally be managed using biometric or digital tracking synced with payroll, while ensuring a formal register or muster roll is maintained to satisfy statutory requirements." },
      { question: "What should an HR policy framework include?", answer: "A solid framework includes a code of conduct, leave and attendance policy, grievance redressal mechanism, Prevention of Sexual Harassment (POSH) policy, and a clear separation policy." },
      { question: "What is an HR compliance checklist?", answer: "It is a structured document used to ensure all statutory (labor laws) and internal (company policies) requirements are fulfilled consistently across the entire employee lifecycle." },
      { question: "How can a company improve its HR documentation?", answer: "By centralizing digital records securely, standardizing all HR templates (offer letters, warnings, increment letters), and conducting regular internal audits." },
      { question: "When should an MSME consider hiring dedicated HR support?", answer: "Typically when the employee count crosses critical statutory thresholds (e.g., 10 or 20 employees) which trigger EPF, ESIC, and more complex compliance and operational requirements." }
    ]
  },
  {
    id: "labour-compliance",
    title: "Labour Compliance",
    ctaText: "Unsure about your current compliance position?",
    ctaButton: "Request a Compliance Health Check",
    ctaLink: "/contact",
    faqs: [
      { question: "What is labour compliance?", answer: "Labour compliance refers to the processes businesses use to identify, manage and document requirements applicable to their workforce and establishment. Requirements vary by location and industry.", isPopular: true },
      { question: "Why is labour compliance important for businesses?", answer: "Adhering to labour compliance protects businesses from legal liabilities, financial penalties, and operational disruptions. It also fosters a fair, safe, and transparent working environment." },
      { question: "What is a compliance gap assessment?", answer: "A compliance gap assessment (or health check) is a systematic review of an organization's current HR processes, statutory records, and filings against applicable state and central labour laws." },
      { question: "What is a compliance health check?", answer: "A proactive review of your establishment's adherence to relevant labour laws. It helps identify vulnerabilities in your payroll, statutory registers, and contractor documentation.", isPopular: true },
      { question: "What types of labour records should employers maintain?", answer: "Employers must maintain various statutory registers including muster rolls, wage registers, leave with wages registers, accident registers, and official inspection books." },
      { question: "What is a labour compliance audit?", answer: "A comprehensive, deep-dive review of an organization's adherence to all applicable state and central labour laws, often involving verification of physical records and challans." },
      { question: "How often should labour compliance be reviewed?", answer: "Compliance should be tracked continuously via a monthly checklist for recurring filings (like PF/ESIC), alongside a more comprehensive annual audit." },
      { question: "What are common labour compliance gaps in MSMEs?", answer: "Common issues include misclassification of employees, missing or improperly formatted statutory registers, late PF/ESIC payments, and incomplete contractor documentation." },
      { question: "What should an employer do before a labour inspection?", answer: "Ensure all physical registers are completely up to date, mandatory statutory notices are prominently displayed, and all monthly challans and returns are filed and available." },
      { question: "What is a labour compliance calendar?", answer: "A critical tracking tool mapping all statutory filing due dates, return deadlines, and license renewal dates applicable to the specific establishment." }
    ]
  },
  {
    id: "pf",
    title: "PF & EPFO",
    ctaText: "Need help with PF compliance processes?",
    ctaButton: "Discuss PF Requirements",
    ctaLink: "/contact",
    faqs: [
      { question: "What is PF compliance?", answer: "PF compliance involves adhering to the Employees' Provident Funds Act. This includes registering eligible establishments, generating UANs, deducting contributions correctly, and filing monthly returns.", isPopular: true },
      { question: "What is an employee's UAN?", answer: "UAN (Universal Account Number) is a unique 12-digit number allotted by EPFO. It acts as an umbrella for multiple Member IDs, allowing seamless transfer of PF accounts when changing jobs." },
      { question: "What is an ECR?", answer: "ECR (Electronic Challan cum Return) is the monthly online return filed by employers on the EPFO portal detailing the PF contributions of all covered employees." },
      { question: "What recurring PF compliance activities should employers track?", answer: "Employers must track the monthly calculation of PF contributions, generation and filing of the ECR, timely remittance of dues, KYC updates, and exit markings for employees." },
      { question: "When may an establishment be required to register under EPF?", answer: "Typically, establishments employing 20 or more persons are required to register, though voluntary registration is possible for establishments with fewer employees." },
      { question: "What information is generally required for PF-related employee processes?", answer: "Standard requirements include Aadhaar (linked with a mobile number), PAN, bank account details, and previous UAN if the employee was previously covered." },
      { question: "What employee records should be maintained for PF purposes?", answer: "Accurate wage records detailing basic, DA, and other allowances, along with statutory nomination forms and KYC documentation." },
      { question: "How should employers handle employee joining and exit processes related to PF?", answer: "Employers must promptly generate or link the UAN upon joining, and critically, mark the date and reason of exit immediately upon separation to prevent compliance mismatches." },
      { question: "What are common PF compliance issues?", answer: "Frequent issues include incorrect calculation of PF on excluded allowances, delayed remittances leading to damages, and failure to mark employee exits." },
      { question: "Can PF records be reviewed for discrepancies?", answer: "Yes, through regular internal audits reconciling the monthly ECR against the payroll register and the establishment's master data." }
    ]
  },
  {
    id: "esic",
    title: "ESIC",
    ctaText: "Need help managing ESIC compliance?",
    ctaButton: "Discuss ESIC Requirements",
    ctaLink: "/contact",
    faqs: [
      { question: "Who may need ESIC?", answer: "The ESI scheme generally applies to establishments employing a certain number of persons (often 10 or 20 depending on the state). It provides protection to workers drawing wages below a specific statutory ceiling.", isPopular: true },
      { question: "What is ESIC?", answer: "ESIC (Employees' State Insurance Corporation) manages the ESI scheme, a self-financing social security and health insurance fund for Indian workers." },
      { question: "How does ESIC registration work?", answer: "Once an establishment crosses the applicability threshold, it registers via the Shram Suvidha Portal. Eligible employees must then be registered to generate their unique Pehchan Cards." },
      { question: "What recurring ESIC compliance activities should employers track?", answer: "Key activities include accurate calculation of contributions, filing of monthly returns, timely payment of challans, and immediate reporting of any workplace accidents." },
      { question: "Which employees may be covered under ESIC?", answer: "Employees earning wages up to a specific statutory limit (currently ₹21,000 per month) in covered establishments are generally required to be covered." },
      { question: "What employee information is required for ESIC processes?", answer: "Registration typically requires Aadhaar, family details and photographs for dependent benefits, and bank account information." },
      { question: "What records should employers maintain?", answer: "Employers should maintain the official inspection book, accident register, wage register, and copies of all monthly challans and returns." },
      { question: "How should employee joining and exit processes be managed?", answer: "Registration must happen within 10 days of the employee joining. Exits must be updated promptly to prevent compliance mismatches during inspections." },
      { question: "What are common ESIC compliance issues?", answer: "Delay in employee registration, miscalculation of gross wages for contribution purposes, and failure to report workplace accidents within the stipulated time." },
      { question: "How can employers review their ESIC records?", answer: "By routinely reconciling the monthly ESIC challan with the attendance and wage register to ensure every eligible employee has been covered and contributions match." }
    ]
  },
  {
    id: "payroll",
    title: "Payroll & Attendance",
    ctaText: "Need help organizing payroll and HR operations?",
    ctaButton: "Discuss Payroll Setup",
    ctaLink: "/contact",
    faqs: [
      { question: "What is payroll compliance?", answer: "Payroll compliance ensures that employees are paid accurately and on time while adhering to all applicable statutory deductions (PF, ESIC, PT, TDS) and minimum wage regulations." },
      { question: "Why is attendance accuracy important for payroll?", answer: "Attendance data is the foundation of accurate payroll. Errors in tracking present days, leave, and overtime lead to incorrect payouts and statutory miscalculations." },
      { question: "How are payroll and statutory compliance connected?", answer: "Contributions to PF, ESIC, and Professional Tax are calculated as percentages of specific wage components. Incorrect payroll structuring results in underpayment of statutory dues." },
      { question: "What payroll records should employers maintain?", answer: "Comprehensive records including wage registers, attendance/muster rolls, leave records, overtime registers, and proof of salary disbursement (bank transfers)." },
      { question: "How should leave records be managed?", answer: "They must be maintained in a statutory Register of Leave with Wages, clearly distinguishing earned leave, sick leave, and casual leave balances and availments." },
      { question: "What are common payroll errors?", answer: "Common errors include incorrect statutory deductions, ignoring bi-annual minimum wage revisions, and calculation errors in overtime or leave encashment." },
      { question: "How should salary revisions be documented?", answer: "Via formal increment letters signed by both parties and immediately updated in the payroll master data before the next processing cycle." },
      { question: "How should employee deductions be tracked?", answer: "All deductions (PF, ESIC, PT, TDS, authorized loan recoveries) must be clearly itemized on the employee's payslip and the official wage register." },
      { question: "What is an HR payroll MIS?", answer: "A Management Information System report that summarizes payroll costs, statutory liabilities, headcount metrics, and month-over-month variances for management review." },
      { question: "How do minimum wage revisions impact payroll?", answer: "Variable Dearness Allowance (VDA) is typically revised twice a year by state governments. Payroll must be updated to ensure no worker is paid below the revised minimum wage." }
    ]
  },
  {
    id: "factory",
    title: "Factory Compliance",
    ctaText: "Need help reviewing factory HR and compliance?",
    ctaButton: "Discuss Factory Compliance",
    ctaLink: "/contact",
    faqs: [
      { question: "How should a factory prepare for an inspection?", answer: "Preparation involves maintaining up-to-date statutory registers, ensuring mandatory notices are displayed, verifying licenses, and organizing contractor documentation. Mock audits are highly recommended.", isPopular: true },
      { question: "What is factory compliance?", answer: "Factory compliance involves adhering to regulations governing occupational health, safety, working hours, and welfare facilities specific to manufacturing premises, primarily under the Factories Act." },
      { question: "When may factory registration or licensing be required?", answer: "Typically when a manufacturing process utilizes power and employs 10 or more workers, or operates without power and employs 20 or more workers (thresholds vary heavily by state)." },
      { question: "What should factories consider when managing contract workers?", answer: "Factories acting as Principal Employers must ensure contractors possess valid licenses, pay minimum wages, and deposit PF/ESIC. The Principal Employer can be held vicariously liable." },
      { question: "What HR and labour requirements may apply to a factory?", answer: "Strict working hour limits, mandatory overtime rates (usually double the ordinary rate), health and safety protocols, and threshold-based welfare facility provisions." },
      { question: "What employee records should a factory maintain?", answer: "Crucial records include the Adult Worker Register, Form 12, Muster Roll, Wage Register, and Leave with Wages Register." },
      { question: "What records may be relevant for working hours and attendance?", answer: "Clear shift rosters, overtime registers, compensatory holiday records, and accurate in/out punch data." },
      { question: "Why is documentation important for factory inspections?", answer: "Inspectors rely entirely on the maintenance of physical/digital statutory registers and displayed notices to verify compliance with the Factories Act." },
      { question: "What is a factory compliance calendar?", answer: "A comprehensive tracker for renewing factory licenses, filing annual/half-yearly returns, scheduling safety committee meetings, and conducting machinery testing." },
      { question: "What are common compliance gaps in manufacturing units?", answer: "Poor contractor documentation, inadequate safety gear, excessive undocumented overtime, and missing statutory displays." }
    ]
  },
  {
    id: "contract-labour",
    title: "Contract Labour",
    ctaText: "Need help auditing contractor documentation?",
    ctaButton: "Discuss Contract Labour Compliance",
    ctaLink: "/contact",
    faqs: [
      { question: "What is contract labour compliance?", answer: "Adherence to the Contract Labour (Regulation and Abolition) Act. It involves licensing for contractors, registration for principal employers, and ensuring wage/welfare obligations are met.", isPopular: true },
      { question: "What should a principal employer review when engaging contractors?", answer: "Verify the contractor's labor license, PF/ESIC registration codes, monthly wage registers, proof of wage disbursement, and monthly statutory challans." },
      { question: "Why is contractor PF/ESIC compliance important?", answer: "If a contractor fails to remit statutory contributions for workers deployed at your establishment, authorities can hold the Principal Employer liable to recover the dues." },
      { question: "How can principal employers monitor contractor compliance?", answer: "Implement a monthly clearance process: contractors should only have invoices cleared after submitting verified copies of wage registers, challans, and ECRs specific to your site." },
      { question: "What contractor documents should be maintained?", answer: "Copy of the contractor's labor license, PF/ESIC registration certificates, the formal contract agreement, and deployment rosters." },
      { question: "What workforce records should contractors maintain?", answer: "Muster roll, wage register, register of deductions, register of overtime, and register of fines." },
      { question: "How should contract worker attendance be maintained?", answer: "Separately from direct employees, ideally through a system accessible to the principal employer for verification and invoice reconciliation." },
      { question: "How should contractor wage records be reviewed?", answer: "By verifying bank transfer statements against the wage register and ensuring payments meet or exceed the applicable state minimum wages." },
      { question: "What are common contractor compliance gaps?", answer: "Operating without a valid license, failure to deposit PF/ESIC, cash payment of wages without proof, and lack of welfare facilities." },
      { question: "Can LabourAxis conduct a contractor compliance review?", answer: "Yes, we can establish a monthly clearance process to audit contractor documentation before invoice clearance, protecting the principal employer." }
    ]
  },
  {
    id: "industrial-relations",
    title: "Industrial Relations",
    ctaText: "Need help structuring workforce communication and processes?",
    ctaButton: "Discuss Industrial Relations",
    ctaLink: "/contact",
    faqs: [
      { question: "What is industrial relations?", answer: "Industrial relations encompasses the dynamics and processes governing the relationship between management and the workforce within an industrial or manufacturing setting." },
      { question: "Why are industrial relations important in manufacturing?", answer: "Healthy industrial relations foster a productive work environment. Poor relations can lead to high attrition, grievances, strikes, and operational disruptions." },
      { question: "What is a grievance management process?", answer: "A formalized, transparent mechanism that allows employees to raise workplace concerns or operational issues, ensuring they are addressed systematically by management." },
      { question: "When should a matter be referred to an appropriately qualified legal professional?", answer: "Matters involving active litigation, labor court disputes, union negotiations, or complex legal interpretations should always be referred to qualified legal practitioners." },
      { question: "What is employee relations?", answer: "The broader strategy of managing the employer-employee relationship to ensure fairness, engagement, communication, and legal compliance." },
      { question: "How should employee grievances be handled?", answer: "Through a documented, multi-tier escalation matrix ensuring timely, impartial resolution and feedback to the aggrieved employee." },
      { question: "How should workplace conflicts be managed?", answer: "Promptly, objectively, and with proper documentation of all witness statements, investigations, and mediation efforts." },
      { question: "What is a disciplinary process?", answer: "A formal procedure (including show-cause notices and domestic inquiries) to address employee misconduct in line with the establishment's standing orders or policies." },
      { question: "Why is disciplinary documentation important?", answer: "It provides essential legal protection against claims of unfair dismissal and ensures due process and natural justice principles were followed." },
      { question: "How can HR improve worker-management communication?", answer: "Through regular town halls, active safety and works committees, transparent policy dissemination, and maintaining an open-door policy." }
    ]
  }
];
