export function LockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="3" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function BackIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

const glyph = (body: React.ReactNode) => function Glyph({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {body}
    </svg>
  );
};

/** Birbal's mark: two calm eyes and a small smile. */
export const BirbalMark = glyph(<><circle cx="8.5" cy="10" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.5" cy="10" r="1.2" fill="currentColor" stroke="none" /><path d="M9.5 15.5c1.5 1.3 3.5 1.3 5 0" /></>);
export const ListenIcon = glyph(<path d="M5 12v.01M9 8v8M13 5v14M17 8v8M21 12v.01" />);
export const MoonIcon = glyph(<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />);
export const BrushIcon = glyph(<path d="M14 4l6 6-8 8a4 4 0 0 1-6 0 4 4 0 0 1 0-6zM4 21c1-1 2-1 3-2" />);
export const BookIcon = glyph(<path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.500C17 4 14 4.500 12 6zM12 6v14.500" />);
export const GlobeIcon = glyph(<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.500 2.500 3.500 5.500 3.500 9s-1 6.500-3.500 9c-2.500-2.500-3.500-5.500-3.500-9s1-6.500 3.500-9z" />);
export const CheckIcon = glyph(<path d="M5 12.500l4.500 4.500L19 7" />);
