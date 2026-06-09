import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: 'Understanding the New GST Regulations for E-commerce',
      excerpt: 'A comprehensive guide to the latest GST changes affecting e-commerce sellers in India and how to stay compliant.',
      category: 'GST',
      author: 'Priya Sharma',
      date: 'Oct 15, 2023',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Top 5 Benefits of Registering a Private Limited Company',
      excerpt: 'Discover why a Private Limited Company is the preferred business structure for startups and growing businesses.',
      category: 'Startup',
      author: 'Rahul Verma',
      date: 'Oct 10, 2023',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'How to Protect Your Brand with a Trademark',
      excerpt: 'Learn the step-by-step process of trademark registration in India and safeguard your intellectual property.',
      category: 'Trademark',
      author: 'Anita Desai',
      date: 'Oct 05, 2023',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      title: 'Income Tax Return Filing: Common Mistakes to Avoid',
      excerpt: 'Ensure a smooth tax filing season by avoiding these common errors that could lead to notices or penalties.',
      category: 'Income Tax',
      author: 'Vikram Singh',
      date: 'Sep 28, 2023',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 5,
      title: 'Annual MCA Compliance Checklist for 2024',
      excerpt: 'Stay ahead of your corporate compliance requirements with our detailed MCA annual filing checklist.',
      category: 'MCA',
      author: 'Neha Gupta',
      date: 'Sep 20, 2023',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 6,
      title: 'FDI in India: Opportunities and Regulations',
      excerpt: 'An overview of Foreign Direct Investment policies in India and how global businesses can enter the market.',
      category: 'Global',
      author: 'Arjun Reddy',
      date: 'Sep 15, 2023',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    },
  ];

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
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-dark">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-xl font-bold text-dark mb-3 line-clamp-2 hover:text-secondary transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 mb-4 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {post.date}</span>
                    </div>
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
