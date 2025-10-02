TASK: Rewrite & Redesign Legal + About + Contact Pages (EN/RU, SEO-ready, no inline CSS)

You are updating the following pages to be substantive, compliant, and well-designed (the current versions are generic and thin). Improve content depth and UI/UX. No inline styles, no hardcoded text/strings in components, full i18n (English + Russian), and complete page-level metadata.

Pages to update:

/privacy – Privacy Policy

/terms – Terms of Service

/about – About Us

/contact – Contact Us (with functional form)

Tech assumptions:

Next.js App Router (TypeScript)

Tailwind CSS (or design tokens) + shadcn/ui components

i18n with JSON resources (en, ru)

metadata export per route; Open Graph + Twitter cards

Reusable PageHeader, SectionCard, TOC, LastUpdated components

1) Content Requirements (substantive, not boilerplate)
Privacy Policy (GDPR/CCPA-aware, product-accurate)

Provide clear, specific sections. Avoid vague one-liners.

Introduction & Scope: who we are; what the policy covers; definitions.

Data We Process:

What you input into tools (client-side processing where applicable).

Usage/analytics data (types: pages viewed, approximate location, device/UA; aggregation).

Cookies & local storage: language prefs, analytics; retention windows.

No account / no email collection if true; otherwise specify fields collected.

Legal Bases (GDPR): legitimate interests, consent (cookies), performance of contract (if any).

How We Use Data: analytics, fraud/abuse prevention, product improvement.

Data Sharing: sub-processors (analytics/hosting/CDN). Name vendors and link their policies; describe what is shared (IP, UA, page events).

International Transfers: mechanisms (SCCs or vendor statements).

Retention: concrete windows (e.g., 14/30/180 days) and criteria.

Security: controls (TLS, least privilege, access logging).

Your Rights: access, rectification, erasure, restrict, portability, object; how to submit a request; response SLA.

Opt-Outs: analytics opt-out and cookie controls.

Children: service not aimed under 13/16 (choose one based on jurisdiction).

Contact: privacy email and postal address (placeholder constants).

Changes to this Policy: how we notify; effective date; versioning.

Cookie Table: name, purpose, duration, type (first/third-party).

Plain-English Summary (at top) + linkable headings.

Important: Words must match product reality (client-side processing, no accounts, etc.). Do not invent features; state “not collected” explicitly when applicable.

Terms of Service

Provide practical, reader-friendly terms.

Acceptance of Terms

Service Description (tools are provided “as-is”; mostly client-side)

Acceptable Use: lawful use, no scraping at abusive rates, no malware, no infringing content, no attempts to break rate limits/circumvent security.

User Content & License: clarify ownership; limited license for operation (if any). For pure client-side tools, state that inputs are processed locally and not stored server-side (if true).

Intellectual Property: trademarks, branding, site content.

Availability & Modifications: we may change/suspend features.

Disclaimers: no warranties; “as-is/as-available”.

Limitation of Liability: reasonable cap (e.g., amount paid or $100); exclude consequential damages to the extent permitted by law.

Indemnification: user indemnifies for misuse or IP violation.

Governing Law & Venue

DMCA/Notice Procedure (if applicable)

Age Requirements

Changes to Terms (effective date / version)

Contact

About Us

Replace vague blurbs with concrete, scannable content:

Mission & Value Proposition (speed, privacy-by-design, accessibility)

How Tools Work (client-side vs server-side; what leaves the browser)

Technology & Reliability (uptime, hosting, monitoring)

Accessibility Commitments (keyboard nav, contrast, ARIA)

Roadmap Highlights (bulleted; realistic)

Contact & Partnerships

Contact Us

Reasons to Contact (feedback, bug reports, partnerships)

Contact Form with:

Fields: name, email, category, message

Validation (client + server) and rate-limiting

Spam prevention (honeypot + time-trap; optional hCaptcha key support)

Success/error states and copy tied to i18n keys

Direct Email and Response Window

Privacy Notice inline (“By submitting, you agree… link to Privacy Policy”)

2) UX / UI Requirements

No inline CSS. Use Tailwind classes or existing design tokens (e.g., --radius, --foreground, etc.).

Use consistent layout with a sticky on-page TOC (desktop) and top “Jump to section” menu (mobile).

Section cards with concise summaries and “learn more” accordions for details.

Readable line length, adequate spacing, and clear hierarchy (H1 page title, H2 sections, H3 subsections).

