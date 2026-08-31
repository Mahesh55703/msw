"use client";

import { useState } from "react";
import { submitConsultation } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

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
    <form onSubmit={onSubmit} className="space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-[#D9E1DC]">
      
      {/* Honeypot field for spam protection */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Name</label>
          <Input id="name" name="name" required placeholder="Your Name" className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]" />
        </div>
        <div className="space-y-2">
          <label htmlFor="designation" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Designation</label>
          <Input id="designation" name="designation" required placeholder="HR Manager" className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]" />
        </div>
        <div className="space-y-2">
          <label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Company</label>
          <Input id="company" name="company" required placeholder="Your Company" className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Phone</label>
          <Input id="phone" name="phone" required placeholder="+91 9876543210" className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Email</label>
          <Input id="email" name="email" type="email" required placeholder="you@company.com" className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="industry" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Industry</label>
          <Input id="industry" name="industry" required placeholder="Manufacturing, Auto, etc." className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]" />
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Location</label>
          <Input id="location" name="location" required placeholder="City, State" className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="employees" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Number of Employees</label>
          <select id="employees" name="employees" className="flex h-12 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-sm text-[#202522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A5C] shadow-2xs">
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
          <label htmlFor="contractors" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Number of Contract Workers</label>
          <select id="contractors" name="contractors" className="flex h-12 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-sm text-[#202522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A5C] shadow-2xs">
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
          <label htmlFor="preferredContact" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Preferred Contact Method</label>
          <select id="preferredContact" name="preferredContact" className="flex h-12 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-sm text-[#202522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A5C] shadow-2xs">
            <option value="Phone">Phone</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="source" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">How did you hear about us?</label>
          <select id="source" name="source" className="flex h-12 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-sm text-[#202522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A5C] shadow-2xs">
            <option value="">Please select</option>
            <option value="Google">Google / Search</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Referral">Referral</option>
            <option value="Existing Client">Existing Client</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#12372A]">What do you need help with?</label>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((service) => (
            <label 
              key={service} 
              htmlFor={`service-${service}`} 
              className="flex items-center space-x-3 p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl hover:bg-white hover:border-[#1F7A5C]/50 transition-colors cursor-pointer"
            >
              <Checkbox id={`service-${service}`} name="services" value={service} />
              <span className="text-xs font-semibold text-[#202522] leading-none">
                {service}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">Describe your requirement</label>
        <Textarea id="message" name="message" rows={4} placeholder="Tell us about your current compliance challenges..." className="rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]" />
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <Checkbox id="privacy" name="privacy" required className="mt-1" />
        <label htmlFor="privacy" className="text-xs md:text-sm text-[#66736D] leading-relaxed cursor-pointer select-none">
          I agree to LabourAxis processing the information submitted through this form for responding to my enquiry. View our <a href="/privacy-policy" className="text-[#1F7A5C] hover:underline font-semibold">Privacy Policy</a>.
        </label>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-sm ${statusMessage.type === 'success' ? 'bg-[#1F7A5C]/10 text-[#12372A] border border-[#1F7A5C]/30' : 'bg-red-50 text-red-800 border-red-200'} border flex items-center gap-3`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#1F7A5C] shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="flex justify-center pt-2">
          <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        </div>
      )}

      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base py-4 h-auto rounded-xl shadow-lg transition-all cursor-pointer group" 
        disabled={isSubmitting}
      >
        <span>{isSubmitting ? "Submitting..." : "Request Consultation"}</span>
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  );
}
