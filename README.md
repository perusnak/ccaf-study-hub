# 🎓 CCA-F Study Hub

> A free, open, **local-first** study website for the **Claude Certified Architect — Foundations
> (CCA-F)** exam. All the theory in one place, plus exam-style practice questions, a timed exam
> simulation, and flashcards — running entirely in your browser. No account, no server, no tracking.

> [!IMPORTANT]
> **Unofficial study aid.** This project is **not affiliated with, endorsed by, or sponsored by
> Anthropic**. “Claude” and “Anthropic” are trademarks of Anthropic, PBC. The practice questions are
> community-sourced study approximations — **not** real exam content. Always verify exam details
> against official Anthropic sources.

---

## What is this?

If you're preparing for the **Claude Certified Architect — Foundations** certification, this is a
single place to **learn and self-test**. It turns a long study guide into a browsable site where you
can read the theory, drill practice questions, simulate the exam, and review with flashcards — while
it quietly tracks your progress in your browser.

**Who it's for:** solution architects and developers (≈6+ months building with the Claude API, Agent
SDK, Claude Code, and MCP) who want focused, structured exam prep.

### The exam at a glance

| | |
|---|---|
| **Format** | Multiple choice (1 correct of 4) |
| **Scoring** | 100–1000 scale · **passing score 720** |
| **Guessing penalty** | None — answer every question |
| **Scenarios** | 4 of 8 possible (randomly selected) |
| **Level** | 300 (scenario-based) |

**Five domains:** Agent architecture & orchestration (27%) · Tool design & MCP integration (18%) ·
Claude Code configuration & workflows (20%) · Prompt engineering & structured output (20%) ·
Context management & reliability (15%).

---

## What's inside

The site has six sections (tabs):

| Tab | What it's for |
|---|---|
| 🏠 **Overview** | Exam facts, the five domains with weights, all eight scenarios, and your progress at a glance. |
| 📖 **Theory** | The full study guide — 13 theory chapters + per-domain notes — with a sticky table of contents and a live filter to jump anywhere fast. |
| 📝 **Practice** | 88 exam-style questions filterable by domain or scenario, with **instant feedback** and the full explanation for every answer. Flag tricky ones to revisit. |
| ⏱️ **Exam simulation** | A **timed**, exam-like run (the “4 of 8 scenarios” format). Submit to get a 100–1000 score against the 720 passing line, a per-domain breakdown, and a review of everything you missed. |
| 🃏 **Flashcards** | Quick-recall cards for the high-yield facts. Flip, shuffle, and mark each “Known” or “Review”. |
| 🔗 **Resources** | A curated hub of official Anthropic docs/courses and reputable community study guides. |

Your progress (answered questions, flags, flashcard status, exam scores) is saved **only in your
browser** via `localStorage`.

---

## Quick start

It's a static site — **no build step, no dependencies.**

```bash
# Option A — just open it
open index.html          # macOS (or double-click the file)

# Option B — serve locally (recommended; mirrors GitHub Pages)
python3 -m http.server
# then open http://localhost:8000
```

### Host it on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages →** Source: *Deploy from a branch*, branch: your default branch, folder: `/ (root)`.
3. Open the published URL. No configuration needed.

---

## A suggested study flow

1. **Overview** — get oriented on format, domains, and scenarios.
2. **Theory** — read it through once; use the filter to revisit weak spots.
3. **Practice** — drill domain by domain; read every explanation, flag what's shaky.
4. **Flashcards** — reinforce the high-yield facts between sessions.
5. **Exam simulation** — when you're consistently above ~75% in practice, take a timed mock and
   review the per-domain breakdown.

---

## Editing or regenerating content

All content is generated from [`input/guide_en.MD`](input/guide_en.MD). **Do not hand-edit the
files in `data/`** — they're generated. After editing the source guide, regenerate:

```bash
node build/parse-guide.js
```

The parser is plain Node with **zero dependencies**. See [`CLAUDE.md`](CLAUDE.md) for the
architecture and the markdown conventions it expects.

### Project structure

```
index.html            SPA shell (hash-routed views)
assets/css/style.css  styling (Anthropic brand tokens: colours + Poppins/Lora)
assets/js/            store, router, and one module per view
build/parse-guide.js  one-time content generator (Node, zero deps)
data/*.js             GENERATED content (window.CCAF_* globals — do not hand-edit)
input/guide_en.MD     source of truth for all content
```

---

## Attribution

Theory and practice questions are derived from a community-authored study guide based on the
publicly published official exam guide. Credit for the question bank and explanations goes to the
upstream community project:
**[paullarionov/claude-certified-architect](https://github.com/paullarionov/claude-certified-architect)**.
Other community guides are linked from the in-app **Resources** page.

If you are a rights holder and would like content adjusted or removed, please
[open an issue](../../issues).

## License

The **site code** is released under the [MIT License](LICENSE). Study **content** is attributed to
its upstream authors (see above) and is included for educational use; it is **not** covered by the
MIT license grant. This is an independent, unofficial project and is not affiliated with Anthropic.
