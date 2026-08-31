import { Plus } from "lucide-react";

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
    <section className="py-24 bg-[#FFFFFF] relative">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Common Inquiries
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-lg text-[#66736D]">Common questions about our services and compliance.</p>
        </div>
        
        <div className="space-y-4">
          {HOME_FAQS.map((faq, idx) => (
            <details key={idx} className="group bg-[#F7F4EC]/70 hover:bg-[#F7F4EC] border border-[#D9E1DC] rounded-2xl transition-all duration-200 [&_summary::-webkit-details-marker]:hidden shadow-2xs">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-[#12372A] select-none">
                <span className="text-base md:text-lg pr-4 font-semibold text-[#12372A] group-open:text-[#1F7A5C] transition-colors">{faq.question}</span>
                <span className="ml-2 flex-shrink-0 w-8 h-8 rounded-full bg-white border border-[#D9E1DC] flex items-center justify-center text-[#66736D] group-open:bg-[#1F7A5C] group-open:border-[#1F7A5C] group-open:text-white transition-all duration-200 shadow-2xs">
                  <Plus className="w-4 h-4 transition-transform duration-300 group-open:rotate-45" />
                </span>
              </summary>
              <div className="px-6 pb-6 text-[#202522] text-base leading-relaxed border-t border-[#D9E1DC]/60 pt-4 mt-1">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
