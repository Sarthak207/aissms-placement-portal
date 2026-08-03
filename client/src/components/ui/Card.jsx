import clsx from '../../utils/clsx';

export default function Card({ className = '', children, ...props }) {
  return (
    <div className={clsx('bg-parchment-100 rounded-card shadow-card p-6', className)} {...props}>
      {children}
    </div>
  );
}
