
const fs = require('fs');

try {
  let code = fs.readFileSync('app/admin/guides/new/page.tsx', 'utf8');
  code = code.replace(
    'return <GuideEditor users={users} />',
    \const services = await prisma.page.findMany({
      where: { path: { startsWith: '/services/' }, status: 'PUBLISHED' },
      select: { path: true, publishedRevision: { select: { seoTitle: true } } }
    });
    
    const availableServices = services.map(s => ({
      slug: s.path.replace('/services/', ''),
      title: s.publishedRevision?.seoTitle?.split(' |')[0] || s.path.replace('/services/', '').replace(/-/g, ' ')
    }));

    return <GuideEditor users={users} availableServices={availableServices} />\
  );
  fs.writeFileSync('app/admin/guides/new/page.tsx', code);
} catch (e) { console.log('No new guide page'); }

try {
  let code2 = fs.readFileSync('app/admin/guides/[id]/edit/page.tsx', 'utf8');
  code2 = code2.replace(
    'return <GuideEditor initialData={guide} users={users} />',
    \const services = await prisma.page.findMany({
      where: { path: { startsWith: '/services/' }, status: 'PUBLISHED' },
      select: { path: true, publishedRevision: { select: { seoTitle: true } } }
    });
    
    const availableServices = services.map(s => ({
      slug: s.path.replace('/services/', ''),
      title: s.publishedRevision?.seoTitle?.split(' |')[0] || s.path.replace('/services/', '').replace(/-/g, ' ')
    }));

    return <GuideEditor initialData={guide} users={users} availableServices={availableServices} />\
  );
  fs.writeFileSync('app/admin/guides/[id]/edit/page.tsx', code2);
} catch (e) { console.log('No edit guide page'); }

