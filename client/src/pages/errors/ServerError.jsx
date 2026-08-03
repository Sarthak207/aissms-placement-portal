import Button from '../../components/ui/Button';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center text-center px-6">
      <p className="font-display text-6xl text-navy-400 mb-2">500</p>
      <h1 className="font-display text-2xl text-navy mb-2">Something went wrong</h1>
      <p className="text-slate-light mb-6 max-w-sm">
        An unexpected error occurred. Please try again in a moment.
      </p>
      <Button onClick={() => window.location.reload()}>Reload page</Button>
    </div>
  );
}
