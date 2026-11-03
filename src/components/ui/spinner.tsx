/**
 * The one spinner used everywhere something is loading. Inherits the text
 * colour, so it works on white, on the black buttons and inside the overlay.
 * Decorative: whoever uses it puts the words in a role="status" region.
 */
export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

/** A button label with a spinner in front of it while `busy`. */
export function ButtonLabel({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      {busy && <Spinner className="h-4 w-4" />}
      {children}
    </span>
  );
}
