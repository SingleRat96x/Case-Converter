# Code Data Locale Restoration Roadmap

## Overview
- **Problem**: `src/locales/tools/code-data.json` has widespread mojibake (`????`) in the Russian (`ru`) locale and a few non-ASCII samples in English (`en`). Root cause appears to be saving the file with an ASCII/ANSI encoding.
- **Reference**: `docs/code-data-backup.json` contains correct historical strings but predates recent feature keys and the new German (`de`) locale.
- **Scope**: Restore accurate Russian translations for impacted tools, reintroduce any missing non-Latin English samples, and keep the German additions intact.

## Phase 1 – Audit & Prep
- **Task 1.1: Confirm impact breadth**
  - Compare `src/locales/tools/code-data.json` (current) with `docs/code-data-backup.json`.
  - Enumerate corrupted sections (currently: base64, binary, hex, morse, caesar, rot13, csvJson, jsonStringify, url, utf8, slugify) and unaffected sections (e.g., jsonFormatter).
  - Document any new keys present in EN/DE that are absent from the backup to avoid regression.
- **Task 1.2: Set up working baseline**
  - Create a dedicated branch for restoration.
  - Copy `docs/code-data-backup.json` into a scratch location for quick diffing.
  - Plan merge strategy (manual or script-assisted) to selectively replace `ru` values while leaving EN/DE intact.

## Phase 2 – Restore Core Encoding Tools (Highest Traffic)
- **Task 2.1: Base64 Encoder/Decoder**
  - Subtask: Replace corrupted `ru.base64` block using backup values.
  - Subtask: Retranslate any keys added after the backup (e.g., new analytics fields) to keep parity with EN/DE.
  - Subtask: Verify `en.url.examples.unicode` and other non-ASCII examples regain intended characters.
- **Task 2.2: Binary Code Translator**
  - Subtask: Restore labels/placeholders/options/errors from backup.
  - Subtask: Confirm `analytics` object matches EN key set.
  - Subtask: Spot-check UI to ensure Cyrillic displays correctly.
- **Task 2.3: Hex to Text Converter**
  - Subtask: Reapply `ru.hex` strings from backup.
  - Subtask: Confirm metric keys (`stats`, `info`) align with EN.
  - Subtask: Manually test `/ru/tools/hex-to-text` post-restore.
- **Task 2.4: Morse Code Translator**
  - Subtask: Restore `ru.morse` strings.
  - Subtask: Translate any new keys (e.g., analytics expansions) that were added after the backup.
  - Subtask: QA the audio controls in RU after restoration.

## Phase 3 – Restore Cipher & Text Utilities
- **Task 3.1: Caesar Cipher Encoder**
  - Subtask: Replace `ru.caesar` text blocks.
  - Subtask: Ensure new helper hints (e.g., `frequencyHint`) reflect updated Russian phrasing.
  - Subtask: Verify parity between EN/DE/RU key sets.
- **Task 3.2: ROT13 Encoder & Decoder**
  - Subtask: Restore `ru.rot13` strings from backup.
  - Subtask: Translate/verify any post-backup additions (actions, analytics).
  - Subtask: Smoke-test `/ru/tools/rot13`.
- **Task 3.3: Slugify URL Generator**
  - Subtask: Reapply `ru.slugify` values.
  - Subtask: Confirm nested options (`separators`, `analytics`) retain Russian terminology.
  - Subtask: Check that new DE strings remain untouched.

## Phase 4 – Restore Data Transformation & Encoding Utilities
- **Task 4.1: CSV ⇄ JSON Converter**
  - Subtask: Restore `ru.csvJson` translations.
  - Subtask: Translate any missing keys introduced after backup (e.g., analytics metrics).
  - Subtask: Validate conversion messages render properly in RU.
- **Task 4.2: JSON Stringify Tool**
  - Subtask: Replace `ru.jsonStringify` text blocks.
  - Subtask: Ensure options/actions/errors lists stay synchronized with EN.
  - Subtask: QA RU interface for newly added controls.
- **Task 4.3: URL Encoder/Decoder & UTF-8 Encoder/Decoder**
  - Subtask: Restore `ru.url` and `ru.utf8` entries.
  - Subtask: Reintroduce non-ASCII EN samples (`unicode`, `chinese`, `arabic`) exactly as in backup.
  - Subtask: Confirm metrics (`stats`, `analytics`) display correct Russian nouns.

## Phase 5 – Verification & QA
- **Task 5.1: Automated parity checks**
  - Subtask: Write a quick script/diff to assert every key in `en` exists in `ru` and `de`.
  - Subtask: Run ESLint/TypeScript build to ensure JSON changes don’t break imports.
- **Task 5.2: Manual locale spot-checks**
  - Subtask: Visit each affected `/ru/tools/...` page to validate rendered text.
  - Subtask: Confirm `/de/...` pages remain unchanged.
  - Subtask: Verify `/en/...` samples with non-Latin characters render correctly.
- **Task 5.3: Documentation & handoff**
  - Subtask: Update this roadmap status once each task completes.
  - Subtask: Note any remaining translation gaps or newly introduced keys requiring professional translation review.
  - Subtask: Prepare summary for inclusion in the main German translation roadmap (if needed).
