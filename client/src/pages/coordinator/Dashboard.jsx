import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Clock, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { studentApi } from '../../services/studentApi';

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-navy-400" strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-display text-2xl text-navy leading-none">{value}</p>
        <p className="text-xs text-slate-light mt-1">{label}</p>
      </div>
    </Card>
  );
}

export default function CoordinatorDashboard() {
  const [counts, setCounts] = useState({ pending: 0, verified: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentApi.list({ verificationStatus: 'pending', limit: 1 }),
      studentApi.list({ verificationStatus: 'verified', limit: 1 }),
      studentApi.list({ limit: 1 }),
    ])
      .then(([pendingRes, verifiedRes, totalRes]) => {
        setCounts({
          pending: pendingRes.data.meta.total,
          verified: verifiedRes.data.meta.total,
          total: totalRes.data.meta.total,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Coordinator dashboard</h1>
        <p className="text-slate-light text-sm">Verify student profiles and keep your department informed.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard icon={Clock} label="Pending verification" value={counts.pending} />
        <StatCard icon={UserCheck} label="Verified students" value={counts.verified} />
        <StatCard icon={Users} label="Total students" value={counts.total} />
      </div>

      {counts.pending > 0 && (
        <Card className="border border-seal/30 bg-seal/5 flex items-center justify-between">
          <p className="text-sm text-navy">
            <strong>{counts.pending}</strong> student profile{counts.pending !== 1 ? 's' : ''} waiting on your review.
          </p>
          <Link to="/coordinator/verify-students" className="text-sm font-medium text-seal-dark hover:underline">
            Review now →
          </Link>
        </Card>
      )}
    </div>
  );
}
