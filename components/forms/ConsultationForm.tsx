'use client'

import { useState, useEffect, useRef } from 'react'
import { submitConsultation } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Turnstile } from '@marsidev/react-turnstile'
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  getStoredAttribution,
  trackContactFormStarted,
  trackContactFormSubmitted,
  trackContactFormError,
} from '@/lib/analytics'

const services = [
  'PF / ESIC',
  'Labour Compliance',
  'Factory Compliance',
  'Payroll',
  'Contractor Compliance',
  'HR Consulting',
  'Industrial Relations',
  'Compliance Audit',
  'Other',
]

export function ConsultationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const hasStartedTrackingRef = useRef(false)
  const [utmParams] = useState(() => getStoredAttribution())

  // Trigger contact_form_started once on first interaction with form
  function handleFormInteraction() {
    if (!hasStartedTrackingRef.current) {
      hasStartedTrackingRef.current = true
      trackContactFormStarted('consultation_form', 'contact')
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setStatusMessage(null)

    const formData = new FormData(event.currentTarget)
    const result = await submitConsultation(formData)

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message || 'Success!' })
      ;(event.target as HTMLFormElement).reset()
      // Reset interaction tracking for future submissions
      hasStartedTrackingRef.current = false

      // GA4 Key Event / Conversion: Fired ONLY after confirmed PostgreSQL DB insertion
      trackContactFormSubmitted('consultation_form', 'contact')
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'An error occurred.' })
      trackContactFormError('consultation_form', result.error ? 'validation_or_server_error' : 'unknown_error')
    }

    setIsSubmitting(false)
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocus={handleFormInteraction}
      onChange={handleFormInteraction}
      className="space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-[#D9E1DC]"
      noValidate={false}
    >
      {/* Honeypot field for spam protection */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {/* Marketing & UTM Tracking Hidden Inputs */}
      <input type="hidden" name="utm_source" value={utmParams.utm_source} />
      <input type="hidden" name="utm_medium" value={utmParams.utm_medium} />
      <input type="hidden" name="utm_campaign" value={utmParams.utm_campaign} />
      <input type="hidden" name="utm_term" value={utmParams.utm_term} />
      <input type="hidden" name="utm_content" value={utmParams.utm_content} />
      <input type="hidden" name="referrer" value={utmParams.referrer} />
      <input type="hidden" name="landingPage" value={utmParams.landingPage} />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Name *
          </label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Your Full Name"
            className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="designation" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Designation
          </label>
          <Input
            id="designation"
            name="designation"
            placeholder="e.g. HR Director, Plant Head"
            className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Company *
          </label>
          <Input
            id="company"
            name="company"
            required
            placeholder="Your Company / Enterprise"
            className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Phone Number *
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+91 98765 43210"
            className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Corporate Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="name@company.com"
            className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="industry" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Industry *
          </label>
          <Input
            id="industry"
            name="industry"
            required
            placeholder="e.g. Manufacturing, Logistics, IT, Pharma"
            className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Location (City, State) *
          </label>
          <Input
            id="location"
            name="location"
            required
            placeholder="e.g. Indore, Madhya Pradesh"
            className="h-12 rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C]"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="employees" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Number of Employees *
          </label>
          <select
            id="employees"
            name="employees"
            required
            className="flex h-12 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-sm text-[#202522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A5C] shadow-2xs font-medium"
          >
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
          <label htmlFor="contractors" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Number of Contract Workers *
          </label>
          <select
            id="contractors"
            name="contractors"
            required
            className="flex h-12 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-sm text-[#202522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A5C] shadow-2xs font-medium"
          >
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
          <label htmlFor="preferredContact" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            Preferred Contact Method
          </label>
          <select
            id="preferredContact"
            name="preferredContact"
            defaultValue="Phone"
            className="flex h-12 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-sm text-[#202522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A5C] shadow-2xs font-medium"
          >
            <option value="Phone">Phone</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="source" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
            How did you hear about us?
          </label>
          <select
            id="source"
            name="source"
            className="flex h-12 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-sm text-[#202522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A5C] shadow-2xs font-medium"
          >
            <option value="Website">Direct Website</option>
            <option value="Google">Google / Search</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Referral">Client Referral</option>
            <option value="Industry Association">Industry Association</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
          What statutory services do you need help with?
        </label>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((service) => (
            <label
              key={service}
              htmlFor={`service-${service}`}
              className="flex items-center space-x-3 p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl hover:bg-white hover:border-[#1F7A5C]/50 transition-colors cursor-pointer"
            >
              <Checkbox id={`service-${service}`} name="services" value={service} />
              <span className="text-xs font-semibold text-[#202522] leading-none">{service}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-[#12372A]">
          Describe your requirement / challenges *
        </label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Tell us about your factories, workforce compliance issues, audits, or advisory needs..."
          className="rounded-xl border-[#D9E1DC] focus:border-[#1F7A5C] text-sm"
        />
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <Checkbox id="privacy" name="privacy" required className="mt-1" defaultChecked />
        <label
          htmlFor="privacy"
          className="text-xs md:text-sm text-[#66736D] leading-relaxed cursor-pointer select-none"
        >
          I agree to LabourAxis processing the information submitted through this form for responding to my enquiry.
          View our{' '}
          <a href="/privacy-policy" className="text-[#1F7A5C] hover:underline font-semibold">
            Privacy Policy
          </a>
          .
        </label>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-[#1F7A5C]/10 text-[#12372A] border border-[#1F7A5C]/30'
              : 'bg-red-50 text-red-800 border border-red-200'
          } flex items-center gap-3`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#1F7A5C] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
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
        <span>{isSubmitting ? 'Submitting...' : 'Request Consultation'}</span>
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  )
}
