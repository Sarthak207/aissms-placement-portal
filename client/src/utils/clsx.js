/** Joins truthy class name strings together, skipping falsy values. */
export default function clsx(...args) {
  return args.filter(Boolean).join(' ');
}
