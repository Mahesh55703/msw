'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Link as LinkIcon,
  Unlink,
  Pilcrow
} from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { parseAndFormatArticleContent } from '@/lib/content-parser'

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Enter Image URL (or paste a public CDN link):')
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter Link Destination URL (e.g. https://... or /contact):', previousUrl)
    if (url === null) {
      return
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="sticky top-0 z-10 border-b border-[#D9E1DC] bg-white/95 backdrop-blur-xs p-2 flex flex-wrap gap-1 items-center">
      {/* Paragraph / Normal */}
      <button
        type="button"
        title="Paragraph"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
          editor.isActive('paragraph') && !editor.isActive('heading')
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        <Pilcrow className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">P</span>
      </button>

      <div className="w-px h-4 bg-[#D9E1DC] mx-1" />

      {/* Headings - H2, H3, H4 ONLY (No H1) */}
      <button
        type="button"
        title="Heading 2 (Section Title)"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        H2
      </button>
      <button
        type="button"
        title="Heading 3 (Subsection)"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        H3
      </button>
      <button
        type="button"
        title="Heading 4 (Minor Heading)"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive('heading', { level: 4 })
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        H4
      </button>

      <div className="w-px h-4 bg-[#D9E1DC] mx-1" />

      {/* Formatting Marks */}
      <button
        type="button"
        title="Bold (Ctrl+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('bold')
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Italic (Ctrl+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('italic')
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Underline (Ctrl+U)"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('underline')
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-[#D9E1DC] mx-1" />

      {/* Lists & Quotes */}
      <button
        type="button"
        title="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Numbered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('blockquote')
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        <Quote className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-[#D9E1DC] mx-1" />

      {/* Links & Media */}
      <button
        type="button"
        title="Insert Link"
        onClick={setLink}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('link')
            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
            : 'text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A]'
        }`}
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>
      {editor.isActive('link') && (
        <button
          type="button"
          title="Remove Link"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Unlink className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        title="Insert Image by URL"
        onClick={addImage}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-[#66736D] hover:bg-[#F7F4EC] hover:text-[#12372A] transition-colors"
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-[#D9E1DC] mx-1" />

      {/* Undo & Redo */}
      <button
        type="button"
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-[#66736D] hover:bg-[#F7F4EC] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <Undo className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-[#66736D] hover:bg-[#F7F4EC] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <Redo className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function TiptapEditor({
  content,
  onChange,
}: {
  content: string
  onChange: (html: string) => void
}) {
  // Normalize initial content if it contains markdown or unformatted tokens
  const initialHtml = parseAndFormatArticleContent(content || '').html

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#1F7A5C] underline font-semibold hover:text-[#165B44] cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto mx-auto my-6 border border-[#D9E1DC] shadow-xs',
        },
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[420px] p-6 bg-white prose-headings:font-bold prose-headings:text-[#12372A] prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-[#202522] prose-p:text-sm prose-blockquote:border-l-4 prose-blockquote:border-[#1F7A5C] prose-blockquote:bg-[#F7F4EC]/60 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-ul:list-disc prose-ol:list-decimal prose-li:text-sm prose-li:text-[#202522]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Synchronize editor if content changes externally
  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML()
      const parsedNew = parseAndFormatArticleContent(content).html
      if (currentHtml !== parsedNew && currentHtml === '<p></p>' && parsedNew) {
        editor.commands.setContent(parsedNew)
      }
    }
  }, [content, editor])

  return (
    <div className="w-full flex flex-col border border-[#D9E1DC] rounded-2xl overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-[#1F7A5C] focus-within:border-[#1F7A5C] transition-all">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto max-h-[650px] bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
