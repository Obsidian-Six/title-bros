"use client";

import { Globe } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();

  const switchLocale = (newLocale) => {
    if (newLocale === locale) return;

    const segments = pathname.split("/");

    if (segments[1] === "en" || segments[1] === "es") {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    router.push(segments.join("/") || `/${newLocale}`);
  };

  return (
    <div className="group relative">
      <div
        className="
          flex h-11 items-center gap-1.5
          rounded-full
          border border-[var(--line)]
          bg-[var(--paper)]/80
          px-2
          backdrop-blur-xl
          transition-all duration-500
          hover:border-[var(--ink)]
          hover:px-2.5
        "
      >
        {/* <Globe
          size={15}
          strokeWidth={2}
          className="
            ml-1 text-[var(--muted)]
            transition-transform duration-500
            group-hover:rotate-[-20deg]
            text-[var(--green)]
          "
        /> */}

        <div className="relative flex h-8 items-center rounded-full">
          {/* Sliding active background */}
          <span
            className={`
    absolute top-0.5 left-0
    h-7 w-8 rounded-full
    bg-[var(--ink)]
    transition-transform duration-1000
    ease-[cubic-bezier(.16,1,.3,1)]
    ${locale === "es" ? "translate-x-8" : "translate-x-0"}
  `}
          />

          <button
            type="button"
            onClick={() => switchLocale("en")}
            className={`
              relative z-10 h-7 w-8 rounded-full
              text-[9px] font-black tracking-[0.08em]
              transition-colors duration-300
              ${
                locale === "en"
                  ? "text-[var(--paper)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }
            `}
          >
            EN
          </button>

          <button
            type="button"
            onClick={() => switchLocale("es")}
            className={`
              relative z-10 h-7 w-8 rounded-full
              text-[9px] font-black tracking-[0.08em]
              transition-colors duration-300
              ${
                locale === "es"
                  ? "text-[var(--paper)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }
            `}
          >
            ES
          </button>
        </div>
      </div>
    </div>
  );
}
