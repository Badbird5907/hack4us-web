import { Hero } from "@/components/landing/hero";
import { Sponsors } from "@/components/landing/sponsors";
import { Schedule } from "@/components/landing/schedule";
import { Faq } from "@/components/landing/faq";
import { Team } from "@/components/landing/team";
import { PageBackground } from "@/components/page-background";
import { SmoothScroll } from "@/components/smooth-scroll";
import Link from "next/link";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="relative">
        <PageBackground />
        <Hero />
        <Sponsors />
        <Schedule />
        <Faq />
        <Team />
        <footer className="px-6 pb-10 text-center text-xs text-muted-foreground">
          <p>
            Designed and built by{" "}
            <Link
              href="https://evanyu.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              Evan Yu
            </Link>
            .
          </p>
          <p className="mt-1">
            Fiscally sponsored by{" "}
            <Link
              href="https://hackclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              Hack Club
            </Link>
            , a registered 501(c)(3) nonprofit in the United States.
          </p>
        </footer>
      </main>
    </SmoothScroll>
  );
}
