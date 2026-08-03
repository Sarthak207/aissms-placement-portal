import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center text-center px-6">
      <p className="font-display text-6xl text-rejected mb-2">403</p>
      <h1 className="font-display text-2xl text-navy mb-2">Access restricted</h1>
      <p className="text-slate-light mb-6 max-w-sm">
        Your account role doesn't have permission to view this page.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
