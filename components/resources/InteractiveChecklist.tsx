'use client'

import { useState } from 'react'
import { Check, CheckCircle2, RotateCcw, Info } from 'lucide-react'
import { ChecklistSection } from '@/lib/validations/checklist'

interface InteractiveChecklistProps {
  sections: ChecklistSection[]
}

export default function InteractiveChecklist({ sections }: InteractiveChecklistProps) {
  // Local client-side checked items state
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const totalItems = sections.reduce((acc, sec) => acc + (sec.items?.length || 0), 0)
  const completedCount = checkedIds.size
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  const toggleItem = (id: string) => {
    const updated = new Set(checkedIds)
    if (updated.has(id)) {
      updated.delete(id)
    } else {
      updated.add(id)
    }
    setCheckedIds(updated)
  }

  const resetAll = () => {
    setCheckedIds(new Set())
  }

  return (
    <div className="space-y-8">
      {/* Live Interactive Progress Bar */}
      <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-6 shadow-xs sticky top-20 z-30 backdrop-blur-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1F7A5C]" />
            <span className="font-bold text-sm sm:text-base text-[#12372A]">
              Audit Progress: {completedCount} / {totalItems} completed
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-[#D9E1DC] text-[#1F7A5C]">
              {percentage}%
            </span>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="text-xs font-semibold text-[#66736D] hover:text-[#12372A] flex items-center gap-1 transition-colors"
                title="Reset all checkboxes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full h-2.5 bg-[#D9E1DC]/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1F7A5C] transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Sections and Items */}
      <div className="space-y-8">
        {sections.map((section, secIdx) => {
          const secCompleted = section.items.filter((it) => checkedIds.has(it.id)).length
          const secTotal = section.items.length

          return (
            <div
              key={section.id || secIdx}
              className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#D9E1DC]/60">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#12372A] text-white flex items-center justify-center text-xs font-bold">
                    {secIdx + 1}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#12372A]">{section.title}</h3>
                </div>
                <span className="text-xs font-semibold text-[#66736D] pl-11 sm:pl-0">
                  {secCompleted} of {secTotal} completed
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {section.items.map((item, itemIdx) => {
                  const isChecked = checkedIds.has(item.id)

                  return (
                    <label
                      key={item.id || itemIdx}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-[#1F7A5C]/5 border-[#1F7A5C]/40 text-[#12372A]'
                          : 'bg-[#F7F4EC]/40 border-[#D9E1DC] hover:border-[#1F7A5C]/40 hover:bg-[#F7F4EC]'
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <div className="pt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.id)}
                          className="sr-only"
                          aria-label={item.text}
                        />
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-[#1F7A5C] border-[#1F7A5C] text-white shadow-xs'
                              : 'bg-white border-[#A2B3AA]'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Text & Guidance */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p
                          className={`text-sm sm:text-base font-semibold leading-relaxed transition-all ${
                            isChecked ? 'line-through text-[#66736D]' : 'text-[#12372A]'
                          }`}
                        >
                          {item.text}
                        </p>
                        {item.guidance && (
                          <div className="flex items-start gap-1.5 text-xs text-[#66736D] leading-normal pt-0.5">
                            <Info className="w-3.5 h-3.5 text-[#1F7A5C] mt-0.5 shrink-0" />
                            <span>{item.guidance}</span>
                          </div>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
