"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  CarFront,
  CircleDollarSign,
  UserRound,
} from "lucide-react";
import Button from "./common/Button";
import { useParams } from "next/navigation";

const loanOptions = [
  {
    id: "title-loan",
    title: "Title Loans",
    label: "VEHICLE-BACKED LOAN",
    description:
      "Need cash fast? A title loan lets you use your vehicle's title to borrow money while continuing to drive your vehicle. Get started with your online loan application today.",

    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85",

    icon: CarFront,
  },

  {
    id: "personal-loan",
    title: "Personal Loans",
    label: "PERSONAL FINANCING",
    description:
      "Whether you're handling an unexpected expense or planning for what's next, a personal loan can provide access to funds for your individual needs.",

    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=85",

    icon: UserRound,
  },
];

export default function MediaSection() {
    const { locale } = useParams();
  return (
    <section className="relative overflow-hidden bg-[#f4f6f4] py-20 sm:py-24 lg:py-32">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {/* Green glow */}

        <div
          className="absolute -right-[180px] top-[-100px] h-[500px] w-[500px] rounded-full bg-[#aabbb0]/20 blur-[140px]
          "
        />

        <div
          className="absolute -left-[180px] bottom-[-150px] h-[450px] w-[450px] rounded-full bg-[#dce4df]/70 blur-[130px]
          "
        />
      </div>

      {/* =====================================================
          CONTAINER
      ====================================================== */}

      <div className="relative mx-auto max-w-[1250px] px-5 sm:px-8 lg:px-10">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          {/* Eyebrow */}

          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#7c9184]" />

            <span
              className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#63776b"
            >
              Title Bros
            </span>

            <span className="h-px w-8 bg-[#7c9184]" />
          </div>

          {/* Heading */}

          <h2
            className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.9] tracking-[-0.055em] text-[#121815]"
          >
            Find The Right
            <br />
            <span className="text-[var(--green)]">Loan For You.</span>
          </h2>

          {/* Description */}

          <p
            className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#69736d] sm:text-[15px]"
          >
            Whether you&#39;re looking to use your vehicle&#39;s title or need funds for
            personal expenses, explore your options with Title Bros.
          </p>
        </div>

        {/* =====================================================
            LOAN CARDS
        ====================================================== */}

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {loanOptions.map((loan) => (
            <LoanCard key={loan.id} loan={loan} locale={locale} />
          ))}
        </div>

        {/* =====================================================
            BOTTOM
        ====================================================== */}

        <div className="mt-10 flex justify-center sm:mt-12">
          <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.2em] text-[#7c8780]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#809488]" />
            Simple. Straightforward. Title Bros.
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   LOAN CARD
============================================================ */

function LoanCard({ loan,locale }) {
  const LoanIcon = loan.icon;

  return (
    <article
      className="group overflow-hidden rounded-[5px] border border-[#d8dfda] bg-white shadow-[0_8px_35px_rgba(20,30,24,0.055)] transition-all duration-500 hover:-translate-y-1 hover:border-[#aebdb3] hover:shadow-[0_20px_55px_rgba(20,30,24,0.11)] rounded-[24px]"
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div className="relative aspect-[16/9] overflow-hidden bg-[#dce2de]">
        <Image
          src={loan.image}
          alt={`${loan.title} - Title Bros`}
          fill
          unoptimized
          sizes="
            (max-width: 768px) 100vw,
            50vw
          "
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]
          "
        />

        {/* Image overlay */}

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent
          "
        />

        {/* ==================================================
            FLOATING ICON
        =================================================== */}

        <div
          className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#101713]/95 text-[#aab9af] shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-500 group-hover:bg-[#26372d] group-hover:text-[#c2d0c7]
          "
        >
          <LoanIcon size={19} strokeWidth={1.6} />
        </div>

        {/* ==================================================
            LABEL
        =================================================== */}

        <div
          className="absolute bottom-4 left-4 border border-white/20 bg-black/35 px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-md
          "
        >
          {loan.label}
        </div>
      </div>

      {/* =====================================================
          CARD CONTENT
      ====================================================== */}

      <div className="px-6 pb-7 pt-6 sm:px-8 sm:pb-8">
        {/* TITLE */}

        <h3
          className="text-center text-[27px] font-medium leading-none tracking-[-0.035em] text-[#17201b] sm:text-[30px]
          "
        >
          {loan.title}
        </h3>

        {/* DESCRIPTION */}

        <p
          className="mx-auto mt-4 max-w-[570px] text-center text-[13px] leading-[1.7] text-[#69736d] sm:text-[14px]
          "
        >
          {loan.description}
        </p>

        {/* ==================================================
            CTA
        =================================================== */}

        <div className="mt-6 flex justify-center">
            <Button href={`/${locale}/${loan.id}`} icon={ArrowRight}>Get More Info</Button>
          {/* <Link
            href={`/loans/${loan.id}`}
            className="group/button inline-flex items-center gap-2.5 rounded-[3px] bg-[#26362d] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-[#17231c] hover:shadow-[0_8px_25px_rgba(38,54,45,0.2)]
            "
          >
            Get More Info
            <ArrowRight
              size={15}
              strokeWidth={1.7}
              className="transition-transform duration-300 group-hover/button:translate-x-1"
            />
          </Link> */}
        </div>
      </div>
    </article>
  );
}
