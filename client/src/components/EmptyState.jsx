export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-navy-400" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-lg text-navy mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-light max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
