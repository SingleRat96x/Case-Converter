OG/Twitter Images Guide

Goal
- Provide consistent social share images for all pages with descriptive alt text.

Defaults
- If a page has no specific image, we use `/images/og-default.jpg` at 1200x630.
- Alt text should summarize the tool in 5–12 words.

What to create
- A branded default: `/public/images/og-default.jpg` (1200x630).
- Optional per-page images: `/public/images/og-<slug>.jpg` (same size).

Design tips
- High contrast title, concise subtitle, brand mark.
- Safe area margins (~80px) to avoid cropping.
- Keep file size < 200 KB when possible (JPEG, 80–85% quality).

Placement
- Put files in `public/images/`.

Mapping examples
- random-number → `/images/og-random-number.jpg` (alt: "Random Number Generator — secure RNG")
- password-generator → `/images/og-password-generator.jpg` (alt: "Strong password generator — custom rules")
- random-ip → `/images/og-random-ip.jpg` (alt: "Random IP addresses — IPv4 and IPv6")

How it is used
- The metadata generator will use the per-page image if present, otherwise fallback to `/images/og-default.jpg`.
- Twitter Card is `summary_large_image`.

QA checklist
- 1200x630 px
- < 200 KB
- Filename matches slug
- Alt text present (EN+RU if possible)

