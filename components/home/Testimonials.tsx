"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, CheckCircle2 } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "LabourAxis transformed our HR operations. Their structured approach to compliance and factory processes gave us complete peace of mind.",
    name: "Rajesh Kumar",
    city: "Mumbai",
    image: "https://i.pravatar.cc/150?u=rajesh"
  },
  {
    quote: "Managing contract labour compliance was a nightmare before we brought them on board. Highly recommend their systematic audit approach.",
    name: "Sanjay Desai",
    city: "Pune",
    image: "https://i.pravatar.cc/150?u=sanjay"
  },
  {
    quote: "The PF and ESIC compliance support has been flawless. They don't just file returns, they ensure our entire employee data is clean.",
    name: "Priya Sharma",
    city: "Delhi",
    image: "https://i.pravatar.cc/150?u=priya"
  },
  {
    quote: "Their focus on industrial HR is exactly what our manufacturing unit needed. Practical, clear, and highly professional.",
    name: "Amit Patel",
    city: "Ahmedabad",
    image: "https://i.pravatar.cc/150?u=amit"
  },
  {
    quote: "We used their compliance health check and discovered critical gaps in our contractor documentation. Saved us massive potential liabilities.",
    name: "Vikram Singh",
    city: "Gurgaon",
    image: "https://i.pravatar.cc/150?u=vikram"
  },
  {
    quote: "Excellent support in setting up our factory HR processes from scratch. They understand the reality of shop-floor workforce management.",
    name: "Anil Reddy",
    city: "Hyderabad",
    image: "https://i.pravatar.cc/150?u=anil"
  },
  {
    quote: "Timely, accurate, and transparent. LabourAxis acts as an extension of our own team for all payroll and statutory compliance.",
    name: "Meera Nair",
    city: "Bangalore",
    image: "https://i.pravatar.cc/150?u=meera"
  },
  {
    quote: "A refreshing change from traditional consultants. They actually focus on building sustainable HR processes rather than just paperwork.",
    name: "Nitin Gupta",
    city: "Noida",
    image: "https://i.pravatar.cc/150?u=nitin"
  }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];
  const nextItem = TESTIMONIALS[(currentIndex + 1) % TESTIMONIALS.length];

  return (
    <section className="py-24 bg-[#F7F4EC] border-y border-[#D9E1DC] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-warm opacity-50 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Client Feedback & Trust
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">What Our Clients Say</h2>
          <p className="text-lg text-[#66736D]">Practical support that makes a real operational difference.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Primary Testimonial Card */}
            <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-8 md:p-10 flex flex-col justify-between relative hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex text-[#D6A84F] gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D6A84F]" />
                  ))}
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center">
                  <Quote className="w-5 h-5" />
                </div>
              </div>

              <p className="text-[#202522] text-base md:text-lg leading-relaxed mb-8 italic flex-1">
                &ldquo;{current.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-5 border-t border-[#D9E1DC]/60">
                <img 
                  src={current.image} 
                  alt={current.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-[#D9E1DC]" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-[#12372A]">{current.name}</h4>
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A5C]" />
                  </div>
                  <p className="text-[#66736D] text-xs font-semibold uppercase tracking-wider">{current.city}</p>
                </div>
              </div>
            </div>

            {/* Secondary Testimonial Card (Desktop) */}
            <div className="hidden md:flex bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-8 md:p-10 flex-col justify-between relative hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex text-[#D6A84F] gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D6A84F]" />
                  ))}
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center">
                  <Quote className="w-5 h-5" />
                </div>
              </div>

              <p className="text-[#202522] text-base md:text-lg leading-relaxed mb-8 italic flex-1">
                &ldquo;{nextItem.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-5 border-t border-[#D9E1DC]/60">
                <img 
                  src={nextItem.image} 
                  alt={nextItem.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-[#D9E1DC]" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-[#12372A]">{nextItem.name}</h4>
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A5C]" />
                  </div>
                  <p className="text-[#66736D] text-xs font-semibold uppercase tracking-wider">{nextItem.city}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button 
              onClick={prev}
              className="w-11 h-11 rounded-full bg-white border border-[#D9E1DC] flex items-center justify-center text-[#202522] hover:text-[#1F7A5C] hover:border-[#1F7A5C] hover:bg-[#F7F4EC] transition-all shadow-xs cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${idx === currentIndex ? 'w-6 bg-[#1F7A5C]' : 'w-2 bg-[#D9E1DC] hover:bg-[#66736D]'}`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={next}
              className="w-11 h-11 rounded-full bg-white border border-[#D9E1DC] flex items-center justify-center text-[#202522] hover:text-[#1F7A5C] hover:border-[#1F7A5C] hover:bg-[#F7F4EC] transition-all shadow-xs cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
