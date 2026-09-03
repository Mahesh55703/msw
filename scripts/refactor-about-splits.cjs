const fs = require('fs');

function refactorAbout() {
  let code = fs.readFileSync('app/about/page.tsx', 'utf8');
  
  // Fix hero description split
  code = code.replace(
    /\{heroSection\?\.description\?\.split\("\. "\)\[0\] \? heroSection\.description\.split\("\. "\)\[0\] \+ "\." : "Practical HR and labour compliance for businesses that employ people\."\}/,
    '{resolveCmsText(heroSection?.description?.split(". ")[0], "Practical HR and labour compliance for businesses that employ people.") + (heroSection?.description?.split(". ")[0] ? "." : "")}'
  );
  
  code = code.replace(
    /\{heroSection\?\.description\?\.split\("\. "\)\.slice\(1\)\.join\("\. "\) \|\| "LabourAxis focuses on the intersection of HR Operations, Labour Compliance, Industrial Relations, and Workforce Management\."\}/,
    '{resolveCmsText(heroSection?.description?.split(". ").slice(1).join(". "), "LabourAxis focuses on the intersection of HR Operations, Labour Compliance, Industrial Relations, and Workforce Management.")}'
  );

  // Fix who we are body split
  code = code.replace(
    /\{whoWeAreSection\?\.body\?\.split\("\\n\\n"\)\[0\] \|\| "LabourAxis is being built around a simple idea: HR and compliance should not operate as disconnected administrative functions\."\}/,
    '{resolveCmsText(whoWeAreSection?.body?.split("\\n\\n")[0], "LabourAxis is being built around a simple idea: HR and compliance should not operate as disconnected administrative functions.")}'
  );
  
  code = code.replace(
    /\{whoWeAreSection\?\.body\?\.split\("\\n\\n"\)\[1\] \|\| "Businesses need structured HR processes, organized workforce records, clear compliance tracking and practical support to manage their people effectively\."\}/,
    '{resolveCmsText(whoWeAreSection?.body?.split("\\n\\n")[1], "Businesses need structured HR processes, organized workforce records, clear compliance tracking and practical support to manage their people effectively.")}'
  );

  fs.writeFileSync('app/about/page.tsx', code, 'utf8');
}

refactorAbout();
