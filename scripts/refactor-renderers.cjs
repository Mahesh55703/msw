const fs = require('fs');

function refactorCtaBanner() {
  let code = fs.readFileSync('components/cms/renderers/HomeCtaBannerVisual.tsx', 'utf8');
  if (!code.includes('resolveCmsText')) {
    code = `import { resolveCmsText } from "@/lib/cms/utils";\n` + code;
  }
  
  code = code.replace(
    /\{content\.heading\}/,
    '{resolveCmsText(content.heading, "Not sure where your compliance gaps are?")}'
  );
  
  const descTarget = `{content.description && (
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
              {content.description}
            </p>
          )}`;
          
  const descReplacement = `{resolveCmsText(content.description, "Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention.") && (
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
              {resolveCmsText(content.description, "Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention.")}
            </p>
          )}`;
          
  code = code.replace(descTarget, descReplacement);
  fs.writeFileSync('components/cms/renderers/HomeCtaBannerVisual.tsx', code, 'utf8');
}

function refactorHowWeWork() {
  let code = fs.readFileSync('components/cms/renderers/HomeHowWeWorkVisual.tsx', 'utf8');
  
  const descTarget = `{content.description && (
          <p className="text-lg text-[#66736D]">{content.description}</p>
        )}`;
        
  const descReplacement = `{resolveCmsText(content.description, "A structured approach to bringing compliance under control.") && (
          <p className="text-lg text-[#66736D]">{resolveCmsText(content.description, "A structured approach to bringing compliance under control.")}</p>
        )}`;
        
  code = code.replace(descTarget, descReplacement);
  fs.writeFileSync('components/cms/renderers/HomeHowWeWorkVisual.tsx', code, 'utf8');
}

function refactorWhyUs() {
  let code = fs.readFileSync('components/cms/renderers/HomeWhyUsVisual.tsx', 'utf8');
  
  const descTarget = `{content.description && (
          <p className="text-lg text-[#66736D] text-balance">
            {content.description}
          </p>
        )}`;
        
  const descReplacement = `{resolveCmsText(content.description, "More than routine HR paperwork. We provide structured compliance and HR support.") && (
          <p className="text-lg text-[#66736D] text-balance">
            {resolveCmsText(content.description, "More than routine HR paperwork. We provide structured compliance and HR support.")}
          </p>
        )}`;
        
  code = code.replace(descTarget, descReplacement);
  fs.writeFileSync('components/cms/renderers/HomeWhyUsVisual.tsx', code, 'utf8');
}

refactorCtaBanner();
refactorHowWeWork();
refactorWhyUs();
