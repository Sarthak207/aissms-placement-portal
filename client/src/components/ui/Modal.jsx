import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-parchment-100 rounded-card shadow-card w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 sticky top-0 bg-parchment-100">
          <h2 className="font-display text-lg text-navy">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-navy-50">
            <X className="w-4 h-4 text-slate-light" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
