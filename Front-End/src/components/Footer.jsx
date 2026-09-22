"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const t = useTranslations("footer");
  const { locale } = useParams();
  const localizedHref = (href) => {
    if (href === "/") {
      return `/${locale}`;
    }

    return `/${locale}${href}`;
  };
  // Hide the public customer footer on Admin CMS & Admin Login pages
  if (pathname && pathname.includes("/admin")) {
    return null;
  }

  const exploreLinks = [
    {
      href: "/how-it-works",
      label: t("links.howItWorks"),
    },
    {
      href: "/calculator",
      label: t("links.calculator"),
    },
    {
      href: "/requirements",
      label: t("links.requirements"),
    },
    {
      href: "/why-us",
      label: t("links.whyUs"),
    },
    {
      href: "/faq",
      label: t("links.faq"),
    },
    {
      href: "/testimonials",
      label: t("links.testimonials"),
    },
    {
      href: "/blog",
      label: t("links.resources"),
    },
    {
      href: "/contact",
      label: t("links.contact"),
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[var(--ink)] text-[var(--paper)]">
      <div className="container-x py-16 md:py-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_.7fr]">
          {/* Brand */}
          <div>
            <div className="mb-7 flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Title Bros Loans"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full bg-white object-contain"
              />

              <div className="text-xl font-black">
                {t("brand.title")}{" "}
                <span className="text-[var(--green-dark)]">
                  {t("brand.highlight")}
                </span>
              </div>
            </div>

            <h2 className="max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.05em] md:text-7xl">
              {t("headline")}{" "}
              <span className="text-[var(--green)]">
                {t("headlineHighlight")}
              </span>
            </h2>

            {/* <h2 className="h2 mt-6 text-[var(--ink)]">
              {t("title")}{" "}
              <span className="text-[var(--green)]">{t("titleHighlight")}</span>
            </h2> */}

            <Link
              href={`/${locale}/apply`}
              className="btn-primary mt-8 inline-flex items-center gap-2"
            >
              {t("applyButton")}
              <ArrowUpRight size={17} />
            </Link>
          </div>

          {/* Explore */}

          <div className="grid grid-cols-2">
            <div>
              <div className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[var(--paper)]/60">
                {t("explore")}
              </div>
              <nav
                aria-label={t("explore")}
                className="flex flex-col gap-3 text-sm text-[var(--paper)]/80"
              >
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={localizedHref(link.href)}
                    className="transition hover:text-[var(--green)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            {/* Contact */}
            <div>
              <div className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[var(--paper)]/60">
                {t("contact")}
              </div>

              <div className="flex flex-col gap-4 text-sm text-[var(--paper)]/80">
                <a
                  href="tel:+17025550123"
                  className="flex items-center gap-3 transition hover:text-[var(--green)]"
                >
                  <Phone size={16} />
                  <span>(702) 555-0123</span>
                </a>

                <a
                  href="#"
                  aria-label={t("whatsapp")}
                  className="flex items-center gap-3 transition hover:text-[var(--green)]"
                >
                  <MessageCircle size={16} />
                  <span>{t("whatsapp")}</span>
                </a>

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>{t("location")}</span>
                </div>
                <p className="text-xs text-white/50">
                  <a
                    href="https://skfb.ly/pMsSH"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    2010 Mercedes SLS AMG — Dave Love SketchFab
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CC BY 4.0
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* </div> */}

        {/* Bottom */}
        <div className="mt-16 border-t border-[var(--paper)]/15 pt-6 text-xs text-[var(--paper)]/60 md:mt-20 md:flex md:items-center md:justify-between">
          <div>{t("copyright")}</div>

          <div className="mt-3 flex gap-5 md:mt-0">
            <Link
              href={`/${locale}/privacy-policy`}
              className="transition hover:text-[var(--green)]"
            >
              {t("privacy")}
            </Link>

            <Link
              href={`/${locale}/terms`}
              className="transition hover:text-[var(--green)]"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
