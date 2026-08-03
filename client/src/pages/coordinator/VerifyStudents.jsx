import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import SealBadge from '../../components/ui/SealBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonTable } from '../../components/skeletons/Skeleton';
import { studentApi } from '../../services/studentApi';

export default function VerifyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  const load = () => {
    setLoading(true);
    studentApi
      .list({ verificationStatus: statusFilter || undefined, limit: 50 })
      .then(({ data }) => setStudents(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const handleVerify = async (id, status, remarksText = '') => {
    setBusyId(id);
    try {
      await studentApi.verify(id, { status, remarks: remarksText });
      toast.success(`Profile ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
      setRejectModal(null);
      setRemarks('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Verify students</h1>
        <p className="text-slate-light text-sm">Review academic details and documents before students can apply.</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'verified', 'rejected', ''].map((s) => (
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
        ) : students.length === 0 ? (
          <EmptyState icon={Users} title="Nothing to review" description="No students match this filter right now." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-light uppercase tracking-wide border-b border-navy-100">
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Roll No.</th>
                <th className="px-6 py-3 font-medium">Branch</th>
                <th className="px-6 py-3 font-medium">CGPA</th>
                <th className="px-6 py-3 font-medium">Resume</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b border-navy-100 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-navy">{student.userId?.name}</p>
                    <p className="text-xs text-slate-light">{student.userId?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-slate">{student.branchId?.name}</td>
                  <td className="px-6 py-4 font-mono text-slate">{student.cgpa}</td>
                  <td className="px-6 py-4">
                    {student.resumeUrl ? (
                      <a href={student.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-seal-dark hover:underline">
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-slate-light">Not uploaded</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <SealBadge status={student.verificationStatus} />
                  </td>
                  <td className="px-6 py-4">
                    {student.verificationStatus === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          disabled={busyId === student._id}
                          onClick={() => handleVerify(student._id, 'verified')}
                          className="text-xs font-medium text-verified hover:bg-verified/10 px-2.5 py-1 rounded-card"
                        >
                          Verify
                        </button>
                        <button
                          disabled={busyId === student._id}
                          onClick={() => setRejectModal(student)}
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

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject profile">
        <div className="space-y-4">
          <p className="text-sm text-slate">
            Rejecting <strong>{rejectModal?.userId?.name}</strong>'s profile. Add a note so they know what to fix.
          </p>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder="e.g. Please upload your resume and correct your CGPA"
            className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100 focus:outline-none focus:ring-2 focus:ring-seal/40"
          />
          <Button
            variant="danger"
            className="w-full"
            isLoading={busyId === rejectModal?._id}
            onClick={() => handleVerify(rejectModal._id, 'rejected', remarks)}
          >
            Confirm rejection
          </Button>
        </div>
      </Modal>
    </div>
  );
}
