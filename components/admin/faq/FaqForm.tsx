'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { createFaq, updateFaq } from '@/app/actions/faq'
import { FAQ_CATEGORY_LABELS, FaqCategoryType } from '@/lib/validations/faq'

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
    <div className="border-b border-[#D9E1DC] bg-[#F7F4EC] p-2 flex flex-wrap gap-1 items-center rounded-t-2xl">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('bold') ? 'bg-white shadow-xs font-bold text-[#1F7A5C]' : 'text-[#66736D]'}`}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('italic') ? 'bg-white shadow-xs font-bold text-[#1F7A5C]' : 'text-[#66736D]'}`}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('underline') ? 'bg-white shadow-xs font-bold text-[#1F7A5C]' : 'text-[#66736D]'}`}
      >
        <UnderlineIcon className="w-4 h-4" />
      </Button>

      <div className="w-px h-5 bg-[#D9E1DC] mx-1"></div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('bulletList') ? 'bg-white shadow-xs font-bold text-[#1F7A5C]' : 'text-[#66736D]'}`}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('orderedList') ? 'bg-white shadow-xs font-bold text-[#1F7A5C]' : 'text-[#66736D]'}`}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <div className="w-px h-5 bg-[#D9E1DC] mx-1"></div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={setLink}
        className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('link') ? 'bg-white shadow-xs text-[#1F7A5C]' : 'text-[#66736D]'}`}
      >
        <LinkIcon className="w-4 h-4" />
      </Button>
      {editor.isActive('link') && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50"
        >
          <Unlink className="w-4 h-4" />
        </Button>
      )}

      <div className="w-px h-5 bg-[#D9E1DC] mx-1"></div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 p-0 rounded-lg text-[#66736D]"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 p-0 rounded-lg text-[#66736D]"
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function FaqForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEdit = !!initialData

  const [question, setQuestion] = useState(initialData?.question || '')
  const [category, setCategory] = useState<FaqCategoryType>(
    initialData?.category || 'LABOUR_COMPLIANCE'
  )
  const [published, setPublished] = useState(initialData?.published || false)
  const [displayOrder, setDisplayOrder] = useState<number>(
    typeof initialData?.displayOrder === 'number' ? initialData.displayOrder : 1
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#1F7A5C] underline cursor-pointer' },
      }),
    ],
    content: initialData?.answer || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[220px] p-4 bg-white prose-p:leading-relaxed text-xs sm:text-sm',
      },
    },
    onUpdate: () => setIsDirty(true),
  })

  // Unsaved changes browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleSubmit = async (e: React.FormEvent, publishState: boolean) => {
    e.preventDefault()
    if (!question.trim()) {
      setError('Question is required.')
      return
    }

    const answerHtml = editor?.getHTML() || ''
    if (!answerHtml || answerHtml === '<p></p>') {
      setError('Answer is required.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        question: question.trim(),
        answer: answerHtml,
        category,
        published: publishState,
        displayOrder: Math.max(0, Number(displayOrder) || 0),
      }

      const result = isEdit
        ? await updateFaq(initialData.id, payload)
        : await createFaq(payload)

      if (result.success) {
        setIsDirty(false)
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
      {/* Sticky Top Action Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 border border-[#D9E1DC] rounded-3xl shadow-xs sticky top-4 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/faqs"
            className="text-[#66736D] hover:text-[#12372A] p-2 rounded-xl hover:bg-[#F7F4EC] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#12372A]">
              {isEdit ? 'Edit FAQ' : 'Add FAQ'}
            </h1>
            <p className="text-[10px] text-[#66736D]">
              {published ? '● Live on public FAQ page' : '○ Saved as draft'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
            className="bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] border border-[#D9E1DC] rounded-2xl text-xs font-bold px-4 py-2.5"
          >
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-2xl text-xs font-bold px-5 py-2.5 shadow-xs"
          >
            {isSubmitting ? 'Saving...' : isEdit && published ? 'Save Changes' : 'Publish Live'}
          </Button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-semibold border border-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uncategorized Warning Banner */}
      {category === 'UNCATEGORIZED' && (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl text-xs font-semibold border border-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            This FAQ is currently marked as <strong>Uncategorized</strong>. Please select an
            applicable compliance category before publishing.
          </span>
        </div>
      )}

      {/* Main FAQ Content Form */}
      <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 sm:p-8 space-y-6">
        {/* Question */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="question" className="text-xs font-bold text-[#12372A]">
              Question *
            </Label>
            <span
              className={`text-[10px] ${
                question.length > 280 ? 'text-rose-500 font-bold' : 'text-[#66736D]'
              }`}
            >
              {question.length} / 300
            </span>
          </div>
          <Input
            id="question"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              setIsDirty(true)
            }}
            placeholder="e.g. What documents must be maintained under the Factories Act?"
            className="text-sm font-semibold rounded-2xl border-[#D9E1DC] h-12 focus:ring-2 focus:ring-[#1F7A5C]"
          />
        </div>

        {/* Answer */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold text-[#12372A]">
              Answer *
            </Label>
            <span className="text-[10px] text-[#66736D]">Clear, concise compliance guidance</span>
          </div>
          <div className="border border-[#D9E1DC] rounded-2xl overflow-hidden bg-[#F7F4EC]/30">
            <SimpleMenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Metadata Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#D9E1DC]/80">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-bold text-[#12372A]">
              Compliance Category *
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as FaqCategoryType)
                setIsDirty(true)
              }}
              className="flex h-11 w-full rounded-2xl border border-[#D9E1DC] bg-white px-3.5 py-2 text-xs font-semibold text-[#202522] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
            >
              {Object.entries(FAQ_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="displayOrder" className="text-xs font-bold text-[#12372A]">
                Display Order in Category
              </Label>
              <span className="text-[10px] text-[#66736D]">Lower numbers appear first</span>
            </div>
            <Input
              id="displayOrder"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => {
                setDisplayOrder(Math.max(0, parseInt(e.target.value, 10) || 0))
                setIsDirty(true)
              }}
              className="rounded-2xl border-[#D9E1DC] text-xs font-mono h-11"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
