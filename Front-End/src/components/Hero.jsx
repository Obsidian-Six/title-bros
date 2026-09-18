"use client";
import { ArrowDown, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CarScene from "./CarScene";
import Button from "./common/Button";
import { useLocale, useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const root = useRef(null);
   const t = useTranslations("hero");
   const locale = useLocale();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-copy > *", {
        y: 35,
        opacity: 0,
        stagger: 0.11,
        duration: 0.9,
        ease: "power3.out",
      });

      gsap.to(".hero-orb", {
        scale: 1.25,
        opacity: 0.72,
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      data-car-hero
      className="noise relative min-h-[170vh] bg-[var(--paper)]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden md:h-screen">
        <div className="hero-orb left-[48%] top-[12%]" />

        <div className="container-x relative z-10 flex h-full items-center">
          <div className="hero-copy relative z-20 max-w-[690px] md:pt-16">

            <div className="eyebrow mb-7 text-[var(--muted)]">
              {t("location")}
            </div>

            <h1 className="display max-w-[960px] text-[var(--ink)]">
              <span>
              {t("title")}
              </span>
              <br />
              <span className="text-[var(--green)]">
                {t("titleHighlight")}
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-[var(--muted)] md:text-lg">
              {t("description")}
            </p>

            <div className="mt-8 flex flex-col gap-3 md:flex-row">
              <Button
                href={`/${locale}/apply`}
                icon={ArrowUpRight}
                iconSize={17}
              >
                {t("qualify")}
              </Button>

              <Button
                href={`/${locale}/calculator`}
                className="btn-ghost"
                showIcon={false}
              >
                {t("calculator")}
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[var(--muted)]">

              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="text-[var(--green)]"
                />
                {t("benefits.driving")}
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="text-[var(--green)]"
                />
                {t("benefits.process")}
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="text-[var(--green)]"
                />
                {t("benefits.support")}
              </span>

            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-[5]">
          <CarScene />
        </div>

        <div className="pointer-events-none absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-center">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[.22em] text-[var(--muted)]">
            {t("scroll")}
          </div>

          <ArrowDown
            className="mx-auto animate-bounce text-[var(--green)]"
            size={18}
          />
        </div>
      </div>
    </section>
  );
}
