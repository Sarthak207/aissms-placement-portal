import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import SealBadge from '../../components/ui/SealBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonTable } from '../../components/skeletons/Skeleton';
import { driveApi } from '../../services/driveApi';
import { applicationApi } from '../../services/applicationApi';
import { interviewApi } from '../../services/interviewApi';
import { offerApi } from '../../services/offerApi';

const NEXT_STATUS = {
  applied: [['shortlisted', 'Shortlist'], ['rejected', 'Reject']],
  shortlisted: [['interview_scheduled', 'Mark interview scheduled'], ['rejected', 'Reject']],
  interview_scheduled: [['selected', 'Select'], ['rejected', 'Reject']],
};

function InterviewForm({ applicationId, onDone, onClose }) {
  const { register, handleSubmit } = useForm({ defaultValues: { mode: 'online', round: 'Technical Round 1' } });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await interviewApi.schedule({ ...values, applicationId });
      toast.success('Interview scheduled');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Round" {...register('round', { required: true })} />
      <Input label="Date & time" type="datetime-local" {...register('scheduledAt', { required: true })} />
      <label className="block">
        <span className="block text-sm font-medium text-navy mb-1.5">Mode</span>
        <select {...register('mode')} className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100">
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </label>
      <Input label="Meeting link / venue" {...register('meetingLink')} />
      <Button type="submit" className="w-full" isLoading={submitting}>
        Schedule interview
      </Button>
    </form>
  );
}

function OfferForm({ applicationId, onDone, onClose }) {
  const { register, handleSubmit } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await offerApi.issue({ applicationId, ctc: Number(values.ctc), joiningDetails: values.joiningDetails });
      toast.success('Offer letter issued');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not issue offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="CTC (LPA)" type="number" step="0.1" {...register('ctc', { required: true })} />
      <Input label="Joining details" {...register('joiningDetails')} placeholder="e.g. Joins August 2026, Pune office" />
      <Button type="submit" className="w-full" isLoading={submitting}>
        Issue offer letter
      </Button>
    </form>
  );
}

export default function DriveApplicants() {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [offerModalApp, setOfferModalApp] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([driveApi.getById(id), driveApi.applicants(id, statusFilter ? { status: statusFilter } : {})])
      .then(([driveRes, appsRes]) => {
        setDrive(driveRes.data.data);
        setApplications(appsRes.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id, statusFilter]);

  const handleStatusChange = async (applicationId, status) => {
    setBusyId(applicationId);
    try {
      await applicationApi.updateStatus(applicationId, { status });
      toast.success(`Application marked as ${status.replace('_', ' ')}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await driveApi.exportApplicants(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'applicants.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export applicants');
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/company/drives" className="flex items-center gap-1.5 text-sm text-slate-light hover:text-navy w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to drives
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy mb-1">{drive?.title || 'Applicants'}</h1>
          <p className="text-slate-light text-sm">{drive?.role}</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      <div className="flex gap-2">
        {['', 'applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${
              statusFilter === s ? 'bg-navy text-parchment' : 'bg-navy-50 text-navy hover:bg-navy-100'
            }`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState icon={Users} title="No applicants" description="No students have applied matching this filter yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-light uppercase tracking-wide border-b border-navy-100">
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Roll No.</th>
                <th className="px-6 py-3 font-medium">Branch</th>
                <th className="px-6 py-3 font-medium">CGPA</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-b border-navy-100 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-navy">{app.studentId?.userId?.name}</p>
                    <p className="text-xs text-slate-light">{app.studentId?.userId?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate">{app.studentId?.rollNumber}</td>
                  <td className="px-6 py-4 text-slate">{app.studentId?.branchId?.name}</td>
                  <td className="px-6 py-4 font-mono text-slate">{app.studentId?.cgpa}</td>
                  <td className="px-6 py-4">
                    <SealBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {(NEXT_STATUS[app.status] || []).map(([next, label]) => (
                        <button
                          key={next}
                          disabled={busyId === app._id}
                          onClick={() => handleStatusChange(app._id, next)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-card ${
                            next === 'rejected' ? 'text-rejected hover:bg-rejected/10' : 'text-verified hover:bg-verified/10'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                      {app.status === 'shortlisted' && (
                        <button
                          onClick={() => setInterviewModalApp(app)}
                          className="text-xs font-medium text-seal-dark hover:bg-seal/10 px-2.5 py-1 rounded-card"
                        >
                          Schedule interview
                        </button>
                      )}
                      {app.status === 'selected' && (
                        <button
                          onClick={() => setOfferModalApp(app)}
                          className="text-xs font-medium text-seal-dark hover:bg-seal/10 px-2.5 py-1 rounded-card"
                        >
                          Issue offer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!interviewModalApp} onClose={() => setInterviewModalApp(null)} title="Schedule interview">
        {interviewModalApp && (
          <InterviewForm applicationId={interviewModalApp._id} onDone={load} onClose={() => setInterviewModalApp(null)} />
        )}
      </Modal>

      <Modal open={!!offerModalApp} onClose={() => setOfferModalApp(null)} title="Issue offer letter">
        {offerModalApp && <OfferForm applicationId={offerModalApp._id} onDone={load} onClose={() => setOfferModalApp(null)} />}
      </Modal>
    </div>
  );
}
