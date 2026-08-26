"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

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

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
          <p className="text-lg text-slate-600">Practical support that makes a real operational difference.</p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* First Card (Mobile & Desktop) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center flex flex-col h-full">
              <Quote className="w-8 h-8 text-blue-100 mx-auto mb-4" />
              <p className="text-lg text-slate-700 font-medium leading-relaxed mb-8 italic flex-1">
                "{TESTIMONIALS[currentIndex].quote}"
              </p>
              <div className="flex flex-col items-center justify-center mt-auto">
                <img src={TESTIMONIALS[currentIndex].image} alt={TESTIMONIALS[currentIndex].name} className="w-14 h-14 rounded-full object-cover mb-3 border-2 border-slate-100 shadow-sm" />
                <h4 className="text-base font-bold text-slate-900">{TESTIMONIALS[currentIndex].name}</h4>
                <p className="text-slate-500 text-xs uppercase tracking-wide">{TESTIMONIALS[currentIndex].city}</p>
              </div>
            </div>

            {/* Second Card (Desktop Only) */}
            <div className="hidden md:flex bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center flex-col h-full">
              <Quote className="w-8 h-8 text-blue-100 mx-auto mb-4" />
              <p className="text-lg text-slate-700 font-medium leading-relaxed mb-8 italic flex-1">
                "{TESTIMONIALS[(currentIndex + 1) % TESTIMONIALS.length].quote}"
              </p>
              <div className="flex flex-col items-center justify-center mt-auto">
                <img src={TESTIMONIALS[(currentIndex + 1) % TESTIMONIALS.length].image} alt={TESTIMONIALS[(currentIndex + 1) % TESTIMONIALS.length].name} className="w-14 h-14 rounded-full object-cover mb-3 border-2 border-slate-100 shadow-sm" />
                <h4 className="text-base font-bold text-slate-900">{TESTIMONIALS[(currentIndex + 1) % TESTIMONIALS.length].name}</h4>
                <p className="text-slate-500 text-xs uppercase tracking-wide">{TESTIMONIALS[(currentIndex + 1) % TESTIMONIALS.length].city}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button 
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm focus:outline-none"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-blue-600' : 'bg-slate-300'}`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={next}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm focus:outline-none"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
