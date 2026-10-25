// "use client";
// import Reveal from "./Reveal";
// import StepCard from "./common/StepCard";
// import { useTranslations } from "next-intl";

// export default function WhyUsSec() {
//   const t = useTranslations("why-us");

//   const differentiators = t.raw("differentiators");
//   return (
//     <section className="section">
//       <div className="container-x">
//         <Reveal>
//           <div className="eyebrow text-[var(--muted)]">{t("eyebrow")}</div>
//           <div className="mt-6 flex flex-col justify-between gap-7 md:flex-row md:items-end">
//             <h2 className="h2 max-w-3xl text-[var(--ink)]">
//               {t("title")}{" "}
//               <span className="text-[var(--green)]">{t("titleHighlight")}</span>
//             </h2>
//             <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
//               {t("description")}
//             </p>
//           </div>
//         </Reveal>

//         <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {differentiators?.map((item, i) => (
//             <Reveal key={item.number} delay={i * 0.04}>
//               <StepCard
//                 step={{
//                   number: item.number,
//                   title: item.title,
//                   text: item.text,
//                 }}
//               />
//             </Reveal>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import Image from "next/image";
import {
  CarFront,
  Smartphone,
  MapPin,
  FileCheck2,
  Laptop,
  Headphones,
} from "lucide-react";

const features = [
  {
    number: "01",
    title: "Keep Driving",
    description:
      "Your vehicle remains with you throughout the loan period, so you can keep moving while managing your financial needs.",

    image:
      "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=900&q=85",

    icon: CarFront,
  },

  {
    number: "02",
    title: "Fast Process",
    description:
      "Start your application online and complete the process digitally, making it easier to get moving without unnecessary delays.",

    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85",

    icon: Smartphone,
  },

  {
    number: "03",
    title: "Local Team",
    description:
      "A Las Vegas-focused team that understands the local community and is here to help you through the process.",

    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",

    icon: MapPin,
  },

  {
    number: "04",
    title: "Clear Terms",
    description:
      "See the offer, repayment expectations, and important details before signing so you can make an informed decision.",

    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=85",

    icon: FileCheck2,
  },

  {
    number: "05",
    title: "Flexible Access",
    description:
      "Start online from your phone, tablet, or desktop whenever it is convenient for you.",

    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",

    icon: Laptop,
  },

  {
    number: "06",
    title: "Human Support",
    description:
      "Need help? Talk to a real Title Bros team member who can help answer your questions along the way.",

    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",

    icon: Headphones,
  },
];

export default function TitleBrosFeatures() {
  return (
    <section className="relative overflow-hidden bg-[#f5f7f4] py-20 sm:py-24 lg:py-32">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="
            absolute
            -right-[180px]
            top-[-150px]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#b8cbbd]/20
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            -left-[180px]
            bottom-[-150px]
            h-[450px]
            w-[450px]
            rounded-full
            bg-[#dce5de]/70
            blur-[130px]
          "
        />

      </div>


      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            mb-12
            flex
            flex-col
            gap-8
            sm:mb-16
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          {/* LEFT */}

          <div className="max-w-[850px]">

            {/* Eyebrow */}

            <div className="mb-5 flex items-center gap-3">

              <span className="h-px w-9 bg-[#64806e]" />

              <span
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-[#587061]
                "
              >
                Why Title Bros
              </span>

            </div>


            {/* Heading */}

            <h2
              className="
                text-[clamp(3rem,7vw,7rem)]
                font-semibold
                leading-[0.84]
                tracking-[-0.065em]
                text-[#101512]
              "
            >
              A title-loan brand
              <br />

              that feels{" "}
              <span className="text-[#087a4a]">
                human.
              </span>
            </h2>

          </div>


          {/* RIGHT */}

          <div className="max-w-[330px] lg:pb-2">

            <p
              className="
                text-sm
                leading-6
                text-[#737b76]
                sm:text-[13px]
              "
            >
              Modern digital experience on the front.
              Local people and clear communication behind it.
            </p>

          </div>

        </div>


        {/* =====================================================
            FEATURE GRID
        ====================================================== */}

        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >

          {features.map((feature) => (
            <FeatureCard
              key={feature.number}
              feature={feature}
            />
          ))}

        </div>

      </div>
    </section>
  );
}


/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({ feature }) {

  const Icon = feature.icon;

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[15px]
        border
        border-[#dce2dd]
        bg-white
        shadow-[0_8px_35px_rgba(20,35,26,0.035)]
        transition-all
        duration-500
        hover:-translate-y-1
        hover:border-[#c3d0c7]
        hover:shadow-[0_20px_50px_rgba(20,35,26,0.08)]
        glass rounded-[25px] text-[var(--ink)]
      "
    >

      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div
        className="
          relative
          h-[180px]
          overflow-hidden
          sm:h-[190px]
        "
      >

        <Image
          src={feature.image}
          alt={feature.title}
          fill
          unoptimized
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            33vw
          "
          className="
            object-cover
            transition-transform
            duration-700
            ease-out
            group-hover:scale-[1.06]
          "
        />


        {/* IMAGE OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/50
            via-black/5
            to-transparent
          "
        />


        {/* ==================================================
            NUMBER
        =================================================== */}

        <div
          className="
            absolute
            left-4
            top-4
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-[#e8f3e5]
            text-[9px]
            font-bold
            text-[#176b43]
            shadow-sm
          "
        >
          {feature.number}
        </div>


        {/* ==================================================
            ICON
        =================================================== */}

        <div
          className="
            absolute
            bottom-4
            right-4
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/20
            bg-[#101713]/85
            text-[#c1d1c5]
            opacity-0
            backdrop-blur-md
            transition-all
            duration-500
            group-hover:opacity-100
          "
        >
          <Icon
            size={18}
            strokeWidth={1.7}
          />
        </div>

      </div>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          flex
          min-h-[205px]
          flex-col
          px-5
          pb-6
          pt-6
          sm:px-6
        "
      >

        {/* small green indicator */}

        <div
          className="
            absolute
            right-6
            top-7
            h-1.5
            w-1.5
            rounded-full
            bg-[#278154]
          "
        />


        {/* TITLE */}

        <h3
          className="
            pr-5
            text-[19px]
            font-semibold
            tracking-[-0.025em]
            text-[#121814]
            transition-colors
            duration-300
            group-hover:text-[#176b43]
          "
        >
          {feature.title}
        </h3>


        {/* DESCRIPTION */}

        <p
          className="
            mt-3
            max-w-[350px]
            text-[11px]
            leading-[1.75]
            text-[#777f7a]
            sm:text-[12px]
          "
        >
          {feature.description}
        </p>


        {/* BOTTOM */}

        <div className="mt-auto pt-5">

          <div className="h-px w-full bg-[#edf0ed]" />

          <div className="mt-4 flex items-center justify-between">

            <span
              className="
                text-[8px]
                font-medium
                uppercase
                tracking-[0.22em]
                text-[#8a938d]
              "
            >
              Title Bros
            </span>

            <Icon
              size={15}
              strokeWidth={1.5}
              className="
                text-[#8a9c90]
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:text-[#176b43]
              "
            />

          </div>

        </div>

      </div>

    </article>
  );
}