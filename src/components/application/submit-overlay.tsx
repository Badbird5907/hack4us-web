"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { InteractiveGrid } from "@/components/bg-grid";

interface SubmitOverlayProps {
  show: boolean;
  applicationType: string;
  onGoToDashboard: () => void;
}

const TITLE_WORDS = ["APPLICATION", "SUBMITTED"];

export function SubmitOverlay({
  show,
  applicationType,
  onGoToDashboard,
}: SubmitOverlayProps) {
  const [phase, setPhase] = useState<"animate" | "done">("animate");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) {
      setPhase("animate");
      return;
    }
    const timer = setTimeout(() => setPhase("done"), 1800);
    return () => clearTimeout(timer);
  }, [show]);

  let charIndex = 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-background"
          ref={overlayRef}
        >
          <InteractiveGrid sectionRef={overlayRef} introRipple />
          {/* corner thingies */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="absolute top-8 left-8 size-6 border-t-2 border-l-2 border-primary"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute bottom-8 right-8 size-6 border-b-2 border-r-2 border-primary"
          />

          <div className="relative z-10 text-center px-6 max-w-2xl">
            <div className="overflow-hidden mb-6">
              <div className="flex flex-wrap justify-center gap-x-[0.4em]">
                {TITLE_WORDS.map((word, wi) => (
                  <span key={wi} className="inline-flex whitespace-nowrap">
                    {word.split("").map((char) => {
                      const i = charIndex++;
                      return (
                        <motion.span
                          key={i}
                          initial={{ y: 60, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.3 + i * 0.04,
                            duration: 0.4,
                            ease: "easeOut",
                          }}
                          className="text-3xl sm:text-5xl font-black tracking-wider"
                        >
                          {char}
                        </motion.span>
                      );
                    })}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-h-[180px] flex flex-col items-center justify-start">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.4, ease: "easeOut" }}
                className="mx-auto mb-6 h-0.5 w-32 bg-primary origin-center"
              />

              <AnimatePresence>
                {phase === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Your{" "}
                        <span className="font-bold text-primary">
                          {applicationType}
                        </span>{" "}
                        application has been received!
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        We&apos;ll review your application and get back to you
                        soon. Keep an eye on your dashboard for updates.
                      </p>
                    </div>

                    <Button
                      onClick={onGoToDashboard}
                      className="font-bold tracking-widest uppercase text-xs px-8"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
