import { Briefcase, Users, Zap, Heart, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Careers() {
  const openPositions = [
    {
      id: 1,
      title: 'Senior React Developer',
      department: 'Engineering',
      location: 'Bangalore / Remote',
      type: 'Full-time',
    },
    {
      id: 2,
      title: 'Tax Consultant (GST)',
      department: 'Operations',
      location: 'Chennai',
      type: 'Full-time',
    },
    {
      id: 3,
      title: 'Digital Marketing Manager',
      department: 'Marketing',
      location: 'Mumbai',
      type: 'Full-time',
    },
    {
      id: 4,
      title: 'Customer Success Executive',
      department: 'Support',
      location: 'Hyderabad',
      type: 'Full-time',
    },
  ];

  const benefits = [
    {
      icon: <Heart className="h-6 w-6 text-brand" />,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance for you and your family, plus wellness programs.',
    },
    {
      icon: <Zap className="h-6 w-6 text-brand" />,
      title: 'Fast-Paced Growth',
      description: 'Work in a high-growth environment with ample opportunities for career advancement.',
    },
    {
      icon: <Users className="h-6 w-6 text-brand" />,
      title: 'Great Culture',
      description: 'Join a diverse, inclusive, and collaborative team that values every voice.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-dark text-white py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join the Deccan Filings Team</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Help us build the future of business compliance and services in India. We are always looking for passionate individuals to join our mission.
          </p>
          <a href="#open-positions" className="inline-flex items-center gap-2 bg-brand text-dark px-6 py-3 rounded-md font-bold hover:bg-brand-hover transition-colors">
            View Open Positions <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-dark mb-4">Why Work With Us?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              At Deccan Filings, we believe in empowering our employees to do their best work. We offer a supportive environment, competitive benefits, and the chance to make a real impact.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
                <div className="bg-dark p-4 rounded-full inline-flex mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-10">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark mb-8 text-center">Open Positions</h2>
          <div className="space-y-4">
            {openPositions.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded text-dark-400 font-medium">{job.type}</span>
                  </div>
                </div>
                <Link to={`/contact?subject=Application for ${job.title}`} className="bg-dark text-white px-6 py-2 rounded-md font-medium hover:bg-dark-400 transition-colors whitespace-nowrap text-center">
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center bg-brand-lightest p-8 rounded-xl border border-brand/20">
            <h3 className="text-xl font-bold text-dark mb-2">Don't see a perfect fit?</h3>
            <p className="text-slate-600 mb-6">We're always looking for talented people. Send us your resume and we'll keep you in mind for future openings.</p>
            <Link to="/contact?subject=General Application" className="inline-block bg-white text-dark border border-slate-300 px-6 py-2 rounded-md font-medium hover:bg-slate-50 transition-colors">
              Send Resume
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
