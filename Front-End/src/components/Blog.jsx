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
    createdAt: new Date().toISOString(),
  },
];

const Blog = () => {
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
            // Fallback filtering
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
          console.warn("Falling back to local blogs:", err);
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

  const featuredPost = blogs[0];
  const gridPosts = blogs.length > 1 ? blogs.slice(1) : blogs;

  return (
    <>
      <PageHero pageKey="blog" />

      <section className="pt-0 pb-16">
        <div className="container-x">
          {/* Search & Category Filter Bar */}
          <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-black transition ${
                    activeCategory === cat
                      ? "bg-[#087a45] text-white shadow-md shadow-[#087a45]/20"
                      : "bg-[var(--paper)] text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--ink)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="h-11 w-full rounded-full border border-black/10 bg-[var(--white)] pl-10 pr-4 text-xs font-semibold text-[var(--ink)] outline-none transition focus:border-[#087a45] focus:ring-4 focus:ring-[#087a45]/10"
              />
            </div>
          </div>

          {/* Featured Spotlight Card (shown when no specific search is active) */}
          {featuredPost && !searchQuery && activeCategory === "All" && (
            <Reveal delay={0.05}>
              <div className="mb-12 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-xl transition hover:shadow-2xl">
                <div className="grid gap-0 lg:grid-cols-12">
                  <div className="relative h-64 lg:h-auto lg:col-span-7 overflow-hidden bg-[var(--paper)]">
                    <img
                      src={getDocumentUrl(featuredPost.coverImage)}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#087a45] px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md">
                        <Sparkles size={12} />
                        Featured Story
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-5">
                    <div>
                      <div className="flex items-center gap-3 text-xs font-bold text-[var(--muted)]">
                        <span className="rounded-md bg-[#087a45]/10 px-2 py-0.5 text-[#087a45]">
                          {featuredPost.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {featuredPost.readTime || "4 min read"}
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl sm:text-3xl font-black text-[var(--ink)] leading-tight">
                        <Link
                          href={`/${locale}/blog/${featuredPost.slug}`}
                          className="hover:text-[#087a45] transition"
                        >
                          {featuredPost.title}
                        </Link>
                      </h2>

                      {/* Description with clean card budget */}
                      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] line-clamp-3">
                        {featuredPost.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--line)] flex items-center justify-between">
                      <div className="text-xs text-[var(--muted)]">
                        Published {new Date(featuredPost.createdAt).toLocaleDateString()}
                      </div>

                      <Link
                        href={`/${locale}/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#087a45] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-[#087a45]/20 transition hover:bg-[#066237]"
                      >
                        Read Article
                        <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* 3-Column Standard Articles Grid */}
          {blogs.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen size={48} className="mx-auto text-[var(--muted)]/40" />
              <h3 className="mt-4 text-lg font-black text-[var(--ink)]">
                No matching articles found
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Try searching with different keywords or choosing another category.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(searchQuery || activeCategory !== "All" ? blogs : gridPosts).map(
                (item, i) => (
                  <Reveal key={item.slug || item._id} delay={i * 0.05}>
                    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-sm transition hover:shadow-xl">
                      <div>
                        {/* Cover Image Container */}
                        <Link
                          href={`/${locale}/blog/${item.slug}`}
                          className="block relative h-52 w-full overflow-hidden bg-[var(--paper)]"
                        >
                          <img
                            src={getDocumentUrl(item.coverImage)}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute left-3 top-3">
                            <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                              {item.category}
                            </span>
                          </div>
                        </Link>

                        {/* Article Text Content */}
                        <div className="p-6">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted)]">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {item.readTime || "4 min read"}
                            </span>
                          </div>

                          <h2 className="mt-3 text-lg font-black leading-snug text-[var(--ink)] line-clamp-2 transition group-hover:text-[#087a45]">
                            <Link href={`/${locale}/blog/${item.slug}`}>
                              {item.title}
                            </Link>
                          </h2>

                          {/* Card Description - Strictly Line-Clamped for Uniform Heights */}
                          <p className="mt-2.5 text-xs leading-relaxed text-[var(--muted)] line-clamp-3">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-6 pt-0">
                        <Link
                          href={`/${locale}/blog/${item.slug}`}
                          className="mt-2 flex items-center gap-1.5 text-xs font-black text-[#087a45] transition group-hover:translate-x-1"
                        >
                          <span>{t("readArticle") || "Read Article"}</span>
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <NextStep />
    </>
  );
};

export default Blog;