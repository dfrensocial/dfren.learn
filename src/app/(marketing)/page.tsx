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
import { geoBlueprintCourse } from "@/content/courses/geo-blueprint";

export default function LandingPage() {
  const course = geoBlueprintCourse;

  return (
    <main className="min-h-screen bg-white text-black">
      <MarketingNav />
      <Hero hero={course.hero} />
      <StatsBar stats={course.stats} />
      <Problem />
      <Curriculum curriculum={course.curriculum} />
      <Bonus bonus={course.bonus} />
      <Instructor instructor={course.instructor} />
      <Testimonials testimonials={course.testimonials} />
      <Pricing courseId={course.id} pricing={course.pricing} />
      <Guarantee />
      <FAQ />
      <FinalCTA />
      <MarketingFooter />
    </main>
  );
}
