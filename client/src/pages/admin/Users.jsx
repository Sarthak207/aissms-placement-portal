import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Users as UsersIcon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SealBadge from '../../components/ui/SealBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonTable } from '../../components/skeletons/Skeleton';
import { adminApi } from '../../services/adminApi';

function CreateUserForm({ departments, onCreated, onClose }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'coordinator' } });
  const [submitting, setSubmitting] = useState(false);
  const role = watch('role');

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await adminApi.createUser(values);
      toast.success('User created');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
      <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
      <Input label="Temporary password" type="password" {...register('password', { required: 'Required', minLength: 8 })} error={errors.password?.message} />
      <label className="block">
        <span className="block text-sm font-medium text-navy mb-1.5">Role</span>
        <select {...register('role')} className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100">
          <option value="coordinator">Coordinator</option>
          <option value="tpo">Placement Officer (TPO)</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      {role === 'coordinator' && (
        <label className="block">
          <span className="block text-sm font-medium text-navy mb-1.5">Department</span>
          <select {...register('departmentId', { required: 'Required for coordinators' })} className="w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm bg-parchment-100">
            <option value="">Select…</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          {errors.departmentId && <span className="block text-xs text-rejected mt-1">{errors.departmentId.message}</span>}
        </label>
      )}
      <Button type="submit" className="w-full" isLoading={submitting}>
        Create user
      </Button>
    </form>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listUsers({ role: roleFilter || undefined, limit: 50 })
      .then(({ data }) => setUsers(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [roleFilter]);
  useEffect(() => {
    adminApi.listDepartments().then(({ data }) => setDepartments(data.data));
  }, []);

  const toggleActive = async (user) => {
    setBusyId(user._id);
    try {
      await adminApi.updateUser(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy mb-1">Manage users</h1>
          <p className="text-slate-light text-sm">Create and manage coordinator, TPO, and admin accounts.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> New user
        </Button>
      </div>

      <div className="flex gap-2">
        {['', 'student', 'coordinator', 'tpo', 'company_hr', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${
              roleFilter === r ? 'bg-navy text-parchment' : 'bg-navy-50 text-navy hover:bg-navy-100'
            }`}
          >
            {r ? r.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable />
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Nothing matches this filter." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-light uppercase tracking-wide border-b border-navy-100">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-navy-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-navy">{u.name}</td>
                  <td className="px-6 py-4 text-slate-light text-xs">{u.email}</td>
                  <td className="px-6 py-4 text-slate capitalize">{u.role.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <SealBadge status={u.isActive ? 'verified' : 'rejected'} label={u.isActive ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      disabled={busyId === u._id}
                      onClick={() => toggleActive(u)}
                      className="text-xs font-medium text-navy hover:bg-navy-50 px-2.5 py-1 rounded-card"
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create user">
        <CreateUserForm departments={departments} onCreated={load} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
