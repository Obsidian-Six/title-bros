import React from 'react'
import PageHero from './PageHero'
import { useTranslations } from 'next-intl';
import Reveal from './Reveal';
import { ArrowUpRight } from 'lucide-react';
import NextStep from './common/NextStep';

const Blog = () => {
    const t = useTranslations("resources");

  const items = t.raw("items");
  return (
    <>
    <PageHero pageKey="blog" />
     <section className="pt-0">
      <div className="container-x grid gap-5 md:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05}>
            <article className="card group overflow-hidden">
              <div className="h-52 bg-[radial-gradient(circle_at_30%_20%,rgba(185,239,59,.8),transparent_28%),linear-gradient(135deg,#087a45,#101512)] p-6">
                <div className="text-xs font-black uppercase tracking-[.18em] text-white/70">
                  {t("resource")} 0{i + 1}
                </div>
              </div>

              <div className="p-7">
                <h2 className="text-2xl font-black text-[var(--ink)]">
                  {item.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {item.text}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-black text-[var(--green)]">
                  {t("readArticle")}
                  <ArrowUpRight size={15} />
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
    <NextStep/>
    </>
  )
}

export default Blog