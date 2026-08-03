import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Wallet, Calendar, ListChecks } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SealBadge from '../../components/ui/SealBadge';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { driveApi } from '../../services/driveApi';
import { applicationApi } from '../../services/applicationApi';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    let mounted = true;
    driveApi
      .getById(id)
      .then(({ data }) => mounted && setDrive(data.data))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationApi.apply(id);
      toast.success('Application submitted!');
      setApplied(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <SkeletonCard />;
  if (!drive) return <p className="text-slate-light">Drive not found.</p>;

  const deadlinePassed = new Date(drive.applicationDeadline) < new Date();

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-light hover:text-navy">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-display text-2xl text-navy">{drive.companyId?.name}</p>
            <p className="text-slate-light">{drive.role}</p>
          </div>
          <SealBadge status={drive.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2 text-slate">
            <Wallet className="w-4 h-4 text-seal-dark" />
            {drive.ctc ? `${drive.ctc} LPA` : `₹${drive.stipend}/mo`}
          </div>
          <div className="flex items-center gap-2 text-slate">
            <MapPin className="w-4 h-4 text-seal-dark" />
            {drive.location || 'TBD'}
          </div>
          <div className="flex items-center gap-2 text-slate">
            <Calendar className="w-4 h-4 text-seal-dark" />
            {new Date(drive.applicationDeadline).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-slate capitalize">
            <ListChecks className="w-4 h-4 text-seal-dark" />
            {drive.mode?.replace('_', ' ')}
          </div>
        </div>

        {drive.description && (
          <div className="mb-6">
            <h3 className="font-display text-base text-navy mb-1">About the role</h3>
            <p className="text-sm text-slate leading-relaxed">{drive.description}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-display text-base text-navy mb-2">Eligibility</h3>
          <ul className="text-sm text-slate space-y-1">
            <li>Minimum CGPA: {drive.eligibility?.minCgpa}</li>
            <li>Max live backlogs: {drive.eligibility?.maxLiveBacklogs}</li>
            <li>Max history backlogs: {drive.eligibility?.maxHistoryBacklogs}</li>
          </ul>
        </div>

        {drive.selectionProcess?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display text-base text-navy mb-2">Selection process</h3>
            <ol className="text-sm text-slate list-decimal list-inside space-y-1">
              {drive.selectionProcess.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {drive.requiredSkills?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {drive.requiredSkills.map((skill) => (
              <span key={skill} className="text-xs bg-navy-50 text-navy-400 px-2.5 py-1 rounded-full font-mono">
                {skill}
              </span>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          isLoading={applying}
          disabled={applied || deadlinePassed || drive.status !== 'open'}
          onClick={handleApply}
        >
          {applied ? 'Applied ✓' : deadlinePassed ? 'Deadline passed' : drive.status !== 'open' ? 'Not accepting applications' : 'Apply now'}
        </Button>
      </Card>
    </div>
  );
}
