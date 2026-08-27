const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../app');

const pages = [
  {
    path: 'page.tsx',
    title: 'LabourAxis | Industrial HR & Labour Compliance Consultancy',
    description: 'Practical HR, labour compliance, PF, ESIC and workforce support for factories, MSMEs and workforce-intensive businesses across India.',
  },
  {
    path: 'about/page.tsx',
    title: 'About LabourAxis | Industrial HR & Labour Compliance',
    description: 'Learn about LabourAxis, our mission, values, and our expertise in providing practical HR and statutory compliance support for workforce-intensive businesses.',
  },
  {
    path: 'contact/page.tsx',
    title: 'Contact LabourAxis | HR & Labour Compliance Consultation',
    description: 'Get in touch with LabourAxis for practical HR, labour compliance, PF, ESIC, and workforce support tailored to your business needs.',
  },
  {
    path: 'team/page.tsx',
    title: 'Our Team | LabourAxis',
    description: 'Meet the LabourAxis team of HR and labour compliance experts dedicated to helping factories and MSMEs across India reduce risk and build better workplaces.',
  },
  {
    path: 'careers/page.tsx',
    title: 'Careers at LabourAxis | HR & Labour Compliance',
    description: 'Join LabourAxis and help shape the future of industrial HR and labour compliance in India. Explore our current open roles and opportunities.',
  },
  {
    path: 'compliance-health-check/page.tsx',
    title: 'Labour & Statutory Compliance Health Check | LabourAxis',
    description: 'Request a comprehensive health check from LabourAxis to identify gaps, mitigate risks, and strengthen your statutory and labour compliance frameworks.',
  },
  {
    path: 'services/page.tsx',
    title: 'HR & Labour Compliance Services | LabourAxis',
    description: 'Explore LabourAxis services including PF, ESIC, Factory Compliance, Contract Labour, and comprehensive HR consulting for Indian industries.',
  },
  {
    path: 'industries/page.tsx',
    title: 'Industries We Serve | LabourAxis',
    description: 'LabourAxis provides tailored HR and compliance solutions across manufacturing, construction, logistics, and other workforce-intensive industries.',
  },
  {
    path: 'resources/page.tsx',
    title: 'HR & Labour Compliance Resources | LabourAxis',
    description: 'Access LabourAxis resources including guides, articles, checklists, and updates to stay compliant with Indian labour laws and statutory regulations.',
  },
  {
    path: 'resources/faqs/page.tsx',
    title: 'HR, Labour & Compliance FAQs | LabourAxis',
    description: 'Find answers to frequently asked questions regarding PF, ESIC, factory compliance, contract labour, and general HR regulations in India.',
  },
  {
    path: 'privacy-policy/page.tsx',
    title: 'Privacy Policy | LabourAxis',
    description: 'Read the LabourAxis Privacy Policy to understand how we collect, use, and protect your personal and business information.',
  },
  {
    path: 'terms/page.tsx',
    title: 'Terms of Service | LabourAxis',
    description: 'Read the LabourAxis Terms of Service covering the usage of our website and HR and compliance consultation services.',
  },
  {
    path: 'disclaimer/page.tsx',
    title: 'Disclaimer | LabourAxis',
    description: 'Important legal disclaimer regarding the use of LabourAxis website content and our position on providing general informational compliance content.',
  }
];

function updateMetadata(filePath, metadataConfig) {
  const fullPath = path.join(baseDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  const routePath = filePath.replace(/page\.tsx$/, '').replace(/\/$/, '');
  const metadataBlock = `export const metadata: Metadata = {
  title: "${metadataConfig.title}",
  description: "${metadataConfig.description}",
  alternates: {
    canonical: "/${routePath}"
  }
};`;

  // Use a regex to replace the existing metadata block
  const regex = /export const metadata:\s*Metadata\s*=\s*\{[\s\S]*?\};/m;
  if (regex.test(content)) {
    content = content.replace(regex, metadataBlock);
    console.log(`Updated metadata in ${filePath}`);
  } else {
    // If we can't find the block to replace, but maybe it doesn't have the explicit type
    const looseRegex = /export const metadata\s*=\s*\{[\s\S]*?\};/m;
    if (looseRegex.test(content)) {
      content = content.replace(looseRegex, metadataBlock);
      console.log(`Updated loose metadata in ${filePath}`);
    } else {
      console.warn(`Could not find metadata block in ${filePath}, skipping regex replace.`);
    }
  }

  fs.writeFileSync(fullPath, content);
}

pages.forEach(page => {
  if (page.path !== 'page.tsx') {
    updateMetadata(page.path, page);
  } else {
    // For page.tsx we already inserted it in the previous run, we can just update it using regex
    updateMetadata(page.path, page);
  }
});
