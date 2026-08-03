import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Briefcase } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SealBadge from '../../components/ui/SealBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { companyApi } from '../../services/companyApi';
import { driveApi } from '../../services/driveApi';

function CompanySetupForm({ onCreated }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { data } = await companyApi.create(values);
      toast.success('Company profile created — pending TPO approval');
      onCreated(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create company');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <EmptyState
        icon={Briefcase}
        title="Set up your company profile"
        description="This is required before you can post placement drives. A TPO will review and approve it."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <Input label="Company name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
        <Input label="Website" {...register('website')} />
        <Input label="Industry" {...register('industry')} />
        <Button type="submit" className="w-full" isLoading={submitting}>
          Create company profile
        </Button>
      </form>
    </Card>
  );
}

function DriveForm({ companyId, initial, onSaved, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || {
      title: '',
      role: '',
      type: 'full_time',
      description: '',
      ctc: '',
      stipend: '',
      location: '',
      mode: 'on_campus',
      eligibility: { minCgpa: 6, maxLiveBacklogs: 0, maxHistoryBacklogs: 0 },
      bondDetails: '',
      applicationDeadline: '',
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        companyId,
        ctc: values.ctc ? Number(values.ctc) : 0,
        stipend: values.stipend ? Number(values.stipend) : 0,
        eligibility: {
          minCgpa: Number(values.eligibility.minCgpa),
          maxLiveBacklogs: Number(values.eligibility.maxLiveBacklogs),
          maxHistoryBacklogs: Number(values.eligibility.maxHistoryBacklogs),
          allowedBranches: [],
          allowedPassingYears: [],
        },
        selectionProcess: values.selectionProcess
          ? values.selectionProcess.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        requiredSkills: values.requiredSkills
          ? values.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (initial?._id) {
        await driveApi.update(initial._id, payload);
        toast.success('Drive updated');
      } else {
        await driveApi.create(payload);
        toast.success('Drive created as draft');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save drive');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Drive title" {...register('title', { required: 'Required' })} error={errors.title?.message} />
        <Input label="Role" {...register('role', { required: 'Required' })} error={errors.role?.message} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <label className="block">
          <span className="block text-sm font-medium text-navy mb-1.5">Type</span>
          <select {...register('type')} className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100">
            <option value="full_time">Full time</option>
            <option value="internship">Internship</option>
            <option value="internship_ppo">Internship + PPO</option>
          </select>
        </label>
        <Input label="CTC (LPA)" type="number" step="0.1" {...register('ctc')} />
        <Input label="Stipend (₹/mo)" type="number" {...register('stipend')} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Location" {...register('location')} />
        <label className="block">
          <span className="block text-sm font-medium text-navy mb-1.5">Mode</span>
          <select {...register('mode')} className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100">
            <option value="on_campus">On campus</option>
            <option value="off_campus">Off campus</option>
            <option value="virtual">Virtual</option>
          </select>
        </label>
      </div>
      <Input label="Description" {...register('description')} />
      <div className="grid md:grid-cols-3 gap-4">
        <Input label="Min CGPA" type="number" step="0.1" {...register('eligibility.minCgpa', { required: true })} />
        <Input label="Max live backlogs" type="number" {...register('eligibility.maxLiveBacklogs')} />
        <Input label="Max history backlogs" type="number" {...register('eligibility.maxHistoryBacklogs')} />
      </div>
      <Input label="Selection process (comma separated)" {...register('selectionProcess')} placeholder="Online test, Technical interview, HR interview" />
      <Input label="Required skills (comma separated)" {...register('requiredSkills')} />
      <Input label="Application deadline" type="date" {...register('applicationDeadline', { required: 'Required' })} error={errors.applicationDeadline?.message} />

      <Button type="submit" className="w-full" isLoading={submitting}>
        {initial?._id ? 'Save changes' : 'Create drive'}
      </Button>
    </form>
  );
}

export default function Drives() {
  const [company, setCompany] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notRegistered, setNotRegistered] = useState(false);
  const [modalDrive, setModalDrive] = useState(null); // null = closed, {} = create, {...} = edit
  const [busyId, setBusyId] = useState(null);

  const loadDrives = (companyId) => {
    driveApi.list({ limit: 50 }).then(({ data }) => {
      setDrives(data.data.filter((d) => d.companyId?._id === companyId));
    });
  };

  useEffect(() => {
    companyApi
      .getMine()
      .then(({ data }) => {
        setCompany(data.data);
        loadDrives(data.data._id);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotRegistered(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (action, id) => {
    setBusyId(id);
    try {
      if (action === 'open') await driveApi.open(id);
      if (action === 'close') await driveApi.close(id);
      if (action === 'delete') await driveApi.remove(id);
      toast.success(`Drive ${action === 'delete' ? 'deleted' : action + 'ed'}`);
      loadDrives(company._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <SkeletonCard />;

  if (notRegistered) {
    return <CompanySetupForm onCreated={setCompany} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy mb-1">Placement drives</h1>
          <p className="text-slate-light text-sm">Create and manage drives for {company?.name}.</p>
        </div>
        <Button onClick={() => setModalDrive({})} disabled={company?.verificationStatus !== 'approved'}>
          <Plus className="w-4 h-4" /> New drive
        </Button>
      </div>

      {company?.verificationStatus !== 'approved' && (
        <Card className="border border-seal/30 bg-seal/5">
          <p className="text-sm text-navy">Your company must be approved by the TPO before you can create drives.</p>
        </Card>
      )}

      {drives.length === 0 ? (
        <Card>
          <EmptyState icon={Briefcase} title="No drives yet" description="Create your first placement drive to get started." />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {drives.map((drive) => (
            <Card key={drive._id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display text-lg text-navy">{drive.title}</p>
                  <p className="text-sm text-slate-light">{drive.role}</p>
                </div>
                <SealBadge status={drive.status} />
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-light font-mono mb-4">
                <span>{drive.ctc ? `${drive.ctc} LPA` : `₹${drive.stipend}/mo`}</span>
                <span>Deadline {new Date(drive.applicationDeadline).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/company/drives/${drive._id}/applicants`}
                  className="text-xs font-medium bg-navy-50 text-navy px-3 py-1.5 rounded-card hover:bg-navy-100"
                >
                  View applicants
                </Link>
                <button
                  onClick={() => setModalDrive(drive)}
                  className="text-xs font-medium border border-navy-100 px-3 py-1.5 rounded-card hover:bg-navy-50"
                >
                  Edit
                </button>
                {drive.status === 'draft' && (
                  <button
                    onClick={() => handleAction('open', drive._id)}
                    disabled={busyId === drive._id}
                    className="text-xs font-medium bg-verified/10 text-verified px-3 py-1.5 rounded-card hover:bg-verified/20"
                  >
                    Open drive
                  </button>
                )}
                {drive.status === 'open' && (
                  <button
                    onClick={() => handleAction('close', drive._id)}
                    disabled={busyId === drive._id}
                    className="text-xs font-medium bg-navy-50 text-navy px-3 py-1.5 rounded-card hover:bg-navy-100"
                  >
                    Close drive
                  </button>
                )}
                <button
                  onClick={() => handleAction('delete', drive._id)}
                  disabled={busyId === drive._id}
                  className="text-xs font-medium text-rejected px-3 py-1.5 rounded-card hover:bg-rejected/10"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!modalDrive} onClose={() => setModalDrive(null)} title={modalDrive?._id ? 'Edit drive' : 'New drive'} wide>
        {modalDrive && (
          <DriveForm
            companyId={company?._id}
            initial={modalDrive._id ? modalDrive : null}
            onSaved={() => loadDrives(company._id)}
            onClose={() => setModalDrive(null)}
          />
        )}
      </Modal>
    </div>
  );
}
