import clsx from '../../utils/clsx';

const VARIANTS = {
  primary: 'bg-navy text-parchment hover:bg-navy-600 active:bg-navy-900',
  seal: 'bg-seal text-navy hover:bg-seal-dark hover:text-parchment',
  outline: 'border border-navy/20 text-navy hover:bg-navy-50',
  ghost: 'text-navy hover:bg-navy-50',
  danger: 'bg-rejected text-parchment hover:bg-rejected/90',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-card font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
