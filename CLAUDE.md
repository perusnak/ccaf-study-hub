# CCA-F Study Hub — project instructions

A static, dependency-free study website for the **Claude Certified Architect — Foundations (CCA-F)**
exam. Pure HTML/CSS/vanilla JS. No build step at runtime, no framework. Opens by double-clicking
`index.html` and deploys to GitHub Pages as-is.

## Architecture

- **Single-page app** in `index.html` with hash routing (`#/overview`, `#/theory`, `#/quiz`,
  `#/flashcards`, `#/about`). Each view is a global object with a `.render(container)` method.
- **Content is pre-generated**, never parsed in the browser. `build/parse-guide.js` (Node, zero
  deps) reads `input/guide_en.MD` and writes `data/*.js` as `window.CCAF_*` globals:
  - `data/meta.js` → `CCAF_META` (exam facts, domains, scenarios, official links, disclaimer)
  - `data/theory.js` → `CCAF_THEORY` (`[{id, part, title, html}]`)
  - `data/questions.js` → `CCAF_QUESTIONS` (`[{id, num, scenario, domain, set, situation, prompt, options[], correctIndex, explanation}]`)
  - `data/flashcards.js` → `CCAF_FLASHCARDS` (`[{category, front, back}]`)
- Data is shipped as JS globals (not JSON fetched at runtime) **on purpose** — so the site works
  over `file://` without CORS issues.
- **State** (answered questions, flags, flashcard status, exam scores) lives in `localStorage`
  under key `ccaf.v1`, via `assets/js/store.js`.

## File map

```
index.html                 SPA shell + data/script includes (order matters: data → views → router)
assets/css/style.css        all styling; brand tokens are CSS custom properties in :root
assets/js/store.js          localStorage (window.Store) + DOM helpers (window.UI.el / .shuffle)
assets/js/overview.js       window.Overview + window.About
assets/js/theory.js         window.Theory (sticky TOC, live filter, scroll-spy)
assets/js/quiz.js           window.Quiz (practice + exam simulation, scoring)
assets/js/flashcards.js     window.Flashcards (flip cards, known/review)
assets/js/router.js         hash router; loads LAST so all view globals exist
build/parse-guide.js        one-time content generator (Node)
data/*.js                   GENERATED — do not hand-edit
input/guide_en.MD           source of truth for all content
```

## Editing content

**Never hand-edit `data/*.js`.** To change content, edit `input/guide_en.MD` and regenerate:

```bash
node build/parse-guide.js
```

The parser relies on the guide's markdown conventions:
- Questions: `## Question N (Scenario: NAME)`, a `**Situation:**` line, a bold `**…?**` prompt,
  options `- A) … **[CORRECT]**`, and a `**Why X:**` explanation. The `[CORRECT]` marker sets
  `correctIndex` and is stripped from display text.
- Theory: `# Chapter N:` and `# Domain N:` headings become sections; a safe markdown subset
  (headings, lists, tables, fenced code, bold/inline-code/links) is converted to HTML.
- Question domains are **classified from the question text** (`classifyDomain` + `DOMAIN_SIGNALS`
  keyword tables in `parse-guide.js`), with each scenario's `SCENARIO_DOMAIN` entry used only as a
  tie-breaker. This keeps per-domain coverage honest instead of collapsing every question in a
  scenario to one domain. Tune the keyword signals there if a domain looks over/under-represented.
- Question scenario names are reconciled (case-insensitively) to the canonical `meta.scenarios`
  names after parsing, so the scenario filter never silently shows 0 due to casing drift.
- Curated flashcards and the **Resources hub** (`meta.resources`, grouped external links) are
  hand-authored tables inside `parse-guide.js` — edit them there, not in the generated `data/*.js`.

If the parser warns about questions without a `[CORRECT]` marker, fix the source guide.

## Design

Follows Anthropic brand guidelines. Tokens in `:root` in `style.css`:
- Colours: dark `#141413`, light `#faf9f5`, mid `#b0aea5`, light-gray `#e8e6dc`;
  accents orange `#d97757`, blue `#6a9bcc`, green `#788c5d`.
- Fonts: Poppins (headings), Lora (body), with Arial/Georgia fallbacks (Google Fonts, degrades
  gracefully offline).
- Keep option order fixed (A–D); explanations reference answer letters, so options must NOT be
  shuffled. Question/card order may be shuffled.

## Conventions

- Vanilla ES5-ish JS (no build, no transpile). Use `window.UI.el(tag, attrs, children)` to build DOM.
- No external runtime dependencies. Google Fonts is the only network resource and is optional.
- Keep everything English, 1:1 with the source guide. Do not reword questions or answers.

## Run / preview

- Double-click `index.html`, or `python3 -m http.server` then open `http://localhost:8000`.
- GitHub Pages: serve the repo root; no configuration needed.

## Legal

This is an **unofficial** community study aid, not affiliated with Anthropic. Keep the disclaimer
visible (footer + About page + README). Practice questions are study approximations, not real exam
content. Attribute the upstream community guide.
