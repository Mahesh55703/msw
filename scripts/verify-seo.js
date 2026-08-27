const http = require('http');

const URLS_TO_TEST = [
  '/',
  '/about',
  '/services/hr-consulting',
  '/industries/manufacturing',
  '/resources/articles',
  '/resources/articles/pf-esic-updates-2024',
  '/resources/faqs',
  '/contact'
];

async function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3003${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log("=== METADATA CHECK ===");
  for (const path of URLS_TO_TEST) {
    try {
      const { status, html } = await fetchUrl(path);
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) 
                     || html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i);
      const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
      const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
      const robotsMatch = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"[^>]*>/i);
      
      console.log(`URL: ${path} (Status: ${status})`);
      console.log(`Title: ${titleMatch ? titleMatch[1] : 'MISSING'}`);
      console.log(`Desc:  ${descMatch ? descMatch[1] : 'MISSING'}`);
      console.log(`Canon: ${canonicalMatch ? canonicalMatch[1] : 'MISSING'}`);
      console.log(`Robots:${robotsMatch ? robotsMatch[1] : 'MISSING'}`);
      console.log(`OG Tit:${ogTitleMatch ? ogTitleMatch[1] : 'MISSING'}`);
      console.log("-----------------------------------------");
    } catch (e) {
      console.error(`Failed to fetch ${path}:`, e.message);
    }
  }

  console.log("\n=== 404 TEST ===");
  const missingUrls = [
    '/services/does-not-exist',
    '/industries/does-not-exist',
    '/resources/articles/does-not-exist'
  ];
  for (const path of missingUrls) {
    try {
      const { status } = await fetchUrl(path);
      console.log(`URL: ${path} - Status: ${status}`);
    } catch (e) {
      console.error(e);
    }
  }
}

run();
