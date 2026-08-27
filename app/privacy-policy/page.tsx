import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | LabourAxis",
  description: "Read the LabourAxis Privacy Policy to understand how we collect, use, and protect your personal and business information.",
  alternates: {
    canonical: "/privacy-policy"
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="bg-slate-900 text-white pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
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
              At LabourAxis, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
              <p className="mb-4">We may collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our services, or when you contact us. The personal information we collect may include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Names and job titles</li>
                <li>Email addresses and phone numbers</li>
                <li>Company names and organizational details</li>
                <li>Any other information you choose to provide in consultation forms or emails</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect or receive to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our services</li>
                <li>Respond to your inquiries and offer customer support</li>
                <li>Send you administrative information or updates regarding your inquiries</li>
                <li>Understand and analyze how you use our website to improve user experience</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Information Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following situations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With Service Providers:</strong> We may share your information with trusted third-party vendors who assist us in operating our website or conducting our business, provided they agree to keep this information confidential.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                <li><strong>With Professional Network Partners:</strong> If your requirement involves specialized legal or accounting expertise, we may share basic details with our verified professional network partners only after obtaining your explicit consent.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
              <p>We use reasonable administrative, logical, and physical security measures to protect your personal information. However, please be aware that no data transmission over the Internet or method of electronic storage can be guaranteed to be 100% secure.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
              <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
              <p className="mt-4 font-semibold text-slate-900">Email: info@labouraxis.com</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
