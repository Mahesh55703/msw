import 'dotenv/config'

async function check() {
  const res = await fetch('http://localhost:3000/resources/faqs')
  const html = await res.text()
  const m = html.match(/\/resources\/faqs\/[a-zA-Z0-9_-]+/g)
  console.log('Matches:', m)
}
check()
