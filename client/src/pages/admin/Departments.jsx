import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Building2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/skeletons/Skeleton';
import { adminApi } from '../../services/adminApi';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.listDepartments(), adminApi.listBranches()])
      .then(([deptRes, branchRes]) => {
        setDepartments(deptRes.data.data);
        setBranches(branchRes.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy mb-1">Departments & branches</h1>
          <p className="text-slate-light text-sm">The academic structure used across eligibility rules and reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDeptModalOpen(true)}>
            <Plus className="w-4 h-4" /> Department
          </Button>
          <Button onClick={() => setBranchModalOpen(true)}>
            <Plus className="w-4 h-4" /> Branch
          </Button>
        </div>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : departments.length === 0 ? (
        <Card>
          <EmptyState icon={Building2} title="No departments yet" description="Add your first department to get started." />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <Card key={dept._id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg text-navy">{dept.name}</h3>
                <span className="text-xs font-mono text-slate-light bg-navy-50 px-2 py-1 rounded-full">{dept.code}</span>
              </div>
              <div className="space-y-1.5">
                {branches
                  .filter((b) => b.departmentId?._id === dept._id)
                  .map((b) => (
                    <div key={b._id} className="flex items-center justify-between text-sm">
                      <span className="text-slate">{b.name}</span>
                      <span className="font-mono text-xs text-slate-light">{b.code}</span>
                    </div>
                  ))}
                {branches.filter((b) => b.departmentId?._id === dept._id).length === 0 && (
                  <p className="text-xs text-slate-light">No branches yet</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={deptModalOpen} onClose={() => setDeptModalOpen(false)} title="New department">
        <DepartmentForm onSaved={load} onClose={() => setDeptModalOpen(false)} />
      </Modal>

      <Modal open={branchModalOpen} onClose={() => setBranchModalOpen(false)} title="New branch">
        <BranchForm departments={departments} onSaved={load} onClose={() => setBranchModalOpen(false)} />
      </Modal>
    </div>
  );
}

function DepartmentForm({ onSaved, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await adminApi.createDepartment(values);
      toast.success('Department created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create department');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Department name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
      <Input label="Code" placeholder="e.g. ENG" {...register('code', { required: 'Required' })} error={errors.code?.message} />
      <Button type="submit" className="w-full" isLoading={submitting}>
        Create department
      </Button>
    </form>
  );
}

function BranchForm({ departments, onSaved, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await adminApi.createBranch(values);
      toast.success('Branch created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create branch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-navy mb-1.5">Department</span>
        <select {...register('departmentId', { required: 'Required' })} className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100">
          <option value="">Select…</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        {errors.departmentId && <span className="block text-xs text-rejected mt-1">{errors.departmentId.message}</span>}
      </label>
      <Input label="Branch name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
      <Input label="Code" placeholder="e.g. CSE" {...register('code', { required: 'Required' })} error={errors.code?.message} />
      <Button type="submit" className="w-full" isLoading={submitting}>
        Create branch
      </Button>
    </form>
  );
}
