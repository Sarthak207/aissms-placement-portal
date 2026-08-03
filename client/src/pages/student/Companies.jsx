import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bookmark, Briefcase } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import SealBadge from '../../components/ui/SealBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { driveApi } from '../../services/driveApi';
import { companyApi } from '../../services/companyApi';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

export default function Companies() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [locationFilter, setLocationFilter] = useState('');
  const debouncedSearch = useDebounce(search);
  const debouncedLocation = useDebounce(locationFilter);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    driveApi
      .list({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        location: debouncedLocation || undefined,
        limit: 30,
      })
      .then(({ data }) => mounted && setDrives(data.data))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [debouncedSearch, statusFilter, debouncedLocation]);

  const handleBookmark = async (companyId) => {
    try {
      const { data } = await companyApi.bookmark(companyId);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update bookmark');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Companies & drives</h1>
        <p className="text-slate-light text-sm">Browse open drives and apply where you're eligible.</p>
      </div>

      <Card className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, or skill…"
            className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-card border border-navy-100 bg-parchment-100 focus:outline-none focus:ring-2 focus:ring-seal/40 focus:border-seal"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-card border border-navy-100 bg-parchment-100 px-3.5 py-2.5 text-sm"
        >
          <option value="open">Open</option>
          <option value="">All statuses</option>
          <option value="closed">Closed</option>
        </select>
        <input
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          placeholder="Location"
          className="rounded-card border border-navy-100 bg-parchment-100 px-3.5 py-2.5 text-sm w-full md:w-40"
        />
      </Card>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : drives.length === 0 ? (
        <Card>
          <EmptyState icon={Briefcase} title="No drives match your filters" description="Try a broader search or clear filters." />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drives.map((drive) => (
            <Card key={drive._id} className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display text-lg text-navy">{drive.companyId?.name}</p>
                  <p className="text-sm text-slate-light">{drive.role}</p>
                </div>
                <button
                  onClick={() => handleBookmark(drive.companyId?._id)}
                  className="p-1.5 rounded-full hover:bg-navy-50 shrink-0"
                  aria-label="Bookmark company"
                >
                  <Bookmark className="w-4 h-4 text-seal-dark" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <SealBadge status={drive.status} />
                <span className="text-xs text-slate-light font-mono">{drive.type?.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-light font-mono mb-4">
                <span>{drive.ctc ? `${drive.ctc} LPA` : drive.stipend ? `₹${drive.stipend}/mo` : '—'}</span>
                <span>{drive.location || 'Location TBD'}</span>
              </div>

              <Link
                to={`/student/companies/${drive._id}`}
                className="mt-auto text-sm font-medium text-center bg-navy text-parchment py-2 rounded-card hover:bg-navy-600"
              >
                View details
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
