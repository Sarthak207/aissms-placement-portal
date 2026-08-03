import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, GraduationCap } from 'lucide-react';
import Card from '../../components/ui/Card';
import SealBadge from '../../components/ui/SealBadge';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import EmptyState from '../../components/EmptyState';
import { studentApi } from '../../services/studentApi';
import { driveApi } from '../../services/driveApi';
import { applicationApi } from '../../services/applicationApi';

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

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [openDrives, setOpenDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [profileRes, appsRes, drivesRes] = await Promise.all([
          studentApi.getMe(),
          applicationApi.myApplications(),
          driveApi.list({ status: 'open', limit: 5, sort: '-createdAt' }),
        ]);
        if (!mounted) return;
        setProfile(profileRes.data.data);
        setApplications(appsRes.data.data);
        setOpenDrives(drivesRes.data.data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const selectedCount = applications.filter((a) => a.status === 'selected').length;
  const appliedCount = applications.filter((a) => a.status !== 'withdrawn').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">
          Welcome back{profile?.userId?.name ? `, ${profile.userId.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-slate-light text-sm">Here's where your placement journey stands today.</p>
      </div>

      {/* Profile completion */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-navy">Profile completion</h2>
          <span className="font-mono text-sm text-seal-dark">{profile?.profileCompletion || 0}%</span>
        </div>
        <div className="h-2 rounded-full bg-navy-50 overflow-hidden">
          <div
            className="h-full bg-seal rounded-full transition-all duration-500"
            style={{ width: `${profile?.profileCompletion || 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <SealBadge status={profile?.verificationStatus} />
          <Link to="/student/profile" className="text-sm font-medium text-seal-dark hover:underline">
            Complete your profile →
          </Link>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Applications" value={appliedCount} />
        <StatCard icon={CheckCircle2} label="Selected" value={selectedCount} />
        <StatCard icon={Clock} label="Rejected" value={rejectedCount} />
        <StatCard icon={GraduationCap} label="CGPA" value={profile?.cgpa ?? '—'} />
      </div>

      {/* Upcoming drives */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-navy">Open drives</h2>
          <Link to="/student/companies" className="text-sm font-medium text-seal-dark hover:underline">
            View all →
          </Link>
        </div>
        {openDrives.length === 0 ? (
          <Card>
            <EmptyState
              icon={Briefcase}
              title="No open drives right now"
              description="Check back soon — new drives are opened by the placement cell regularly."
            />
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {openDrives.map((drive) => (
              <Link key={drive._id} to={`/student/companies/${drive._id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-display text-lg text-navy">{drive.companyId?.name}</p>
                      <p className="text-sm text-slate-light">{drive.role}</p>
                    </div>
                    <SealBadge status={drive.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-light font-mono mt-3">
                    <span>{drive.ctc ? `${drive.ctc} LPA` : `₹${drive.stipend}/mo`}</span>
                    <span>Min CGPA {drive.eligibility?.minCgpa}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
