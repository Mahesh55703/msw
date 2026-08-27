"use client";

import { useState } from "react";
import { submitConsultation } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const services = [
  "PF / ESIC",
  "Labour Compliance",
  "Factory Compliance",
  "Payroll",
  "Contractor Compliance",
  "HR Consulting",
  "Industrial Relations",
  "Compliance Audit",
  "Other"
];

export function ConsultationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const formData = new FormData(event.currentTarget);
    const result = await submitConsultation(formData);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message || "Success!" });
      (event.target as HTMLFormElement).reset();
      
      // GA4 Conversion Tracking
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'consultation_submit');
      }
    } else {
      setStatusMessage({ type: 'error', text: result.error || "An error occurred." });
    }
    
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-slate-200">
      
      {/* Honeypot field for spam protection */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">Name</label>
          <Input id="name" name="name" required placeholder="Your Name" />
        </div>
        <div className="space-y-2">
          <label htmlFor="designation" className="text-sm font-medium text-slate-700">Designation</label>
          <Input id="designation" name="designation" required placeholder="HR Manager" />
        </div>
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium text-slate-700">Company</label>
          <Input id="company" name="company" required placeholder="Your Company" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone</label>
          <Input id="phone" name="phone" required placeholder="+91 9876543210" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
          <Input id="email" name="email" type="email" required placeholder="you@company.com" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="industry" className="text-sm font-medium text-slate-700">Industry</label>
          <Input id="industry" name="industry" required placeholder="Manufacturing, Auto, etc." />
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-slate-700">Location</label>
          <Input id="location" name="location" required placeholder="City, State" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="employees" className="text-sm font-medium text-slate-700">Number of Employees</label>
          <select id="employees" name="employees" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
            <option value="">Select Range</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-100">51–100</option>
            <option value="101-250">101–250</option>
            <option value="251-500">251–500</option>
            <option value="500+">500+</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="contractors" className="text-sm font-medium text-slate-700">Number of Contract Workers</label>
          <select id="contractors" name="contractors" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
            <option value="">Select Range</option>
            <option value="0">0 (None)</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-100">51–100</option>
            <option value="101-250">101–250</option>
            <option value="251-500">251–500</option>
            <option value="500+">500+</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="preferredContact" className="text-sm font-medium text-slate-700">Preferred Contact Method</label>
          <select id="preferredContact" name="preferredContact" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
            <option value="Phone">Phone</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="source" className="text-sm font-medium text-slate-700">How did you hear about us?</label>
          <select id="source" name="source" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
            <option value="">Please select</option>
            <option value="Google">Google / Search</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Referral">Referral</option>
            <option value="Existing Client">Existing Client</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-700">What do you need help with?</label>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox id={`service-${service}`} name="services" value={service} />
              <label htmlFor={`service-${service}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {service}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700">Describe your requirement</label>
        <Textarea id="message" name="message" rows={4} placeholder="Tell us about your current compliance challenges..." />
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <Checkbox id="privacy" name="privacy" required className="mt-1" />
        <label htmlFor="privacy" className="text-sm text-slate-600 leading-relaxed">
          I agree to LabourAxis processing the information submitted through this form for responding to my enquiry. View our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </label>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-md text-sm ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
          {statusMessage.text}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Request Consultation"}
      </Button>
    </form>
  );
}
