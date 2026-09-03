const fs = require('fs');

let code = fs.readFileSync('components/cms/renderers/HomeHeroVisual.tsx', 'utf8');

const targetHeadingBlock = `              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance leading-[1.12] text-white">
                {content.heading.split('Strengthen Compliance.').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i === 0 && arr.length > 1 && (
                      <span className="text-[#D6A84F]">Strengthen Compliance.</span>
                    )}
                  </span>
                ))}
              </h1>`;

const replacedHeadingBlock = `              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance leading-[1.12] text-white">
                {resolveCmsText(content.heading, 'Simplify HR. Strengthen Compliance. Reduce Risk.').split('Strengthen Compliance.').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i === 0 && arr.length > 1 && (
                      <span className="text-[#D6A84F]">Strengthen Compliance.</span>
                    )}
                  </span>
                ))}
              </h1>`;

code = code.replace(targetHeadingBlock, replacedHeadingBlock);

const eyebrowTarget = `              {content.eyebrow && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-6 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-4 py-1.5 rounded-full shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                  <span>{content.eyebrow}</span>
                </div>
              )}`;

const eyebrowReplacement = `              {resolveCmsText(content.eyebrow, "Industrial HR & Labour Compliance Consultancy") && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-6 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-4 py-1.5 rounded-full shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                  <span>{resolveCmsText(content.eyebrow, "Industrial HR & Labour Compliance Consultancy")}</span>
                </div>
              )}`;

code = code.replace(eyebrowTarget, eyebrowReplacement);

const descTarget = `              {content.description && (
                <p className="text-lg md:text-xl text-[#A2B3AA] mb-10 text-balance leading-relaxed">
                  {content.description}
                </p>
              )}`;

const descReplacement = `              {resolveCmsText(content.description, "Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses.") && (
                <p className="text-lg md:text-xl text-[#A2B3AA] mb-10 text-balance leading-relaxed">
                  {resolveCmsText(content.description, "Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses.")}
                </p>
              )}`;

code = code.replace(descTarget, descReplacement);

fs.writeFileSync('components/cms/renderers/HomeHeroVisual.tsx', code, 'utf8');
