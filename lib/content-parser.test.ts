import { parseAndFormatArticleContent } from './content-parser'
import assert from 'assert'

function testSanitization() {
  const maliciousMarkdown = `
# Hello
This is a [link](javascript:alert(1)).
<script>alert('XSS')</script>
<img src=x onerror=alert(2)>
<a href="https://example.com" target="_blank">External Link</a>
`
  
  const result = parseAndFormatArticleContent(maliciousMarkdown)
  console.log("Result HTML:\n", result.html)
  
  // Script should be removed
  assert(!result.html.includes('<script>'), "Failed: Script tag remains")
  
  // javascript: link should be neutralized (DOMPurify usually removes the href or the tag)
  assert(!result.html.includes('javascript:alert(1)'), "Failed: javascript: link remains")
  
  // onerror should be removed
  assert(!result.html.includes('onerror'), "Failed: onerror remains")
  
  // valid link should have rel="noopener noreferrer" added
  assert(result.html.includes('rel="noopener noreferrer"'), "Failed: rel noopener missing")

  console.log("✅ All XSS defense tests passed.")
}

testSanitization()
