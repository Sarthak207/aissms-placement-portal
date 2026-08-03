import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import SealBadge from '../../components/ui/SealBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonTable } from '../../components/skeletons/Skeleton';
import { companyApi } from '../../services/companyApi';

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    companyApi
      .list({ verificationStatus: statusFilter || undefined, limit: 50 })
      .then(({ data }) => setCompanies(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const handleDecision = async (id, status) => {
    setBusyId(id);
    try {
      await companyApi.approve(id, status);
      toast.success(`Company ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Manage companies</h1>
        <p className="text-slate-light text-sm">Review and approve recruiter registrations.</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${
              statusFilter === s ? 'bg-navy text-parchment' : 'bg-navy-50 text-navy hover:bg-navy-100'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable />
          </div>
        ) : companies.length === 0 ? (
          <EmptyState icon={Building2} title="No companies here" description="Nothing matches this filter right now." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-light uppercase tracking-wide border-b border-navy-100">
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Industry</th>
                <th className="px-6 py-3 font-medium">Website</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company._id} className="border-b border-navy-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-navy">{company.name}</td>
                  <td className="px-6 py-4 text-slate">{company.industry || '—'}</td>
                  <td className="px-6 py-4 text-slate-light text-xs">{company.website || '—'}</td>
                  <td className="px-6 py-4">
                    <SealBadge status={company.verificationStatus} />
                  </td>
                  <td className="px-6 py-4">
                    {company.verificationStatus === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          disabled={busyId === company._id}
                          onClick={() => handleDecision(company._id, 'approved')}
                          className="text-xs font-medium text-verified hover:bg-verified/10 px-2.5 py-1 rounded-card"
                        >
                          Approve
                        </button>
                        <button
                          disabled={busyId === company._id}
                          onClick={() => handleDecision(company._id, 'rejected')}
                          className="text-xs font-medium text-rejected hover:bg-rejected/10 px-2.5 py-1 rounded-card"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
