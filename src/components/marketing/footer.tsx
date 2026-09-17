export function MarketingFooter() {
  return (
    <footer className="bg-black text-neutral-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-xs sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} dfrenLearn.</span>
        <span>Contact: support@dfrenlearn.com</span>
      </div>
    </footer>
  );
}
