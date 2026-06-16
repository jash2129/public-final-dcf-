import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

export default function Blog() {
  const categories = ['All', 'Startup', 'GST', 'Income Tax', 'Trademark', 'MCA', 'Global'];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-dark text-white py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Deccan Filings Blog</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Insights, guides, and updates on business registration, compliance, and taxation in India.
          </p>
          <div className="max-w-xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full pl-12 pr-4 py-3 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category, index) => (
              <button 
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0 
                    ? 'bg-brand text-dark' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand hover:text-dark'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <Link to={`/blog/${post.id}`} className="block h-full">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-dark">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <Link to={`/blog/${post.id}`}>
                    <h2 className="text-xl font-bold text-dark mb-3 line-clamp-2 hover:text-brand transition-colors cursor-pointer">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-slate-600 mb-4 line-clamp-3 flex-grow text-sm">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                    </div>
                    <Link to={`/blog/${post.id}`} className="text-brand hover:text-brand-hover font-bold flex items-center gap-1 transition-colors">
                      Read More <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination (Mock) */}
          <div className="mt-16 flex justify-center gap-2">
            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-brand text-dark font-bold">1</button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">2</button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">3</button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
