"use client";

import React from "react";
import { useTranslations } from "next-intl";

export default function Marquee() {
  const t = useTranslations("marquee");

  const words = t.raw("words");
  const content = [...words, ...words];

  return (
    <section className="marquee border-y border-black/10 bg-[#83ef3b] py-5">
      <div className="marquee-track gap-8 text-3xl font-black tracking-[-.04em] md:text-5xl">
        {content.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex items-center gap-8"
          >
            {word}
            <span className="text-[#087a45]">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}