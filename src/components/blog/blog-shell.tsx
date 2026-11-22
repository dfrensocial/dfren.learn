import Link from "next/link";
import { AccountLinks } from "@/components/marketing/account-links";
import { MarketingFooter } from "@/components/marketing/footer";
import { Logo } from "@/components/ui/logo";

/** Header + footer shared by the blog index and every article. */
export function BlogShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
          <Logo />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>
            <AccountLinks showEnroll />
          </nav>
        </div>
      </header>
      {children}
      <MarketingFooter />
    </div>
  );
}
