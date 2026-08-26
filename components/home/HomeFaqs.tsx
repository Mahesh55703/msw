export function HomeFaqs() {
  const HOME_FAQS = [
    {
      question: "Which businesses need labour compliance support?",
      answer: "Any business that employs people needs basic compliance (like Shops & Establishments). However, the complexity increases significantly for factories, construction sites, and businesses crossing the 10 or 20 employee threshold where acts like EPF, ESIC, and Gratuity apply."
    },
    {
      question: "What is included in a Compliance Health Check?",
      answer: "We review your existing employee records, statutory registers, PF/ESIC filings, and contractor documentation against applicable state and central labour laws to identify gaps and areas of potential liability."
    },
    {
      question: "Do you handle payroll processing as well?",
      answer: "Yes. We manage end-to-end payroll processing, ensuring that statutory deductions like PF, ESIC, Professional Tax, and TDS are calculated accurately and compliant with minimum wage regulations."
    },
    {
      question: "How do you help with contract labour compliance?",
      answer: "We help principal employers track contractor licenses, verify their monthly wage registers, and cross-check PF/ESIC challans to ensure the principal employer is protected from vicarious liabilities."
    },
    {
      question: "What should we do before a labour inspection?",
      answer: "Do not wait for an inspection to organize records. We help you proactively maintain up-to-date statutory registers, display required notices, and organize employee files so you are always prepared."
    },
    {
      question: "Do you provide legal representation?",
      answer: "Our focus is on proactive HR and compliance consultancy. Where a matter requires specialized legal representation or litigation, we coordinate alongside appropriately qualified advocates and legal practitioners."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-600">Common questions about our services and compliance.</p>
        </div>
        <div className="space-y-4">
          {HOME_FAQS.map((faq, idx) => (
            <details key={idx} className="group bg-slate-50 border border-slate-200 rounded-lg [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-slate-900">
                <span className="text-lg pr-4">{faq.question}</span>
                <span className="ml-1.5 flex-shrink-0 bg-white shadow-sm border border-slate-200 p-1.5 rounded-full text-slate-500 group-open:bg-blue-100 group-open:border-blue-200 group-open:text-blue-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200 pt-4 mt-2">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
