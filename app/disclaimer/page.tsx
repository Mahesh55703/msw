import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | LabourAxis",
  description: "Important legal disclaimer regarding the use of LabourAxis website content and our position on providing general informational compliance content.",
  alternates: {
    canonical: "/disclaimer"
  }
};

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="bg-slate-900 text-white pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Disclaimer</h1>
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
            
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. General Information Purpose</h2>
              <p>The information contained on the LabourAxis website (the "Service") is for general informational purposes only. LabourAxis assumes no responsibility for errors or omissions in the contents of the Service.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Not Legal Advice</h2>
              <p>LabourAxis provides operational human resources and labour compliance consultancy. <strong>The materials on this website do not constitute legal advice and should not be relied upon as such.</strong></p>
              <p className="mt-4">Labour compliance and industrial relations laws are complex and subject to change. While we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability with respect to the website or the information contained on the website for any purpose.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Professional Network Limitations</h2>
              <p>Where client requirements call for specialized legal, accounting, or company secretarial expertise, LabourAxis acts as a coordinator to connect clients with independent, appropriately qualified professionals (such as Lawyers or Chartered Accountants). LabourAxis itself does not provide services reserved for these regulated professions, and assumes no liability for the independent professional advice rendered by such network partners.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. "As Is" Basis</h2>
              <p>All information on the site is provided "as is", with no guarantee of completeness, accuracy, timeliness, or of the results obtained from the use of this information, and without warranty of any kind, express or implied.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. External Links</h2>
              <p>Our website may contain links to external websites that are not provided or maintained by or in any way affiliated with LabourAxis. Please note that LabourAxis does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
