import { Hero } from "@/components/landing/hero";
import { Tracks } from "@/components/landing/tracks";
import { Sponsors } from "@/components/landing/sponsors";
import { Schedule } from "@/components/landing/schedule";
import { Faq } from "@/components/landing/faq";
import { Team } from "@/components/landing/team";
import { PageBackground } from "@/components/page-background";
import { SmoothScroll } from "@/components/smooth-scroll";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="relative">
        <PageBackground />
        <Hero />
        <Tracks />
        <Sponsors />
        <Schedule />
        <Faq />
        <Team />
      </main>
    </SmoothScroll>
  );
}
