import { HeroVideo } from "@/components/marketing/hero-video";

/** The silent promo loop, in its own band right under the hero. */
export function Promo() {
  return (
    <section id="promo" className="scroll-mt-16 bg-neutral-50">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-2 sm:pb-20">
        <HeroVideo />
      </div>
    </section>
  );
}
