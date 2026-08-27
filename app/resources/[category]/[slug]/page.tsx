import { resourcesData } from "@/data/resources";
import { servicesData } from "@/data/services";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Calendar, Clock, Download, ArrowRight, List, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];
  resourcesData.forEach(r => {
    if (r.type === 'faq') return;
    params.push({
      category: r.type + 's',
      slug: r.slug
    });
  });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const resource = resourcesData.find(r => r.slug === resolvedParams.slug && r.type + 's' === resolvedParams.category);
  
  if (!resource) return { title: "Not Found" };
  
  return {
    title: `${resource.title} | LabourAxis`,
    description: resource.excerpt,
  };
}

function InArticleCTA() {
  return (
    <div className="my-10 bg-slate-50 border-l-4 border-blue-600 p-6 rounded-r-xl shadow-sm not-prose">
      <h4 className="text-xl font-bold text-slate-900 mb-2">Not sure whether your current processes have compliance gaps?</h4>
      <p className="text-slate-600 mb-4">
        LabourAxis can help you review your HR and labour compliance processes and identify areas that may need attention.
      </p>
      <Link href="/contact" className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 group">
        Request a Compliance Health Check <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const resolvedParams = await params;
  const resource = resourcesData.find(r => r.slug === resolvedParams.slug && r.type + 's' === resolvedParams.category);
  
  if (!resource) notFound();

  const relatedServices = servicesData.filter(s => resource.relatedServices?.includes(s.slug));
  const relatedArticles = resourcesData.filter(r => r.type === 'article' && r.slug !== resource.slug).slice(0, 3);

  // TOC generator
  const toc = (resource.content?.match(/^## (.*?)$/gm) || []).map(header => {
    const text = header.replace(/^## /, '').replace(/\*\*/g, '').trim();
    return { text, id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') };
  });

  let contentPart1 = resource.content || '';
  let contentPart2 = '';

  if (resource.type === 'article' && resource.content) {
    const headings = resource.content.match(/^## (.*?)$/gm);
    if (headings && headings.length >= 3) {
      const splitIndex = resource.content.indexOf(headings[Math.floor(headings.length / 2)]);
      contentPart1 = resource.content.substring(0, splitIndex);
      contentPart2 = resource.content.substring(splitIndex);
    }
  }

  const MarkdownComponents = {
    h2: ({node, ...props}: any) => {
      const id = typeof props.children === 'string' 
        ? props.children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : '';
      return <h2 id={id} className="scroll-mt-32 mt-12 mb-6 text-2xl font-bold" {...props} />;
    },
    h3: ({node, ...props}: any) => <h3 className="scroll-mt-32 mt-8 mb-4 text-xl font-bold" {...props} />,
    blockquote: ({node, ...props}: any) => {
      // Very basic blockquote rendering logic
      return <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-6" {...props} />;
    }
  };

  return (
    <div className="flex flex-col pb-24 bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <nav className="flex text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <Link href="/resources" className="hover:text-slate-900">Resources</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <Link href={`/resources/${resolvedParams.category}`} className="hover:text-slate-900 capitalize">
              {resolvedParams.category}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{resource.title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="bg-slate-50 border-b border-slate-200 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
            {resource.category}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 text-balance leading-tight">
            {resource.title}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed text-balance mx-auto">
            {resource.excerpt}
          </p>
          
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 font-medium">
            {resource.author && (
              <div className="flex items-center gap-2 text-slate-900">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  {resource.authorImage ? <Image src={resource.authorImage} alt={resource.author} width={32} height={32} /> : <User className="w-4 h-4" />}
                </div>
                By {resource.author}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Published: {new Date(resource.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {resource.updatedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {resource.type === 'guide' ? 'Last reviewed: ' : 'Updated: '}
                {new Date(resource.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            {resource.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {resource.readingTime}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Image / Guide Cover */}
      {resource.type === 'article' && resource.featuredImage && (
        <div className="container mx-auto px-4 md:px-8 max-w-5xl -mt-8 relative z-10 mb-16">
          <div className="aspect-[21/9] relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
            <Image src={resource.featuredImage} alt={resource.title} fill className="object-contain p-8" priority />
          </div>
        </div>
      )}

      {resource.type === 'guide' && (
        <div className="container mx-auto px-4 md:px-8 max-w-3xl -mt-8 relative z-10 mb-16">
          <div className="aspect-[16/9] md:aspect-[21/9] relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
             <div className="font-bold text-sm tracking-widest text-slate-400 mb-6 uppercase">LabourAxis</div>
             <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-xl">{resource.title}</h2>
             <div className="text-slate-300 font-medium">HR • Labour • Compliance</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-8">
        
        <div className={`flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 items-start`}>
          
          {/* Right Sidebar for Articles & Guides */}
          {resource.type !== 'checklist' && (
            <aside className="lg:w-[320px] shrink-0 lg:sticky lg:top-28 w-full space-y-8">
              
              {/* TOC */}
              {toc.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 hidden lg:block">
                  <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                    <List className="w-4 h-4"/> In This {resource.type === 'guide' ? 'Guide' : 'Article'}
                  </h3>
                  <ul className="space-y-3">
                    {toc.map((item, idx) => (
                      <li key={idx}>
                        <a href={`#${item.id}`} className="text-slate-600 hover:text-blue-600 text-sm block leading-snug">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sidebar CTA */}
              <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md hidden lg:block">
                <h3 className="font-bold text-lg mb-3">
                  {resource.type === 'guide' ? 'Need help reviewing your factory compliance?' : 'NEED HELP?'}
                </h3>
                <p className="text-slate-300 text-sm mb-6">
                  {resource.type === 'guide' 
                    ? 'LabourAxis can help review your HR, labour and statutory compliance processes and identify areas that may require attention.'
                    : 'Review your HR & labour compliance processes with our experts.'}
                </p>
                <Link href="/contact" className="block text-center bg-white text-slate-900 font-bold py-3 px-4 rounded hover:bg-slate-100 transition-colors w-full">
                  Request a Compliance Health Check
                </Link>
              </div>

              {/* Related Services in sidebar */}
              <div className="hidden lg:block">
                <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Related Services</h3>
                <div className="space-y-3">
                  {relatedServices.map(service => (
                    <Link key={service.slug} href={`/services/${service.slug}`} className="block group">
                      <div className="bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600">{service.title}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Article Body */}
          <article className={`flex-1 min-w-0 ${resource.type === 'checklist' ? 'max-w-4xl mx-auto w-full' : 'max-w-[800px] w-full'}`}>
            
            {/* Guide/Article Content */}
            {resource.type !== 'checklist' && (
              <>
                {/* Key Takeaways */}
                {resource.keyTakeaways && resource.keyTakeaways.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 mb-12">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      Key Takeaways
                    </h3>
                    <ul className="space-y-3">
                      {resource.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-blue-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                          <span className="leading-relaxed">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-li:marker:text-slate-400">
                  <ReactMarkdown components={MarkdownComponents}>{contentPart1}</ReactMarkdown>
                  
                  {contentPart2 && <InArticleCTA />}
                  
                  {contentPart2 && <ReactMarkdown components={MarkdownComponents}>{contentPart2}</ReactMarkdown>}
                </div>

                {/* Author Profile */}
                {(resource.type === 'article' || resource.type === 'guide') && resource.author && (
                  <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-50 p-8 rounded-2xl">
                    <div className="w-24 h-24 shrink-0 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                      {resource.authorImage ? <Image src={resource.authorImage} alt={resource.author} width={96} height={96} /> : <User className="w-10 h-10 text-slate-400" />}
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">{resource.author}</h4>
                      <p className="text-slate-500 text-sm font-medium mb-3 uppercase tracking-wider">HR, Labour & Compliance Content</p>
                      {resource.authorBio && <p className="text-slate-600 mb-4">{resource.authorBio}</p>}
                      <Link href="/about" className="text-blue-600 font-bold hover:underline text-sm">View About LabourAxis &rarr;</Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </article>
        </div>
      </div>

      {/* Related Articles & Final CTA Area */}
      {resource.type === 'article' && (
        <div className="bg-slate-50 border-t border-slate-200 py-20 mt-12">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mb-20">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedArticles.map((rel) => (
                    <Link key={rel.slug} href={`/resources/articles/${rel.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-200 group flex flex-col h-full">
                      <div className="p-6 flex flex-col h-full">
                        <span className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">{rel.category}</span>
                        <h4 className="font-bold text-slate-900 text-xl mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">{rel.title}</h4>
                        <div className="mt-auto flex items-center text-sm font-bold text-slate-500 group-hover:text-blue-600">
                          Read Article <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Final CTA */}
            <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white max-w-4xl mx-auto shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Need help with HR or labour compliance?</h2>
              <p className="text-xl text-slate-300 mb-10 text-balance max-w-2xl mx-auto leading-relaxed">
                If you're unsure where your business currently stands, LabourAxis can help you identify areas that may require attention.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-blue-600 hover:bg-blue-700 text-white border-0 w-full sm:w-auto" })}>
                  Request a Compliance Health Check
                </Link>
                <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg", className: "bg-transparent text-white border-white hover:bg-white/10 w-full sm:w-auto" })}>
                  Discuss Your Requirement
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Final Area */}
      {resource.type === 'guide' && (
        <div className="bg-slate-50 border-t border-slate-200 py-20 mt-12">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            
            <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white max-w-4xl mx-auto shadow-xl mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Need Help Reviewing Your Factory Compliance?</h2>
              <p className="text-xl text-slate-300 mb-10 text-balance max-w-2xl mx-auto leading-relaxed">
                Understand where your current HR and labour compliance processes may have gaps.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-blue-600 hover:bg-blue-700 text-white border-0 w-full sm:w-auto" })}>
                  Request a Compliance Health Check
                </Link>
                <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg", className: "bg-transparent text-white border-white hover:bg-white/10 w-full sm:w-auto" })}>
                  Discuss Your Requirements
                </Link>
              </div>
            </div>

            {resource.relatedResources && resource.relatedResources.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Related Resources</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {resourcesData.filter(r => resource.relatedResources?.includes(r.slug)).map(rel => (
                    <Link key={rel.slug} href={`/resources/${rel.type}s/${rel.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-6 flex flex-col">
                       <span className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">{rel.category}</span>
                       <h4 className="font-bold text-slate-900 text-lg mb-4 line-clamp-2">{rel.title}</h4>
                       <div className="mt-auto text-sm font-bold text-slate-500 group-hover:text-blue-600 flex items-center">
                         View Resource <ArrowRight className="w-4 h-4 ml-1" />
                       </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
