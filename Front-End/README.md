# Title Bros Loans — Premium Next.js Frontend

A modern light-theme car title loan website starter built for the Title Bros project.

## Stack

- Next.js + React
- JavaScript only — no TypeScript
- Tailwind CSS v4
- Normal CSS in `src/app/globals.css`
- GSAP + ScrollTrigger
- Lenis smooth scrolling
- Three.js + React Three Fiber + Drei
- Lucide icons

## Folder structure

```text
title-bros-loans/
├─ public/
│  ├─ logo.jpg
│  └─ models/
│     └─ car.glb
├─ src/
│  ├─ app/
│  │  ├─ [slug]/page.js
│  │  ├─ apply/page.js
│  │  ├─ calculator/page.js
│  │  ├─ globals.css
│  │  ├─ layout.js
│  │  └─ page.js
│  ├─ components/
│  └─ data/
├─ jsconfig.json
├─ next.config.mjs
├─ package.json
└─ postcss.config.mjs
```

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 3D hero

The hero loads:

```text
public/models/car.glb
```

The included `car.glb` is a lightweight placeholder/demo car so the project can run immediately. Replace it with the client's production car model using the same filename:

```text
public/models/car.glb
```

The hero is intentionally built as a tall scroll scene:

1. User sees the car behind the hero copy.
2. Lenis provides smooth page scrolling.
3. Scroll progress drives the 3D car position, scale and rotation.
4. The car visually exits/reduces while the `$` 3D typography moves into place.
5. The hero then hands off to the stats/process sections.

For a true geometry morph from car vertices into a dollar symbol, the production GLB should be prepared with matching vertex/topology data or a custom shader/morph-target setup. This starter uses a polished transform/fade approach that is more reliable with arbitrary client GLBs.

## Important production replacements

The SOW calls for a bilingual public site, custom backend MVP, Sanity CMS, CRM, Supabase/PostgreSQL, authentication, customer portal, analytics, schema, legal pages, etc. This ZIP focuses on the premium animated frontend requested in this message.

Before launch, replace placeholders for:

- Verified Nevada license number
- Business address
- Phone and WhatsApp number
- Business hours
- Final loan range and calculator rules
- Client-approved eligibility language
- Attorney-reviewed Privacy Policy and Terms
- Final testimonials and permissions
- Real Google Maps embed
- Real CRM/API submission
- Spanish translations
- Analytics IDs
- Production car GLB

## Pages included

- `/`
- `/how-it-works`
- `/apply`
- `/calculator`
- `/requirements`
- `/why-us`
- `/faq`
- `/testimonials`
- `/blog`
- `/contact`
- `/privacy-policy`
- `/terms`

## SOW alignment

The supplied Scope of Work identifies React/Next.js, Tailwind CSS, a 10–12 page bilingual public site, a sticky Apply Now CTA, a multi-step application form, an interactive loan estimator, mobile-first design, CMS, analytics, SEO/schema, and custom backend functionality. The public-facing page structure in this starter follows that direction.

The supplied SOW also states that legal pages require attorney review before launch and that client-specific business/license/contact details must be provided before production.
