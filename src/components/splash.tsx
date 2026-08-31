import { useEffect, useState } from "react";
import { OrbitField } from "@/components/orbit-field";

const LINE_DELAY = 1500;
const HOLD = 4200;

export function Splash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"word" | "line" | "leaving">("word");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("line"), LINE_DELAY);
    const t2 = window.setTimeout(() => setPhase("leaving"), HOLD);
    const t3 = window.setTimeout(onDone, HOLD + 1000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col justify-center overflow-hidden bg-curtain px-6 sm:px-12 ${
        phase === "leaving" ? "animate-curtain-rise" : ""
      }`}
      onClick={() => setPhase("leaving")}
      aria-hidden={phase === "leaving"}
    >
      <OrbitField tone="light" />
      <div className="grain absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <div className="flex items-baseline gap-4 border-b border-curtain-foreground/15 pb-4">
          <p className="animate-fade-soft label-micro text-curtain-foreground/50">Free</p>
          <p className="animate-fade-soft label-micro text-curtain-foreground/30">/</p>
          <p className="animate-fade-soft label-micro text-curtain-foreground/50">Local</p>
          <p className="animate-fade-soft label-micro text-curtain-foreground/30">/</p>
          <p className="animate-fade-soft label-micro text-curtain-foreground/50">Now</p>
          <p className="animate-fade-soft ml-auto hidden label-micro text-curtain-foreground/35 sm:block">
            Vol. 01
          </p>
        </div>

        <h1 className="animate-slow-drift mt-8 flex items-baseline text-curtain-foreground sm:mt-10">
          <span className="display-tight text-[24vw] leading-[0.78] sm:text-[18vw] lg:text-[14rem]">
            Bored
          </span>
          <span className="font-display text-[24vw] font-normal italic leading-[0.78] text-curtain-foreground/55 sm:text-[18vw] lg:text-[14rem]">
            ?
          </span>
        </h1>

        <div
          className={`mt-10 flex max-w-3xl flex-col gap-5 border-t border-curtain-foreground/15 pt-6 transition-opacity duration-1000 sm:mt-14 sm:flex-row sm:items-start sm:gap-10 ${
            phase === "word" ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="label-micro whitespace-nowrap pt-2 text-curtain-foreground/40">
            Tonight&rsquo;s bill
          </p>
          <p className="font-display text-xl italic leading-[1.35] tracking-[-0.01em] text-curtain-foreground/80 sm:text-[1.75rem]">
            There&rsquo;s probably something going on in your city.
          </p>
        </div>
      </div>
    </div>
  );
}
