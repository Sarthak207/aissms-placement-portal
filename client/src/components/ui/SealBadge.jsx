import clsx from '../../utils/clsx';

/**
 * The portal's signature visual element: a small circular "seal" marker used
 * anywhere a verification or outcome state is shown (profile verified, application
 * selected/rejected, offer issued). Echoes the letterhead/certificate language of
 * an actual placement office rather than a generic colored pill.
 */
const TONES = {
  gold: { dot: 'bg-seal', text: 'text-seal-dark bg-seal/10' },
  green: { dot: 'bg-verified', text: 'text-verified bg-verified/10' },
  red: { dot: 'bg-rejected', text: 'text-rejected bg-rejected/10' },
  navy: { dot: 'bg-navy-400', text: 'text-navy-400 bg-navy-50' },
};

const STATUS_TONE = {
  verified: 'green',
  pending: 'navy',
  rejected: 'red',
  applied: 'navy',
  shortlisted: 'gold',
  interview_scheduled: 'gold',
  selected: 'green',
  withdrawn: 'navy',
  open: 'green',
  closed: 'navy',
  draft: 'navy',
  approved: 'green',
};

export default function SealBadge({ status, label }) {
  const tone = TONES[STATUS_TONE[status] || 'navy'];
  const text = label || status?.replace(/_/g, ' ');

  return (
    <span className={clsx('seal-badge capitalize', tone.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', tone.dot)} />
      {text}
    </span>
  );
}
