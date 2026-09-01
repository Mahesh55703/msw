import { marked } from 'marked'

export interface TocItem {
  id: string
  text: string
  level: number
}

export interface ParsedContentResult {
  html: string
  toc: TocItem[]
  wordCount: number
  readingTimeMinutes: number
  readingTimeText: string
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function slugifyHeading(text: string): string {
  const decoded = decodeHtmlEntities(text)
  return decoded
    .toLowerCase()
    .replace(/<[^>]+>/g, '') // remove inner HTML tags
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * Calculates word count from plain text or HTML/markdown string
 */
export function calculateWordCount(content: string): number {
  if (!content) return 0
  const plainText = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*`_~[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plainText) return 0
  return plainText.split(/\s+/).length
}

/**
 * Calculates reading time in minutes and formatted text (approx 200 words per min)
 */
export function calculateReadingTime(content: string): { minutes: number; text: string; wordCount: number } {
  const wordCount = calculateWordCount(content)
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  return {
    wordCount,
    minutes,
    text: `${minutes} min read`
  }
}

/**
 * Normalizes content (markdown or HTML) into clean semantic HTML with anchored H2/H3 headings
 * and extracts the Table of Contents.
 */
export function parseAndFormatArticleContent(rawContent: string): ParsedContentResult {
  if (!rawContent || !rawContent.trim()) {
    return {
      html: '',
      toc: [],
      wordCount: 0,
      readingTimeMinutes: 1,
      readingTimeText: '1 min read'
    }
  }

  let html = rawContent.trim()

  // If content looks like markdown (e.g. contains ##, **, or lacks common HTML tags like <p>, <div>, <h2>), parse it with marked
  const isMarkdownLike = !/<(p|div|h2|h3|ul|ol|blockquote)[\s>]/i.test(html) || /(^|\n)##\s+/m.test(html) || /(^|\n)>\s+/m.test(html)
  
  if (isMarkdownLike) {
    try {
      const parsed = marked.parse(html, { async: false, gfm: true, breaks: true }) as string
      if (parsed) {
        html = parsed
      }
    } catch (err) {
      console.error('Error parsing markdown content:', err)
    }
  }

  // Downgrade any <h1> to <h2> because article title is the only H1
  html = html.replace(/<h1(\s*[^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>')

  const toc: TocItem[] = []
  const usedSlugs = new Set<string>()

  // Process H2 and H3 to attach ID anchors and build TOC
  html = html.replace(/<(h[23])(\s*[^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, innerText) => {
    const level = parseInt(tag.replace(/h/i, ''), 10)
    const cleanText = decodeHtmlEntities(innerText.replace(/<[^>]+>/g, '').trim())
    if (!cleanText) return match

    const baseSlug = slugifyHeading(cleanText) || `section-${toc.length + 1}`
    let finalSlug = baseSlug
    let counter = 1
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`
      counter++
    }
    usedSlugs.add(finalSlug)

    // Only add H2s (and major H3s) to TOC
    if (level === 2) {
      toc.push({
        id: finalSlug,
        text: cleanText,
        level
      })
    }

    // Clean existing id attribute if present, then add new id
    const cleanAttrs = attrs.replace(/\sid="[^"]*"/gi, '')
    return `<${tag}${cleanAttrs} id="${finalSlug}">${innerText}</${tag}>`
  })

  const { wordCount, minutes, text } = calculateReadingTime(html)

  return {
    html,
    toc,
    wordCount,
    readingTimeMinutes: minutes,
    readingTimeText: text
  }
}
