"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  CheckCircle2,
  ArrowRight,
  Car,
  Loader2,
  Sparkles,
  Quote,
  Eye,
  Bookmark,
} from "lucide-react";
import loanService, { getDocumentUrl } from "@/services/loanService";
import NextStep from "@/components/common/NextStep";

export default function BlogPostReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const locale = params?.locale || "en";

  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;

    let isCancelled = false;

    async function fetchBlog() {
      try {
        setLoading(true);
        setError("");
        const res = await loanService.getBlogBySlug(slug);
        if (!isCancelled) {
          if (res.success && res.data?.post) {
            setPost(res.data.post);
            setRelated(res.data.related || []);
          } else {
            setError("Blog article not found.");
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Unable to load article.");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchBlog();
    return () => {
      isCancelled = true;
    };
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 bg-[var(--paper)]">
        <Loader2 size={40} className="animate-spin text-[#087a45]" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Preparing Article...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[var(--paper)]">
        <div className="mx-auto max-w-md rounded-3xl border border-[var(--line)] bg-[var(--white)] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
            <Bookmark size={28} />
          </div>
          <h2 className="text-xl font-black text-[var(--ink)]">
            Article Not Found
          </h2>
          <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
            The article you are looking for may have been updated, unpublished, or moved.
          </p>
          <Link
            href={`/${locale}/blog`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087a45] px-5 py-2.5 text-xs font-black text-white hover:bg-[#066237] transition"
          >
            <ArrowLeft size={14} /> Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  // Sort dynamic blocks by sequential order
  const sortedBlocks = [...(post.blocks || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <div className="min-h-screen bg-[var(--white)] text-[var(--ink)]">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div
          className="h-full bg-[#087a45] transition-all duration-150 ease-out shadow-sm"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Breadcrumb Navigation Header */}
      <div className="border-b border-[var(--line)] bg-[var(--paper)]/60 py-4">
        <div className="container-x flex items-center justify-between">
          <Link
            href={`/${locale}/blog`}
            className="group inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] transition hover:text-[#087a45]"
          >
            <ArrowLeft size={14} className="transition group-hover:-translate-x-1" />
            <span>All Articles</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#087a45]/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#087a45]">
              {post.category || "Title Loans"}
            </span>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--white)] px-3 py-1 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition"
              title="Share article link"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-600 font-bold text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span className="hidden sm:inline text-[11px]">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="container-x max-w-4xl py-12 lg:py-16">
        {/* Article Meta Header */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[#087a45]" />
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#087a45]" />
              {post.readTime || "4 min read"}
            </span>
            {post.views > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Eye size={13} className="text-[#087a45]" />
                  {post.views} reads
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.15] tracking-tight text-[var(--ink)]">
            {post.title}
          </h1>

          {/* Author Byline */}
          <div className="flex items-center gap-3 pt-2">
            {post.author?.avatar ? (
              <img
                src={getDocumentUrl(post.author.avatar)}
                alt={post.author.name}
                className="h-11 w-11 rounded-full object-cover border border-black/10 shadow-sm"
              />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#087a45]/15 text-[#087a45] font-black text-sm">
                {(post.author?.name || "T")[0]}
              </div>
            )}
            <div>
              <div className="text-sm font-black text-[var(--ink)]">
                {post.author?.name || "Title Bros Editorial Team"}
              </div>
              <div className="text-xs text-[var(--muted)] font-medium">
                {post.author?.role || "Automotive & Lending Specialist"}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Cover Image */}
        {post.coverImage && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-[var(--line)] shadow-xl bg-[var(--paper)]">
            <img
              src={getDocumentUrl(post.coverImage)}
              alt={post.title}
              className="h-72 sm:h-[420px] w-full object-cover"
            />
          </div>
        )}

        {/* Lead Excerpt Description Box */}
        {post.description && (
          <div className="mt-8 rounded-2xl border-l-4 border-l-[#087a45] bg-[var(--paper)] p-6 sm:p-7 text-base sm:text-lg font-medium leading-relaxed text-[var(--ink)] shadow-sm">
            {post.description}
          </div>
        )}

        {/* DYNAMIC CONTENT BLOCKS IN SEQUENTIAL FLOW */}
        <div className="mt-12 space-y-9 text-[var(--ink)]">
          {sortedBlocks.map((block, idx) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={block.id || idx}
                  className="pt-6 text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight border-b border-[var(--line)] pb-3"
                >
                  {block.content}
                </h2>
              );
            }

            if (block.type === "text") {
              return (
                <div
                  key={block.id || idx}
                  className="space-y-4 text-base sm:text-[17px] leading-relaxed text-[var(--ink)]/90"
                >
                  {block.content
                    ?.split("\n\n")
                    .map((paragraph, pIdx) => (
                      <p key={pIdx} className="leading-8">
                        {paragraph}
                      </p>
                    ))}
                </div>
              );
            }

            if (block.type === "quote") {
              return (
                <blockquote
                  key={block.id || idx}
                  className="relative my-6 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-7 sm:p-8 shadow-sm"
                >
                  <Quote size={28} className="text-[#087a45]/30 mb-2" />
                  <p className="text-lg sm:text-xl font-bold italic leading-relaxed text-[#087a45]">
                    &ldquo;{block.content}&rdquo;
                  </p>
                </blockquote>
              );
            }

            if (block.type === "image") {
              return (
                <figure key={block.id || idx} className="my-10">
                  <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] shadow-lg">
                    <img
                      src={getDocumentUrl(block.imageUrl)}
                      alt={block.caption || post.title}
                      className="h-auto max-h-[520px] w-full object-cover"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="mt-3 text-center text-xs font-semibold text-[var(--muted)]">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            return null;
          })}
        </div>

        {/* Embedded Loan Call to Action */}
        <div className="mt-16 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(185,239,59,.18),transparent_45%),linear-gradient(135deg,#087a45,#0b1510)] p-8 sm:p-12 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[var(--lime)]">
                <Car size={15} /> Fast Title Loans Online
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">
                Unlock Cash While You Keep Driving
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed">
                Get approved in minutes with no credit hit, no hidden fees, and same-day electronic transfer.
              </p>
            </div>

            <Link
              href={`/${locale}/apply`}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[var(--lime)] px-7 py-4 text-xs font-black text-black shadow-xl transition hover:scale-105"
            >
              <span>Apply Online Now</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--line)]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-[var(--ink)]">
                Related Articles
              </h3>
              <Link
                href={`/${locale}/blog`}
                className="text-xs font-bold text-[#087a45] hover:underline"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/${locale}/blog/${rel.slug}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--paper)]">
                    <img
                      src={getDocumentUrl(rel.coverImage)}
                      alt={rel.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-black uppercase text-white backdrop-blur-md">
                        {rel.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black text-[var(--ink)] line-clamp-2 leading-snug group-hover:text-[#087a45] transition">
                        {rel.title}
                      </h4>
                      <p className="mt-1.5 text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                        {rel.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px] font-bold text-[#087a45]">
                      <span>Read Story</span>
                      <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <NextStep />
    </div>
  );
}
