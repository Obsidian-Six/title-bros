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
  CheckCircle2,
  ArrowRight,
  Car,
  Loader2,
  Sparkles,
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
          console.error("Fetch blog error:", err);
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <Loader2 size={36} className="animate-spin text-[#087a45]" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Loading Article...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container-x py-20 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-[var(--line)] bg-[var(--white)] p-8 shadow-xl">
          <h2 className="text-xl font-black text-[var(--ink)]">
            Article Not Found
          </h2>
          <p className="mt-2 text-xs text-[var(--muted)]">
            The article you are looking for may have been moved or unpublished.
          </p>
          <Link
            href={`/${locale}/blog`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087a45] px-5 py-2.5 text-xs font-black text-white hover:bg-[#066237]"
          >
            <ArrowLeft size={14} /> Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  // Sort blocks by order if present
  const sortedBlocks = [...(post.blocks || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <div className="bg-[var(--white)]">
      {/* Top Breadcrumb & Navigation */}
      <div className="border-b border-[var(--line)] bg-[var(--paper)]/50 py-4">
        <div className="container-x flex items-center justify-between">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] transition hover:text-[#087a45]"
          >
            <ArrowLeft size={14} />
            <span>All Articles</span>
          </Link>

          <span className="rounded-full bg-[#087a45]/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#087a45]">
            {post.category || "Title Loans"}
          </span>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="container-x max-w-4xl py-12">
        {/* Article Meta Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {post.readTime || "4 min read"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-[var(--ink)]">
            {post.title}
          </h1>

          {/* Author Card */}
          <div className="flex items-center gap-3 pt-2">
            {post.author?.avatar ? (
              <img
                src={getDocumentUrl(post.author.avatar)}
                alt={post.author.name}
                className="h-11 w-11 rounded-full object-cover border border-black/10"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#087a45]/15 text-[#087a45] font-black text-sm">
                {(post.author?.name || "T")[0]}
              </div>
            )}
            <div>
              <div className="text-sm font-black text-[var(--ink)]">
                {post.author?.name || "Title Bros Team"}
              </div>
              <div className="text-xs text-[var(--muted)]">
                {post.author?.role || "Automotive & Lending Specialist"}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Cover Image */}
        {post.coverImage && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--line)] shadow-xl">
            <img
              src={getDocumentUrl(post.coverImage)}
              alt={post.title}
              className="h-72 sm:h-96 w-full object-cover"
            />
          </div>
        )}

        {/* Lead Short Description */}
        {post.description && (
          <div className="mt-8 rounded-2xl border-l-4 border-l-[#087a45] bg-[var(--paper)] p-6 text-base sm:text-lg font-medium leading-relaxed text-[var(--ink)]">
            {post.description}
          </div>
        )}

        {/* DYNAMIC CONTENT BLOCKS IN EXACT SEQUENCE */}
        <div className="mt-10 space-y-8">
          {sortedBlocks.map((block, idx) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={block.id || idx}
                  className="pt-4 text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight"
                >
                  {block.content}
                </h2>
              );
            }

            if (block.type === "text") {
              return (
                <div
                  key={block.id || idx}
                  className="text-base leading-relaxed text-[var(--ink)]/85 space-y-4"
                >
                  {block.content
                    ?.split("\n\n")
                    .map((paragraph, pIdx) => (
                      <p key={pIdx} className="leading-7">
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
                  className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 italic text-[var(--ink)] shadow-sm"
                >
                  <p className="text-base sm:text-lg font-bold leading-relaxed text-[#087a45]">
                    &ldquo;{block.content}&rdquo;
                  </p>
                </blockquote>
              );
            }

            if (block.type === "image") {
              return (
                <figure key={block.id || idx} className="my-8">
                  <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] shadow-lg">
                    <img
                      src={getDocumentUrl(block.imageUrl)}
                      alt={block.caption || post.title}
                      className="h-auto max-h-[500px] w-full object-cover"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="mt-2.5 text-center text-xs font-medium text-[var(--muted)]">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            return null;
          })}
        </div>

        {/* In-Article Call to Action Banner */}
        <div className="mt-16 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(185,239,59,.15),transparent_40%),linear-gradient(135deg,#087a45,#101512)] p-8 sm:p-10 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[var(--lime)]">
                <Car size={14} /> Instant Vehicle Equity
              </span>
              <h3 className="text-2xl font-black">
                Unlock Cash While You Keep Your Car
              </h3>
              <p className="text-xs text-white/80 max-w-lg leading-relaxed">
                Apply online in under 3 minutes. Zero impact on your credit score,
                no hidden origination fees, and same-day direct funding.
              </p>
            </div>

            <Link
              href={`/${locale}/apply`}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[var(--lime)] px-6 py-3.5 text-xs font-black text-black shadow-lg transition hover:scale-105"
            >
              <span>Apply Online Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--line)]">
            <h3 className="text-xl font-black text-[var(--ink)]">
              Related Articles
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/${locale}/blog/${rel.slug}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--white)] shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-[var(--paper)]">
                    <img
                      src={getDocumentUrl(rel.coverImage)}
                      alt={rel.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-black uppercase text-[#087a45]">
                      {rel.category}
                    </span>
                    <h4 className="mt-1 text-sm font-black text-[var(--ink)] line-clamp-2 group-hover:text-[#087a45]">
                      {rel.title}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">
                      {rel.description}
                    </p>
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
