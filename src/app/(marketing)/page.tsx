import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { Problem } from "@/components/marketing/problem";
import { Curriculum } from "@/components/marketing/curriculum";
import { Bonus } from "@/components/marketing/bonus";
import { Instructor } from "@/components/marketing/instructor";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { Guarantee } from "@/components/marketing/guarantee";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";
import { MarketingFooter } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <MarketingNav />
      <Hero />
      <StatsBar />
      <Problem />
      <Curriculum />
      <Bonus />
      <Instructor />
      <Testimonials />
      <Pricing />
      <Guarantee />
      <FAQ />
      <FinalCTA />
      <MarketingFooter />
    </main>
  );
}
