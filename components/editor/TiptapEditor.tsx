'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, Heading4, List, ListOrdered, Quote, Undo, Redo, ImageIcon, Link as LinkIcon, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const addImage = useCallback(() => {
    const url = window.prompt('URL of the image:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) {
      return
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-2 flex flex-wrap gap-1 items-center shadow-sm">
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

      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`h-8 px-2 font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}`}>
        H2
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`h-8 px-2 font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200' : ''}`}>
        H3
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={`h-8 px-2 font-bold ${editor.isActive('heading', { level: 4 }) ? 'bg-slate-200' : ''}`}>
        H4
      </Button>

      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`}>
        <List className="w-4 h-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-slate-200' : ''}`}>
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-slate-200' : ''}`}>
        <Quote className="w-4 h-4" />
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
      <Button type="button" variant="ghost" size="sm" onClick={addImage} className="h-8 w-8 p-0">
        <ImageIcon className="w-4 h-4" />
      </Button>

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

export default function TiptapEditor({ 
  content, 
  onChange 
}: { 
  content: string, 
  onChange: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4]
        }
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto my-4',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6 bg-white prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-p:text-slate-700',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="w-full h-full flex flex-col border border-slate-200 rounded-md overflow-hidden bg-slate-50 relative">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto max-h-[70vh]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
