"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Image as ImageIcon,
  Type,
  Heading,
  Quote,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import loanService, { getDocumentUrl } from "@/services/loanService";

const CATEGORIES = [
  "Title Loans",
  "Vehicle Equity",
  "Financial Tips",
  "Auto Guides",
  "Car Care",
  "Industry Insights",
];

const MAX_DESCRIPTION_CHARS = 200;

export default function BlogBuilderModal({
  isOpen,
  onClose,
  initialData = null,
  onSaved,
}) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Title Loans",
    description: "",
    coverImage: "",
    authorName: "Title Bros Team",
    authorRole: "Automotive & Finance Specialist",
    status: "PUBLISHED",
    blocks: [],
  });

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const coverFileRef = useRef(null);
  const blockFileRefs = useRef({});

  // Initialize or populate modal data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        category: initialData.category || "Title Loans",
        description: initialData.description || "",
        coverImage: initialData.coverImage || "",
        authorName: initialData.author?.name || "Title Bros Team",
        authorRole: initialData.author?.role || "Automotive & Finance Specialist",
        status: initialData.status || "PUBLISHED",
        blocks: initialData.blocks ? [...initialData.blocks] : [],
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        category: "Title Loans",
        description: "",
        coverImage: "",
        authorName: "Title Bros Team",
        authorRole: "Automotive & Finance Specialist",
        status: "PUBLISHED",
        blocks: [
          {
            id: `blk-${Date.now()}-1`,
            type: "heading",
            content: "Introduction",
            order: 0,
          },
          {
            id: `blk-${Date.now()}-2`,
            type: "text",
            content: "",
            order: 1,
          },
          {
            id: `blk-${Date.now()}-3`,
            type: "image",
            imageUrl: "",
            caption: "",
            order: 2,
          },
          {
            id: `blk-${Date.now()}-4`,
            type: "text",
            content: "",
            order: 3,
          },
        ],
      });
    }
    setErrorMessage("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Handle Cover Image Upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      setErrorMessage("");
      const res = await loanService.uploadBlogImage(file);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: res.data.url,
        }));
      }
    } catch (err) {
      console.error("Cover upload error:", err);
      setErrorMessage(err.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Block Image Upload
  const handleBlockImageUpload = async (blockId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBlockId(blockId);
      setErrorMessage("");
      const res = await loanService.uploadBlogImage(file);
      if (res.success && res.data?.url) {
        updateBlock(blockId, { imageUrl: res.data.url });
      }
    } catch (err) {
      console.error("Block image upload error:", err);
      setErrorMessage(err.message || "Failed to upload image.");
    } finally {
      setUploadingBlockId(null);
    }
  };

  // Block Manipulation: Add
  const addBlock = (type) => {
    const newBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      content: "",
      imageUrl: "",
      caption: "",
      order: formData.blocks.length,
    };
    setFormData((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  };

  // Block Manipulation: Update
  const updateBlock = (blockId, updates) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((blk) =>
        blk.id === blockId ? { ...blk, ...updates } : blk
      ),
    }));
  };

  // Block Manipulation: Remove
  const removeBlock = (blockId) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((blk) => blk.id !== blockId),
    }));
  };

  // Block Manipulation: Move Up / Down
  const moveBlock = (index, direction) => {
    const newBlocks = [...formData.blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    // Refresh orders
    const reordered = newBlocks.map((b, idx) => ({ ...b, order: idx }));
    setFormData((prev) => ({ ...prev, blocks: reordered }));
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.title.trim()) {
      setErrorMessage("Please enter an article title.");
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Please provide a short description for the blog card.");
      return;
    }

    if (formData.description.length > MAX_DESCRIPTION_CHARS) {
      setErrorMessage(
        `Description exceeds ${MAX_DESCRIPTION_CHARS} characters (currently ${formData.description.length}). Please shorten it so cards align properly.`
      );
      return;
    }

    if (!formData.coverImage.trim()) {
      setErrorMessage("Please upload or provide a cover image.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        category: formData.category,
        description: formData.description.trim(),
        coverImage: formData.coverImage.trim(),
        author: {
          name: formData.authorName.trim(),
          role: formData.authorRole.trim(),
        },
        status: formData.status,
        blocks: formData.blocks,
      };

      let res;
      if (initialData?._id) {
        res = await loanService.updateBlog(initialData._id, payload);
      } else {
        res = await loanService.createBlog(payload);
      }

      if (res.success) {
        if (onSaved) onSaved(res.data);
        onClose();
      }
    } catch (err) {
      console.error("Save blog error:", err);
      setErrorMessage(err.message || "Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  const descLen = formData.description.length;
  const isDescOver = descLen > MAX_DESCRIPTION_CHARS;
  const isDescNear = descLen >= MAX_DESCRIPTION_CHARS - 25 && !isDescOver;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative my-8 flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087a45]/10 text-[#087a45]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--ink)]">
                {initialData ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Drag, drop, and compose image and text blocks in any sequence.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title & Category Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-[var(--ink)]/60">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. How Car Title Loans Work in the United Kingdom"
                className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-bold text-[var(--ink)] outline-none focus:border-[#087a45] focus:ring-4 focus:ring-[#087a45]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-[var(--ink)]/60">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[#087a45]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image & Live Character-Counted Description */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Cover Image Card */}
            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[var(--ink)]/60">
                <span>Cover Image *</span>
                {uploadingCover && (
                  <span className="flex items-center gap-1 text-[10px] text-[#087a45]">
                    <Loader2 size={12} className="animate-spin" /> Uploading...
                  </span>
                )}
              </label>

              {formData.coverImage ? (
                <div className="group relative h-48 w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
                  <img
                    src={getDocumentUrl(formData.coverImage)}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, coverImage: "" }))
                    }
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                  >
                    <X size={15} />
                  </button>
                  <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    Cover Preview
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => coverFileRef.current?.click()}
                  className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/15 bg-[var(--paper)] p-4 text-center transition hover:border-[#087a45] hover:bg-[#087a45]/5"
                >
                  <input
                    ref={coverFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-[#087a45]">
                    <Upload size={18} />
                  </div>
                  <span className="text-xs font-bold text-[var(--ink)]">
                    Click or Drag to Upload Cover Image
                  </span>
                  <span className="mt-1 text-[11px] text-[var(--muted)]">
                    Supports JPG, PNG, WEBP (Max 10MB)
                  </span>
                </div>
              )}

              {/* Direct URL input alternative */}
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                }
                placeholder="Or paste image URL (https://...)"
                className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-xs text-[var(--ink)] outline-none focus:border-[#087a45]"
              />
            </div>

            {/* Description with LIVE CHARACTER COUNT */}
            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[var(--ink)]/60">
                <span>Card Short Description *</span>
                <span
                  className={`text-xs font-black transition ${
                    isDescOver
                      ? "text-red-600"
                      : isDescNear
                      ? "text-amber-600"
                      : "text-[#087a45]"
                  }`}
                >
                  {descLen} / {MAX_DESCRIPTION_CHARS} chars
                </span>
              </div>

              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter a concise summary of this post. This description appears on the blog cards and article preview."
                className={`w-full flex-1 rounded-2xl border bg-white p-4 text-sm text-[var(--ink)] outline-none transition focus:ring-4 ${
                  isDescOver
                    ? "border-red-400 focus:ring-red-400/10"
                    : "border-black/10 focus:border-[#087a45] focus:ring-[#087a45]/10"
                }`}
              />

              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                <CheckCircle2 size={13} className="text-[#087a45]" />
                <span>
                  Prevents card misalignment on the public blogs directory.
                </span>
              </div>

              {/* Status and Author details */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-black/10 bg-white px-2 text-xs font-bold text-[var(--ink)] outline-none"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorName: e.target.value,
                      }))
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-[var(--ink)] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC CONTENT BLOCKS BUILDER */}
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--ink)]">
                  Dynamic Article Blocks
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Combine images, paragraphs, and headings in any sequence.
                </p>
              </div>

              {/* Block Addition Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => addBlock("text")}
                  className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] shadow-sm transition hover:bg-[#087a45] hover:text-white"
                >
                  <Type size={14} />
                  + Text Box
                </button>

                <button
                  type="button"
                  onClick={() => addBlock("image")}
                  className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] shadow-sm transition hover:bg-[#087a45] hover:text-white"
                >
                  <ImageIcon size={14} />
                  + Image Box
                </button>

                <button
                  type="button"
                  onClick={() => addBlock("heading")}
                  className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] shadow-sm transition hover:bg-[#087a45] hover:text-white"
                >
                  <Heading size={14} />
                  + Heading
                </button>

                <button
                  type="button"
                  onClick={() => addBlock("quote")}
                  className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] shadow-sm transition hover:bg-[#087a45] hover:text-white"
                >
                  <Quote size={14} />
                  + Quote
                </button>
              </div>
            </div>

            {/* Blocks List */}
            {formData.blocks.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-black/10 bg-white py-12 text-center">
                <Type size={32} className="mx-auto text-[var(--muted)]/40" />
                <p className="mt-2 text-xs font-bold text-[var(--ink)]">
                  No content blocks yet
                </p>
                <p className="text-[11px] text-[var(--muted)]">
                  Click the buttons above to add Text Boxes, Image Boxes, or Headings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="relative rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    {/* Block Header Toolbar */}
                    <div className="mb-3 flex items-center justify-between border-b border-black/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--paper)] text-[var(--ink)] font-black text-[11px]">
                          {index + 1}
                        </span>
                        <span className="rounded-md bg-[#087a45]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#087a45]">
                          {block.type === "text"
                            ? "Text Box"
                            : block.type === "image"
                            ? "Image Box"
                            : block.type === "heading"
                            ? "Section Heading"
                            : "Quote Box"}
                        </span>
                      </div>

                      {/* Reorder and Delete Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveBlock(index, "up")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>

                        <button
                          type="button"
                          disabled={index === formData.blocks.length - 1}
                          onClick={() => moveBlock(index, "down")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                          title="Delete Block"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Block Content Inputs */}
                    {block.type === "heading" && (
                      <input
                        type="text"
                        value={block.content || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
                        placeholder="Enter section heading (e.g. Unlocking Capital From Your Vehicle)"
                        className="h-11 w-full rounded-xl border border-black/10 bg-[var(--paper)] px-3 text-sm font-bold text-[var(--ink)] outline-none focus:border-[#087a45]"
                      />
                    )}

                    {block.type === "text" && (
                      <textarea
                        rows={4}
                        value={block.content || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
                        placeholder="Type paragraph content here. You can insert multiple paragraphs, bullet points, or instructions..."
                        className="w-full rounded-xl border border-black/10 bg-[var(--paper)] p-3 text-xs leading-relaxed text-[var(--ink)] outline-none focus:border-[#087a45]"
                      />
                    )}

                    {block.type === "quote" && (
                      <textarea
                        rows={2}
                        value={block.content || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
                        placeholder="Type a key takeaway or quote here..."
                        className="w-full rounded-xl border-l-4 border-l-[#087a45] border-black/10 bg-[var(--paper)] p-3 text-xs font-semibold italic text-[var(--ink)] outline-none focus:border-[#087a45]"
                      />
                    )}

                    {block.type === "image" && (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Image Box Upload / Preview */}
                          {block.imageUrl ? (
                            <div className="relative h-40 w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--paper)]">
                              <img
                                src={getDocumentUrl(block.imageUrl)}
                                alt="Block upload"
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateBlock(block.id, { imageUrl: "" })
                                }
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                blockFileRefs.current[block.id]?.click()
                              }
                              className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/15 bg-[var(--paper)] p-3 text-center transition hover:border-[#087a45]"
                            >
                              <input
                                ref={(el) => (blockFileRefs.current[block.id] = el)}
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleBlockImageUpload(block.id, e)
                                }
                                className="hidden"
                              />
                              <ImageIcon
                                size={24}
                                className="text-[#087a45] mb-1"
                              />
                              <span className="text-xs font-bold text-[var(--ink)]">
                                {uploadingBlockId === block.id ? (
                                  <span className="flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" />{" "}
                                    Uploading...
                                  </span>
                                ) : (
                                  "Click or Drop Image Here"
                                )}
                              </span>
                              <span className="text-[10px] text-[var(--muted)]">
                                Max 10MB JPG, PNG, WEBP
                              </span>
                            </div>
                          )}

                          {/* Image URL & Caption Inputs */}
                          <div className="flex flex-col justify-between space-y-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                                Image URL (Optional)
                              </label>
                              <input
                                type="text"
                                value={block.imageUrl || ""}
                                onChange={(e) =>
                                  updateBlock(block.id, {
                                    imageUrl: e.target.value,
                                  })
                                }
                                placeholder="https://..."
                                className="mt-1 h-9 w-full rounded-xl border border-black/10 bg-[var(--paper)] px-3 text-xs text-[var(--ink)] outline-none focus:border-[#087a45]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                                Image Caption (Shown beneath photo)
                              </label>
                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) =>
                                  updateBlock(block.id, {
                                    caption: e.target.value,
                                  })
                                }
                                placeholder="e.g. Title loans evaluate vehicle equity without losing daily mobility."
                                className="mt-1 h-9 w-full rounded-xl border border-black/10 bg-[var(--paper)] px-3 text-xs text-[var(--ink)] outline-none focus:border-[#087a45]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit Bar */}
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-black/10 px-5 py-3 text-xs font-bold text-[var(--ink)] transition hover:bg-[var(--paper)]"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || isDescOver}
                className="flex items-center gap-2 rounded-2xl bg-[#087a45] px-6 py-3 text-xs font-black text-white shadow-lg shadow-[#087a45]/20 transition hover:bg-[#066237] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving Article...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    {initialData ? "Update Blog Post" : "Publish Blog Post"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
