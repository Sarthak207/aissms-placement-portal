import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import SealBadge from '../../components/ui/SealBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonTable } from '../../components/skeletons/Skeleton';
import { applicationApi } from '../../services/applicationApi';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const load = () => {
    setLoading(true);
    applicationApi
      .myApplications()
      .then(({ data }) => setApplications(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleWithdraw = async (id) => {
    setWithdrawingId(id);
    try {
      await applicationApi.withdraw(id);
      toast.success('Application withdrawn');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">My applications</h1>
        <p className="text-slate-light text-sm">Track the status of every drive you've applied to.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Browse open drives and apply to companies you're eligible for."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-light uppercase tracking-wide border-b border-navy-100">
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Applied</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-b border-navy-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-navy">{app.driveId?.companyId?.name}</td>
                  <td className="px-6 py-4 text-slate">{app.driveId?.role}</td>
                  <td className="px-6 py-4 text-slate-light font-mono text-xs">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <SealBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {['applied', 'shortlisted'].includes(app.status) && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        disabled={withdrawingId === app._id}
                        className="text-xs font-medium text-rejected hover:underline disabled:opacity-50"
                      >
                        {withdrawingId === app._id ? 'Withdrawing…' : 'Withdraw'}
                      </button>
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
