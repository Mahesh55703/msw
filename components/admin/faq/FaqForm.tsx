'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon, Unlink, Undo, Redo, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { createFaq, updateFaq } from '@/app/actions/faq'

const FAQ_CATEGORIES = [
  { id: 'HR_OPERATIONS', label: 'HR & HR Operations' },
  { id: 'LABOUR_COMPLIANCE', label: 'Labour Compliance' },
  { id: 'PF_EPFO', label: 'PF & EPFO' },
  { id: 'ESIC', label: 'ESIC' },
  { id: 'PAYROLL', label: 'Payroll & Attendance' },
  { id: 'FACTORY_COMPLIANCE', label: 'Factory Compliance' },
  { id: 'CONTRACT_LABOUR', label: 'Contract Labour' },
  { id: 'INDUSTRIAL_RELATIONS', label: 'Industrial Relations' },
  { id: 'UNCATEGORIZED', label: 'Uncategorized (Please review)' }
]

const SimpleMenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1 items-center rounded-t-md">
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}>
        <Italic className="w-4 h-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-slate-200' : ''}`}>
        <UnderlineIcon className="w-4 h-4" />
      </Button>
      
      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`}>
        <List className="w-4 h-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-slate-200' : ''}`}>
        <ListOrdered className="w-4 h-4" />
      </Button>

      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      <Button type="button" variant="ghost" size="sm" onClick={setLink} className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-slate-200' : ''}`}>
        <LinkIcon className="w-4 h-4" />
      </Button>
      {editor.isActive('link') && (
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetLink().run()} className="h-8 w-8 p-0 text-red-500">
          <Unlink className="w-4 h-4" />
        </Button>
      )}

      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="h-8 w-8 p-0">
        <Undo className="w-4 h-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="h-8 w-8 p-0">
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function FaqForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEdit = !!initialData

  const [question, setQuestion] = useState(initialData?.question || '')
  const [category, setCategory] = useState(initialData?.category || 'UNCATEGORIZED')
  const [published, setPublished] = useState(initialData?.published || false)
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder || 0)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, codeBlock: false, horizontalRule: false }),
      Underline,
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } })
    ],
    content: initialData?.answer || '',
    editorProps: {
      attributes: { class: 'prose prose-slate max-w-none focus:outline-none min-h-[200px] p-4 bg-white prose-p:leading-relaxed' }
    }
  })

  const handleSubmit = async (e: React.FormEvent, publishState: boolean) => {
    e.preventDefault()
    if (!question.trim()) return setError('Question is required.')
    
    const answerHtml = editor?.getHTML() || ''
    if (!answerHtml || answerHtml === '<p></p>') return setError('Answer is required.')

    setIsSubmitting(true)
    setError('')
    setPublished(publishState)

    try {
      const payload = { question, answer: answerHtml, category, published: publishState, displayOrder: Number(displayOrder) }
      let result = isEdit ? await updateFaq(initialData.id, payload) : await createFaq(payload)
      
      if (result.success) {
        router.push('/admin/faqs')
        router.refresh()
      } else {
        setError(result.error || 'Failed to save FAQ')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 text-[#202522]">
      <div className="flex items-center justify-between gap-4 bg-white p-4 border border-[#D9E1DC] rounded-2xl shadow-xs sticky top-4 z-50">
        <div className="flex items-center gap-3">
          <Link href="/admin/faqs" className="text-[#66736D] hover:text-[#12372A] p-1.5 rounded-lg hover:bg-[#F7F4EC] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-[#12372A]">{isEdit ? 'Edit FAQ' : 'Add FAQ'}</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Button type="button" variant="secondary" onClick={(e) => handleSubmit(e, false)} disabled={isSubmitting} className="bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] border border-[#D9E1DC] rounded-xl text-xs font-bold">
            Save Draft
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting} className="bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold shadow-xs">
            {isSubmitting ? 'Saving...' : (isEdit && published ? 'Save Changes' : 'Publish Live')}
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">{error}</div>}

      <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="question" className="text-xs font-bold text-[#12372A]">Question *</Label>
            <span className={`text-[10px] ${question.length > 180 ? 'text-rose-500 font-bold' : 'text-[#66736D]'}`}>{question.length} / 180</span>
          </div>
          <Input id="question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. What are the key compliances under CLRA?" className="text-sm font-medium rounded-xl border-[#D9E1DC]" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs font-bold text-[#12372A]">Answer *</Label>
            <span className="text-[10px] text-[#66736D]">Recommended: 50–150 words</span>
          </div>
          <div className="border border-[#D9E1DC] rounded-xl overflow-hidden bg-[#F7F4EC]/30">
            <SimpleMenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#D9E1DC]/80">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-bold text-[#12372A]">Category *</Label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="flex h-10 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-xs font-medium text-[#202522] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]">
              {FAQ_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayOrder" className="text-xs font-bold text-[#12372A]">Display Order</Label>
            <Input id="displayOrder" type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} className="rounded-xl border-[#D9E1DC] text-xs font-mono" />
          </div>
        </div>
      </div>
    </div>
  )
}
