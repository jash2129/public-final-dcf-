import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from '../data/blogPosts';

export default function BlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-dark mb-4">Article Not Found</h2>
        <Link to="/blog" className="text-brand font-bold flex items-center gap-2 hover:underline">
          <ArrowLeft className="h-5 w-5" /> Back to Blog
        </Link>
      </div>
    );
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      <Helmet>
        <title>{post.title} | Deccan Filings Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      {/* Breadcrumbs & Back Nav */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-dark transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:underline">Blog</Link>
            <span>/</span>
            <span className="text-slate-600">{post.category}</span>
          </div>
        </div>
      </div>

      {/* Main Post Container */}
      <article className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Post Header */}
        <header className="mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-brand bg-brand-lightest border border-brand-light mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200/60 text-sm text-slate-500">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand/20 flex items-center justify-center font-bold text-xs text-dark uppercase">
                  {post.author.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-bold text-dark">{post.author}</span>
              </div>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4 text-slate-400" /> {post.date}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4 text-slate-400" /> {post.readTime}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }}
                className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-dark transition-all cursor-pointer"
                title="Share Article"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="h-[250px] sm:h-[400px] rounded-3xl overflow-hidden mb-10 shadow-soft">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div 
          className="prose prose-slate max-w-none mb-16 
            [&>p]:text-lg [&>p]:text-slate-700 [&>p]:mb-6 [&>p]:leading-relaxed 
            [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-dark [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:tracking-tight
            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-dark [&>h3]:mt-8 [&>h3]:mb-3
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:text-slate-700 [&>ul]:space-y-2
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:text-slate-700 [&>ol]:space-y-2
            [&>blockquote]:border-l-4 [&>blockquote]:border-brand [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>blockquote]:my-6
            [&>table]:w-full [&>table]:text-left [&>table]:text-sm [&>table]:my-6 [&>table]:border-collapse
            [&>table_th]:py-2 [&>table_th]:font-bold [&>table_th]:text-dark [&>table_th]:border-b [&>table_th]:border-slate-200
            [&>table_td]:py-2 [&>table_td]:text-slate-700 [&>table_td]:border-b [&>table_td]:border-slate-100"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white border-t border-slate-200 py-16">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-black text-dark mb-8">Related Articles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map((rPost) => (
                <Link key={rPost.id} to={`/blog/${rPost.id}`} className="group flex flex-col gap-4">
                  <div className="h-44 rounded-2xl overflow-hidden relative">
                    <img 
                      src={rPost.image} 
                      alt={rPost.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">{rPost.category}</span>
                    <h4 className="font-bold text-lg text-dark mt-1 group-hover:text-secondary transition-colors line-clamp-2">
                      {rPost.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
