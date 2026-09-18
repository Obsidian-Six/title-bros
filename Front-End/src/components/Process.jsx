"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  FileText,
  Car,
  BadgeCheck,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

import Reveal from "./Reveal";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

const stepIcons = [FileText, Car, BadgeCheck, Wallet, CircleDollarSign];

export default function Process() {
  const root = useRef(null);
  const t = useTranslations("process");

  // Get the complete steps array from en.json / es.json
  const steps = t.raw("steps");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;

      const line = root.current.querySelector(".process-line");

      const items = gsap.utils.toArray(".process-step");

      if (!line || !items.length) return;

      gsap.set(line, {
        scaleX: isMobile ? 1 : 0,
        scaleY: isMobile ? 0 : 1,
        transformOrigin: isMobile ? "top center" : "left center",
      });

      items.forEach((item) => {
        gsap.set(item.querySelector(".process-icon"), {
          scale: 0.35,
          opacity: 0,
        });

        gsap.set(item.querySelector(".process-number"), {
          scale: 1,
          opacity: 1,
        });
      });

      ScrollTrigger.create({
        trigger: root.current,

        start: isMobile ? "top 70%" : "top 75%",

        end: isMobile ? "bottom 80%" : "bottom 90%",

        scrub: 1,

        onUpdate: (self) => {
          const progress = self.progress;

          if (isMobile) {
            gsap.set(line, {
              scaleY: progress,
            });
          } else {
            gsap.set(line, {
              scaleX: progress,
            });
          }

          items.forEach((item, index) => {
            const number = item.querySelector(".process-number");

            const icon = item.querySelector(".process-icon");

            if (!number || !icon) return;

            const point = index / (items.length - 1);

            const reached = progress >= point;

            if (reached) {
              gsap.to(number, {
                scale: 0.4,
                opacity: 0,
                duration: 0.25,
                overwrite: true,
              });

              gsap.to(icon, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: "back.out(2)",
                overwrite: true,
              });
            } else {
              gsap.to(number, {
                scale: 1,
                opacity: 1,
                duration: 0.25,
                overwrite: true,
              });

              gsap.to(icon, {
                scale: 0.35,
                opacity: 0,
                duration: 0.25,
                overwrite: true,
              });
            }
          });
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-1">
          {/* LEFT CONTENT */}

          <Reveal>
            <div className="eyebrow text-[var(--muted)]">{t("eyebrow")}</div>

            <h2 className="h2 mt-6 text-[var(--ink)]">
              {t("title")}{" "}
              <span className="text-[var(--green)]">{t("titleHighlight")}</span>
            </h2>

            <p className="mt-7 max-w-md leading-7 text-[var(--muted)]">
              {t("description")}
            </p>
          </Reveal>

          {/* PROCESS */}

          <div ref={root} className="relative">
            {/* ANIMATED LINE */}

            <div
              className="
                process-line
                absolute
                left-[31px]
                top-8
                h-[calc(100%-32px)]
                w-[3px]
                bg-[var(--green)]
                origin-top
                scale-y-0

                md:left-[31px]
                md:top-8
                md:h-[3px]
                md:w-[calc(100%-20%)]
                md:origin-left
                md:scale-y-100
                md:scale-x-0
              "
            />

            {/* STEPS */}

            <div className="grid gap-5 md:grid-cols-5">
              {steps.map((step, i) => {
                const Icon = stepIcons[i];

                return (
                  <Reveal key={step.number} delay={i * 0.05}>
                    <div
                      className="
                        process-step
                        relative
                        grid
                        grid-cols-[0.5fr_1.5fr]
                        md:block
                      "
                    >
                      {/* NUMBER / ICON */}

                      <div
                        className="
                          relative
                          z-10
                          mb-7
                          grid
                          h-16
                          w-16
                          place-items-center
                          rounded-full
                          border
                          border-[var(--line)]
                          bg-[var(--white)]
                          shadow-sm
                        "
                      >
                        {/* NUMBER */}

                        <span
                          className="
                            process-number
                            absolute
                            inset-0
                            grid
                            place-items-center
                            text-sm
                            font-black
                            text-[var(--ink)]
                          "
                        >
                          {step.number}
                        </span>

                        {/* ICON */}

                        <span
                          className="
                            process-icon
                            absolute
                            inset-0
                            grid
                            place-items-center
                            scale-[0.35]
                            opacity-0
                            text-[var(--green)]
                          "
                        >
                          <Icon size={27} strokeWidth={2.2} />
                        </span>
                      </div>

                      {/* CONTENT */}

                      <div>
                        <h3 className="text-xl font-black text-[var(--ink)]">
                          {step.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
