import { forwardRef } from 'react';
import clsx from '../../utils/clsx';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-navy mb-1.5">{label}</span>}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-card border px-3.5 py-2.5 text-sm bg-parchment-100 text-navy placeholder:text-slate-light',
          'focus:outline-none focus:ring-2 focus:ring-seal/40 focus:border-seal',
          error ? 'border-rejected' : 'border-navy-100',
          className
        )}
        {...props}
      />
      {error && <span className="block text-xs text-rejected mt-1">{error}</span>}
    </label>
  );
});
Input.displayName = 'Input';

export default Input;
