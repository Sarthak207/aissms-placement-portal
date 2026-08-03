import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Building2, TrendingUp } from 'lucide-react';
import CampusIllustration from '../../components/CampusIllustration';

const STATS = [
  { label: 'Students placed last year', value: '842' },
  { label: 'Recruiting companies', value: '156' },
  { label: 'Highest package (LPA)', value: '42' },
  { label: 'Average package (LPA)', value: '6.8' },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="seal-badge bg-seal/10 text-seal-dark mb-5">
            Placement Season 2026–27 is open
          </span>
          <h1 className="font-display text-5xl leading-[1.1] text-navy mb-5">
            Where AISSMS talent meets its next opportunity.
          </h1>
          <p className="text-slate text-lg mb-8 max-w-md">
            One portal for every step of campus placement — profiles, drives, interviews,
            and offer letters — built for students, recruiters, and the placement cell alike.
          </p>
          <div className="flex gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-navy text-parchment px-5 py-3 rounded-card font-medium hover:bg-navy-600"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-navy/20 text-navy px-5 py-3 rounded-card font-medium hover:bg-navy-50"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="rounded-card overflow-hidden shadow-card">
          <CampusIllustration className="w-full h-72" />
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-navy">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="font-display text-3xl text-seal">{s.value}</p>
              <p className="text-navy-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: GraduationCap, title: 'For students', body: 'Build your profile once, apply to every eligible drive, and track your status end to end.' },
          { icon: Building2, title: 'For recruiters', body: 'Post drives with precise eligibility criteria and review shortlists without spreadsheets.' },
          { icon: TrendingUp, title: 'For the placement cell', body: 'Real-time analytics on placement rate, packages, and branch-wise performance.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-parchment-100 rounded-card shadow-card p-6">
            <Icon className="w-8 h-8 text-seal-dark mb-4" strokeWidth={1.5} />
            <h3 className="font-display text-lg text-navy mb-2">{title}</h3>
            <p className="text-sm text-slate-light">{body}</p>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="bg-navy-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl text-navy mb-4">About AISSMS College</h2>
          <p className="text-slate leading-relaxed">
            AISSMS College, Pune has partnered with leading recruiters across engineering, IT,
            and management for over two decades. This portal is the digital home of that
            partnership — connecting every eligible student to the right opportunity, transparently.
          </p>
        </div>
      </section>
    </div>
  );
}
