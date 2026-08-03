import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy mb-1">Settings</h1>
        <p className="text-slate-light text-sm">Your account and system information.</p>
      </div>

      <Card>
        <h2 className="font-display text-lg text-navy mb-4">Account</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-light">Name</dt>
            <dd className="text-navy font-medium">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-light">Email</dt>
            <dd className="text-navy font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-light">Role</dt>
            <dd className="text-navy font-medium capitalize">{user?.role}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-navy mb-2">System</h2>
        <p className="text-sm text-slate-light">
          Database backup/restore and deeper system configuration are managed through the backend
          admin tooling — this panel surfaces read-only account info for now.
        </p>
      </Card>
    </div>
  );
}
