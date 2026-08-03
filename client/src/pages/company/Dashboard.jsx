import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Clock, Building2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import SealBadge from '../../components/ui/SealBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { companyApi } from '../../services/companyApi';
import { driveApi } from '../../services/driveApi';

export default function CompanyDashboard() {
  const [company, setCompany] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notRegistered, setNotRegistered] = useState(false);

  useEffect(() => {
    let mounted = true;
    companyApi
      .getMine()
      .then(async ({ data }) => {
        if (!mounted) return;
        setCompany(data.data);
        const drivesRes = await driveApi.list({ limit: 50 });
        if (mounted) setDrives(drivesRes.data.data.filter((d) => d.companyId?._id === data.data._id));
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotRegistered(true);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <SkeletonCard />;

  if (notRegistered) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="Register your company"
          description="You haven't set up a company profile yet. Create one to start posting placement drives."
          action={
            <Link to="/company/drives" className="text-sm font-medium bg-navy text-parchment px-4 py-2 rounded-card hover:bg-navy-600">
              Set up company
            </Link>
          }
        />
      </Card>
    );
  }

  const openCount = drives.filter((d) => d.status === 'open').length;
  const draftCount = drives.filter((d) => d.status === 'draft').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy mb-1">{company?.name}</h1>
          <p className="text-slate-light text-sm">{company?.industry || 'Recruiting partner'}</p>
        </div>
        <SealBadge status={company?.verificationStatus} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-navy-50 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-navy-400" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy leading-none">{openCount}</p>
            <p className="text-xs text-slate-light mt-1">Open drives</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-navy-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-navy-400" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy leading-none">{draftCount}</p>
            <p className="text-xs text-slate-light mt-1">Draft drives</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-navy-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-navy-400" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy leading-none">{drives.length}</p>
            <p className="text-xs text-slate-light mt-1">Total drives</p>
          </div>
        </Card>
      </div>

      {company?.verificationStatus !== 'approved' && (
        <Card className="border border-seal/30 bg-seal/5">
          <p className="text-sm text-navy">
            Your company is <strong>{company?.verificationStatus}</strong> approval from the placement cell.
            You'll be able to post drives once approved.
          </p>
        </Card>
      )}

      <div className="flex justify-end">
        <Link to="/company/drives" className="text-sm font-medium bg-navy text-parchment px-4 py-2.5 rounded-card hover:bg-navy-600">
          Manage drives →
        </Link>
      </div>
    </div>
  );
}
