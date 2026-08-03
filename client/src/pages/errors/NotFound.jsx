import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center text-center px-6">
      <p className="font-display text-6xl text-seal mb-2">404</p>
      <h1 className="font-display text-2xl text-navy mb-2">Page not found</h1>
      <p className="text-slate-light mb-6 max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
