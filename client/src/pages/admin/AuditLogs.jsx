import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/EmptyState';
import { SkeletonTable } from '../../components/skeletons/Skeleton';
import { adminApi } from '../../services/adminApi';
import { usePagination } from '../../hooks/usePagination';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const { page, limit, setPage } = usePagination(1, 25);

  useEffect(() => {
    setLoading(true);
    adminApi
      .auditLogs({ page, limit })
      .then(({ data }) => {
        setLogs(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, limit]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Audit logs</h1>
        <p className="text-slate-light text-sm">Every admin and system-level action, in order.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={8} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FileText} title="No activity yet" description="Admin actions will be logged here." />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-light uppercase tracking-wide border-b border-navy-100">
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Actor</th>
                  <th className="px-6 py-3 font-medium">Target</th>
                  <th className="px-6 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-navy-100 last:border-0">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-navy-50 text-navy px-2 py-1 rounded">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-slate">{log.actorId?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-light text-xs">{log.targetType}</td>
                    <td className="px-6 py-4 text-slate-light text-xs font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {meta && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-navy-100 text-xs text-slate-light">
                <span>
                  Page {meta.page} of {meta.totalPages} · {meta.total} total
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={!meta.hasPrevPage}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-card border border-navy-100 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!meta.hasNextPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-card border border-navy-100 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
