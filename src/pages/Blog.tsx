import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}

export default function Blog() {
  const categories = ['All', 'Startup', 'GST', 'Income Tax', 'Trademark', 'MCA', 'Global'];
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State variables
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    const pageInUrl = parseInt(searchParams.get('page') || '1', 10);
    if (pageInUrl !== currentPage) {
      setCurrentPage(pageInUrl);
    }
  }, [searchParams, currentPage]);
  const POSTS_PER_PAGE = 6;

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch blogs');
        return res.json();
      })
      .then(data => {
        setBlogPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter logic
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEO 
        title="Blog | Deccan Filings" 
        description="Read our latest insights, guides, and updates on business registration, compliance, and taxation in India."
      />
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === category 
                    ? 'bg-brand text-dark' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand hover:text-dark'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand">
              <Loader2 className="h-10 w-10 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 text-red-600 rounded-3xl max-w-xl mx-auto">
              <p className="font-bold">Error loading articles.</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          ) : currentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    <Link to={`/blog/${post.id}`} className="block h-full">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        loading="lazy"
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
                        Read full article <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
              <p className="text-slate-500 font-bold text-lg font-sans">No articles found matching your criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setCurrentPage(1); }}
                className="text-brand font-black text-sm hover:underline"
              >
                Clear Search Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              {currentPage > 1 ? (
                <Link 
                  to={`?page=${Math.max(1, currentPage - 1)}`}
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : (
                <button disabled className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 opacity-50 cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Link
                  to={`?page=${page}`}
                  key={page}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-brand text-dark'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </Link>
              ))}

              {currentPage < totalPages ? (
                <Link 
                  to={`?page=${Math.min(totalPages, currentPage + 1)}`}
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <button disabled className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 opacity-50 cursor-not-allowed">
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
