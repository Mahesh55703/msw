import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | LabourAxis",
  description: "Terms and conditions for using the LabourAxis website and services.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="bg-slate-900 text-white pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Use</h1>
            <p className="text-xl text-slate-300">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm text-slate-700 space-y-8 leading-relaxed">
            
            <p className="text-lg">
              Welcome to LabourAxis. By accessing or using our website, you agree to be bound by these Terms of Use and our Privacy Policy.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing this website, you accept these Terms of Use in full. If you disagree with these terms or any part of them, you must not use this website.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Nature of Services</h2>
              <p>LabourAxis provides operational HR and labour compliance consultancy. We help businesses organize processes and records. However, information provided on this website does not constitute formal legal advice. Where a matter requires specialized legal representation or regulated professional advice, we coordinate with appropriately qualified and independent professionals.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Intellectual Property Rights</h2>
              <p>Unless otherwise stated, LabourAxis and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may view and/or print pages from the website for your own personal use, subject to restrictions set in these terms and conditions.</p>
              <p className="mt-4 font-semibold">You must not:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Republish material from this website without permission.</li>
                <li>Sell, rent, or sub-license material from the website.</li>
                <li>Reproduce, duplicate, or copy material from this website for commercial purposes.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. User Submitted Information</h2>
              <p>Any information you submit through our contact forms, consultation requests, or career applications must be accurate and truthful. We handle all submitted data in accordance with our Privacy Policy.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitation of Liability</h2>
              <p>In no event shall LabourAxis, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website. LabourAxis shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this website.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Changes to Terms</h2>
              <p>We reserve the right to amend these Terms of Use at any time. By continuing to use the website after such changes are published, you agree to be bound by the amended terms.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Contact Information</h2>
              <p>For any questions regarding these Terms of Use, please contact us at info@labouraxis.com.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
