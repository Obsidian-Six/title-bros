"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHero from "./PageHero";
import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import {
  ArrowUpRight,
  Search,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  X,
  Compass,
  Tag,
  ArrowRight,
} from "lucide-react";
import NextStep from "./common/NextStep";
import loanService, { getDocumentUrl } from "@/services/loanService";

const FALLBACK_BLOGS = [
  {
    _id: "fb-1",
    title: "How Car Title Loans Work: A Comprehensive UK & International Guide",
    slug: "how-car-title-loans-work-comprehensive-guide",
    category: "Title Loans",
    description:
      "Learn how to unlock your vehicle’s equity without handing over your keys. A transparent breakdown of loan terms, valuation, and repayment.",
    coverImage:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    readTime: "5 min read",
    author: {
      name: "Title Bros Research Team",
      role: "Financial & Equity Specialist",
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb-2",
    title: "Top 7 Ways to Maximize Your Vehicle Equity Before an Appraisal",
    slug: "maximize-vehicle-equity-before-appraisal",
    category: "Vehicle Equity",
    description:
      "Discover simple maintenance and presentation steps that can significantly raise your car’s valuation and qualify you for higher borrowing limits.",
    coverImage:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 min read",
    author: {
      name: "David Vance",
      role: "Senior Automotive Appraiser",
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb-3",
    title: "Understanding Repayment Schedules and Low-Interest Options",
    slug: "understanding-repayment-schedules-low-interest-options",
    category: "Financial Tips",
    description:
      "How to choose the ideal loan term, calculate monthly payments, and avoid prepayment penalties for a stress-free borrowing experience.",
    coverImage:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 min read",
    author: {
      name: "Title Bros Advisory",
      role: "Loan Underwriting Desk",
    },
    createdAt: new Date().toISOString(),
  },
];

export default function Blog() {
  const { locale = "en" } = useParams() || {};
  const t = useTranslations("resources");

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function fetchBlogs() {
      try {
        setLoading(true);
        const res = await loanService.getPublicBlogs({
          category: activeCategory !== "All" ? activeCategory : undefined,
          search: searchQuery.trim() || undefined,
        });

        if (!isCancelled) {
          if (res.success && res.data?.posts?.length) {
            setBlogs(res.data.posts);
            if (res.data.categories) {
              setCategories(res.data.categories);
            }
          } else {
            // Filter fallback articles
            let filtered = [...FALLBACK_BLOGS];
            if (activeCategory !== "All") {
              filtered = filtered.filter((b) => b.category === activeCategory);
            }
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              filtered = filtered.filter(
                (b) =>
                  b.title.toLowerCase().includes(q) ||
                  b.description.toLowerCase().includes(q)
              );
            }
            setBlogs(filtered);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          let filtered = [...FALLBACK_BLOGS];
          if (activeCategory !== "All") {
            filtered = filtered.filter((b) => b.category === activeCategory);
          }
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
              (b) =>
                b.title.toLowerCase().includes(q) ||
                b.description.toLowerCase().includes(q)
            );
          }
          setBlogs(filtered);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchBlogs();
    return () => {
      isCancelled = true;
    };
  }, [activeCategory, searchQuery]);

  const featuredPost = blogs.length > 0 && !searchQuery && activeCategory === "All" ? blogs[0] : null;
  const gridPosts = featuredPost ? blogs.slice(1) : blogs;

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <PageHero pageKey="blog" />

      {/* Main Content Area */}
      <section className="py-12 md:py-16">
        <div className="container-x">
          {/* Controls Bar: Category Pills + Live Search */}
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Filter Pills with Badge Counters */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all ${
                      isActive
                        ? "bg-[#087a45] text-white shadow-md shadow-[#087a45]/25 scale-105"
                        : "bg-[var(--white)] text-[var(--muted)] border border-[var(--line)] hover:border-[#087a45]/40 hover:text-[var(--ink)]"
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Modern Search Input */}
            <div className="relative w-full lg:w-80">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search automotive articles..."
                className="h-11 w-full rounded-full border border-[var(--line)] bg-[var(--white)] pl-11 pr-10 text-xs font-bold text-[var(--ink)] outline-none transition focus:border-[#087a45] focus:ring-4 focus:ring-[#087a45]/10 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] transition"
                  title="Clear Search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Indicator */}
          {(activeCategory !== "All" || searchQuery) && (
            <div className="mb-8 flex items-center justify-between rounded-2xl bg-[var(--white)] border border-[var(--line)] px-5 py-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-[var(--muted)]">
                <Tag size={14} className="text-[#087a45]" />
                <span>
                  Filtering by:{" "}
                  {activeCategory !== "All" && (
                    <strong className="text-[var(--ink)]">{activeCategory}</strong>
                  )}
                  {activeCategory !== "All" && searchQuery && " + "}
                  {searchQuery && (
                    <span>
                      &quot;<strong className="text-[var(--ink)]">{searchQuery}</strong>&quot;
                    </span>
                  )}
                  {" "}({blogs.length} result{blogs.length === 1 ? "" : "s"})
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
                className="font-bold text-[#087a45] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* SKELETON LOADING STATE */}
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] p-0 shadow-sm animate-pulse"
                >
                  <div className="aspect-[16/10] w-full bg-[var(--line)]/50" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-24 rounded bg-[var(--line)]/60" />
                    <div className="h-5 w-full rounded bg-[var(--line)]/80" />
                    <div className="h-4 w-3/4 rounded bg-[var(--line)]/50" />
                    <div className="h-12 w-full rounded bg-[var(--line)]/30 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            /* EMPTY STATE */
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] py-20 px-4 text-center shadow-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#087a45]/10 text-[#087a45] mb-4">
                <Compass size={32} />
              </div>
              <h3 className="text-xl font-black text-[var(--ink)]">
                No matching articles found
              </h3>
              <p className="mt-2 text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find any articles matching your search query. Try broadening your keywords or exploring another category.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087a45] px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-[#066237] transition"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <>
              {/* FEATURED SPOTLIGHT HERO BANNER */}
              {featuredPost && (
                <Reveal delay={0.05}>
                  <div className="mb-14 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-xl transition-all hover:shadow-2xl">
                    <div className="grid lg:grid-cols-12">
                      {/* Image Frame */}
                      <Link
                        href={`/${locale}/blog/${featuredPost.slug}`}
                        className="group relative h-72 sm:h-96 lg:h-full lg:col-span-7 overflow-hidden bg-[var(--paper)] block"
                      >
                        <img
                          src={getDocumentUrl(featuredPost.coverImage)}
                          alt={featuredPost.title}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 lg:hidden" />
                        <div className="absolute left-4 top-4 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#087a45] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
                            <Sparkles size={13} />
                            Featured Story
                          </span>
                          <span className="rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                            {featuredPost.category}
                          </span>
                        </div>
                      </Link>

                      {/* Content Frame */}
                      <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-5 bg-[var(--white)]">
                        <div>
                          <div className="flex items-center gap-3 text-xs font-bold text-[var(--muted)]">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} />
                              {new Date(featuredPost.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} />
                              {featuredPost.readTime || "4 min read"}
                            </span>
                          </div>

                          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-[var(--ink)] leading-tight tracking-tight">
                            <Link
                              href={`/${locale}/blog/${featuredPost.slug}`}
                              className="transition hover:text-[#087a45]"
                            >
                              {featuredPost.title}
                            </Link>
                          </h2>

                          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[var(--muted)] line-clamp-4">
                            {featuredPost.description}
                          </p>
                        </div>

                        {/* Card Footer with Author and CTA */}
                        <div className="mt-8 pt-6 border-t border-[var(--line)] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#087a45]/15 text-[#087a45] font-black text-xs">
                              {featuredPost.author?.name?.[0] || "T"}
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black text-[var(--ink)]">
                                {featuredPost.author?.name || "Title Bros Team"}
                              </p>
                              <p className="text-[10px] text-[var(--muted)]">
                                {featuredPost.author?.role || "Staff Editor"}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/${locale}/blog/${featuredPost.slug}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#087a45] px-4 py-2 text-xs font-black text-white shadow-md shadow-[#087a45]/20 transition hover:bg-[#066237] hover:scale-105"
                          >
                            <span>Read Article</span>
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )}

              {/* UNIFORM 3-COLUMN ARTICLE GRID */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((item, i) => (
                  <Reveal key={item.slug || item._id} delay={i * 0.05}>
                    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div>
                        {/* Cover Image with 16:10 Ratio */}
                        <Link
                          href={`/${locale}/blog/${item.slug}`}
                          className="relative block aspect-[16/10] w-full overflow-hidden bg-[var(--paper)]"
                        >
                          <img
                            src={getDocumentUrl(item.coverImage)}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                          <div className="absolute left-3.5 top-3.5">
                            <span className="rounded-full bg-black/65 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                              {item.category}
                            </span>
                          </div>
                          <div className="absolute right-3.5 top-3.5">
                            <span className="flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                              <Clock size={11} />
                              {item.readTime || "4 min"}
                            </span>
                          </div>
                        </Link>

                        {/* Card Body */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--muted)]">
                            <Calendar size={12} className="text-[#087a45]" />
                            <span>
                              {new Date(item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {/* Clamped Title with minimum height for uniform alignment */}
                          <h2 className="mt-3 text-base font-black leading-snug text-[var(--ink)] line-clamp-2 min-h-[2.75rem] transition group-hover:text-[#087a45]">
                            <Link href={`/${locale}/blog/${item.slug}`}>
                              {item.title}
                            </Link>
                          </h2>

                          {/* Clamped Excerpt with minimum height */}
                          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)] line-clamp-3 min-h-[3.6rem]">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer with Author & Link */}
                      <div className="border-t border-[var(--line)] bg-[var(--paper)]/30 px-6 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="grid h-6 w-6 place-items-center rounded-full bg-[#087a45]/15 text-[#087a45] text-[10px] font-black">
                            {item.author?.name?.[0] || "T"}
                          </div>
                          <span className="truncate max-w-[120px] font-bold text-[11px] text-[var(--muted)]">
                            {item.author?.name || "Title Bros"}
                          </span>
                        </div>

                        <Link
                          href={`/${locale}/blog/${item.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-black text-[#087a45] transition group-hover:translate-x-1"
                        >
                          <span>{t("readArticle") || "Read"}</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <NextStep />
    </div>
  );
}