Last updated badge with ISO date; version string.

Linkable headings (hash links).

Accessible: focus outlines, roles/ARIA, keyboard navigable accordions, WCAG AA contrast.

Dark mode matches site theme.

Print-friendly styles (page breaks between main sections).

Breadcrumbs and canonical link present.

Responsive at sm/md/lg/xl with tested breakpoints.

No hardcoded text: all copy pulled from i18n resources.

3) i18n (EN/RU) & Content Storage

Create locales/en/legal.json and locales/ru/legal.json for all strings, including page titles, meta titles, descriptions, button labels, table column headers, cookie table rows, error/success copy.

Do not inline long paragraphs in components; load from i18n JSON (multi-line supported) or MDX per locale if you prefer; but still referenced via i18n keys.

Provide hreflang links and language switch that preserves route (/en/privacy, /ru/privacy or query-based depending on app).

When content differs materially per locale (e.g., governing law), keep locale-specific sections in each JSON.

4) SEO & Metadata (per page, per locale)

export const metadata with:

title (≤ 60 chars), description (140–160 chars), alternates.canonical, alternates.languages (hreflang),

openGraph (title, description, url, siteName, type, images),

twitter (card: summary_large_image).

Add JSON-LD:

Organization (name, url, logo, sameAs) on About page

WebSite + SearchAction (if a site search exists)

ContactPoint on Contact page (@type: CustomerSupport; availableLanguage: ["en","ru"])

PrivacyPolicy/TermsOfService can be represented as CreativeWork with about and inLanguage.

Add pages to the sitemap; ensure canonical matches production domain.

5) Contact Form Implementation

Route: /contact page with a POST API route (App Router)

Server validation via Zod; friendly error messages via i18n keys

Rate limit by IP (e.g., 5/hour) and add anti-automation honeypot field

Optional hCaptcha env keys; if absent, skip gracefully

Store submissions optionally (config flag) or just email via SMTP/API (Resend/Brevo).

Render success state without page reload; announce via aria-live="polite".

6) Components to Build/Refactor

components/PageHeader.tsx – title, subtitle, breadcrumbs, last-updated

components/TOC.tsx – builds from heading map; highlights active section

components/SectionCard.tsx – header, summary, children; optional accordion

components/KeyValueTable.tsx – for cookie table (name, purpose, duration, type)

components/Callout.tsx – info/warning blocks

components/LocaleSwitcher.tsx – preserves route, sets hreflang

components/LegalLayout.tsx – shared layout for privacy/terms with TOC aside

7) Content Placeholders & Constants

Create a single config/site-legal.ts with:

companyName, domain, contactEmail, privacyEmail, postalAddress, governingLaw

vendors array with { name, purpose, dataShared, policyUrl } for analytics/CDN/hosting
Use these constants inside i18n interpolation (no hardcoded strings).

8) Acceptance Criteria (must pass)

No inline styles; no hardcoded user-facing text in TSX.

All strings appear in both en and ru resource files.

Each page exports complete metadata, OG/Twitter, hreflang/canonical.

Privacy and Terms contain every section listed above with product-accurate statements.

Cookie table present with durations and purposes.

About page contains concrete technology/accessibility statements and roadmap bullets.

Contact form validates, rate-limits, and shows localized success/error states.

Pages score ≥ 95 for Accessibility and Best Practices in Lighthouse (desktop).

Typography and spacing consistent with design tokens; dark mode verified.

Heading IDs are linkable; TOC scroll-sync works; print stylesheet works.

RU translations are human-readable (no machine artifacts).

Unit tests (or basic VT) for i18n keys existence (EN/RU) to prevent missing strings.

9) Deliverables

Updated routes: /privacy, /terms, /about, /contact with new content and metadata.

locales/en/legal.json, locales/ru/legal.json populated.

config/site-legal.ts with placeholders marked TODO: fill.

New/updated components listed above.

JSON-LD blocks in each page.

Simple README note describing how to update legal constants and translations.

10) Notes from Current Screenshots (problems to fix)

Content is too thin (single-sentence sections like “Usage Data”, “No Accounts”, “Client-Side Processing”). Expand per the structure above.

UI shows bland cards with minimal copy; add TOC, headings, accordions, cookie table, and “Last updated” elements.

Ensure AdSense debug widgets or admin badges don’t overlap content; respect safe area and z-index.

Verify language switcher exists for these pages and that metadata is localized.