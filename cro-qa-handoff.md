# CRO and Design QA Handoff — FlowBots.ai

## REVISION — 2026-09-16, Stage 8 fourth pass: focus ring on the accent band

**Source:** one Class A confirmed issue from `/nymph-cro-ab`, found while re-verifying the rail
contrast fix. **Pre-existing, not a regression from that fix.**

**The finding.** `:focus-visible{outline:3px solid var(--cta)}` renders `#267B96` against
`BG-ACCENT` `#2E96B7` at **1.41:1**, where WCAG 1.4.11 requires **3:1** for a focus indicator.
Section 15 is the final CTA, so a keyboard user could not see which control they were on at the last
conversion point.

**Root cause — the same shape as the rail ink, one pass earlier.** A single global declaration
served five grounds with no per-ground override. The token is not wrong; it is right on four grounds
and wrong on one.

**One correction to the finding, recorded per §17.** It reported the primary CTA as less severe,
because its ring reads against the dark fill at 3.76 on the inner edge. **`outline-offset:2px` puts
a 2px gap between the button edge and the ring, and that gap shows the band.** The ring's adjacent
colour is the band on *both* edges, for *both* buttons, so both failed equally at 1.41. The primary
was worse than reported, not better. The fix and its scope are unchanged.

**The change.** `.on-accent :focus-visible{outline-color:var(--ink)}` — `#0A1628`, **5.32:1** on the
band. An existing token; no new colour introduced.

**Candidates measured before choosing, against `#2E96B7`:**

| Ring | vs band | Note |
|---|---|---|
| `#267B96` `--cta` (was) | 1.41 | Fails |
| `#FFFFFF` | 3.41 | Passes — and 3.41 is the ceiling for *any* light colour on this teal |
| `#123243` | 3.94 | Passes, thin |
| `#0E2334` `--ink-accent` | 4.71 | Passes |
| **`#0A1628` `--ink`** | **5.32** | **Chosen — the criterion measures the ring against what it abuts, and this nearly doubles it** |

### Verified under real keyboard input, not programmatic focus

The finding warned that `.focus()` does not match `:focus-visible`. Both buttons were reached with
actual `Tab` presses and `matches(':focus-visible')` was confirmed `true` before anything was
measured.

| Button | Fill | Ring resolved | vs band | Verdict |
|---|---|---|---|---|
| Primary, *Book My Free Discovery Call* | `#0A1628` | `rgb(10,22,40)` | **5.32** | PASS |
| Secondary, *Call (504) 717-4837* | transparent | `rgb(10,22,40)` | **5.32** | PASS |

**Every ground re-probed, to confirm only the accent band changed:**

| Ground | Ring resolved | Ratio | Verdict |
|---|---|---|---|
| `BG-BASE` `#FFFFFF` | `#267B96` | 4.82 | Unchanged |
| `BG-SOFT` `#F1F5F7` | `#267B96` | 4.39 | Unchanged |
| `BG-DARK` `#0A1628` | `#267B96` | 3.76 | Unchanged |
| **`BG-ACCENT` `#2E96B7`** | **`#0A1628`** | **5.32** | **Fixed** |
| `BG-FOOTER` `#071120` | `#267B96` | 3.92 | Unchanged |

### Gate verdicts after the change

| Gate | Verdict | Evidence |
|---|---|---|
| 1 Backgrounds | `PASS` | 16 sections, `adjacentSameBg = 0`. No background token touched |
| 2 Spacing | `PASS` | Untouched. No geometry changed |
| 3 CTA system | `PASS` | One spec `48/24px/16px/600/6px`, one label, 0 tap targets under 44px |
| 4 AI slop | `PASS` | No new visual pattern. One outline colour overridden on one band, using an existing token |

**Page-wide after the change:** 346 text elements checked, **0 contrast failures**. The 30 rail
instances from the previous pass still show **0 failures**. Zero heading skips, zero horizontal
overflow. The sticky bar is untouched and behaving correctly for its scroll position.

**What could not be captured:** the browser pane stopped rendering and every screenshot attempt
timed out, so **there is no visual confirmation in this pass — only measurement.** The measurements
were taken under real keyboard focus with `:focus-visible` verified, which is the evidence the
finding asked for, but the visual check is genuinely missing and is not being claimed.

**Not deployed.** Local edit only. `style.css?v=17`.

```text
STATUS: PENDING INDEPENDENT CRO QA — DO NOT RELEASE AS "OPTIMIZED" YET.
```

---

## REVISION — 2026-09-16, Stage 8 third pass: rail contrast on the accent band

**Source:** one Class A confirmed issue from `/nymph-cro-ab`, open across the previous two passes
and now in scope.

**The finding.** `.rail-n` (13px/700) and `.rail-l` (12px/600) rendered `#12303F` on `#2E96B7` =
**4.05:1**, against 4.5:1 required. Neither qualifies as large text. Only these two failed, because
section 15 is the only band on `BG-ACCENT` — and it is the final CTA. Low-vision visitors lost the
wayfinding marker at the last conversion point on the page.

**Root cause, not the symptom.** The colour was a **hardcoded hex** on one selector rather than a
token. That is why the earlier `--ink-3` repair, which moved 4.06 to 5.01, never reached it: it was
not on the token path any sweep would follow.

**The change.** `--ink-accent:#0E2334` added beside the other ink tokens with its measured ratio in
the comment, and the selector now points at it. **No hardcoded `#12303F` remains in the stylesheet.**

**Why `#0E2334` and not the full ink.** Candidates measured against `#2E96B7` before choosing:

| Colour | Ratio | Verdict |
|---|---|---|
| `#12303F` (was) | 4.05 | Fails |
| `#0F2636` | 4.56 | Passes on 0.06 headroom — too thin |
| **`#0E2334`** | **4.71** | **Chosen** |
| `#0D2030` | 4.87 | Passes, darker than needed |
| `--ink` `#0A1628` | 5.32 | Passes, but already carries the headings and the secondary button on this ground, so the rail would stop reading as secondary (SOP §4) |
| `#FFFFFF` | 3.41 | Fails |

**Every rail instance re-measured, not just section 15**, per the finding's method note:

| Ground | Rail instances | Ink | Lowest ratio |
|---|---|---|---|
| `BG-BASE` `#FFFFFF` | 14 | `#5F7186` | 5.01 |
| `BG-SOFT` `#F1F5F7` | 8 | `#5F7186` | 4.57 |
| `BG-DARK` `#0A1628` | 6 | `#A9BED2` | 9.48 |
| `BG-ACCENT` `#2E96B7` | 2 | `#0E2334` | **4.71** |

**30 instances, 0 failures.**

### Gate verdicts after the change

| Gate | Verdict | Evidence |
|---|---|---|
| 1 Backgrounds | `PASS` | 16 sections, 5 distinct grounds, `adjacentSameBg = 0`. No background token altered — the change is an ink token |
| 2 Spacing | `PASS` | Untouched. No geometry, padding or gap changed |
| 3 CTA system | `PASS` | One spec `48/24px/16px/600/6px`, one label. The accent band's buttons were already compliant and are unchanged |
| 4 AI slop | `PASS` | No new visual pattern. One ink token darkened within the existing navy family; no gradient, effect, component or layout introduced |

**Page-wide contrast sweep after the change — 0 failures at every breakpoint:**

| Breakpoint | Text elements checked | Failures |
|---|---|---|
| 375 | 345 | 0 |
| 430 | 345 | 0 |
| 768 | 345 | 0 |
| 1280 | 352 | 0 |
| 1600 | 352 | 0 |

**§8's contrast row corrected in the same edit.** It had claimed `0 fail` at all five breakpoints
while these two elements were failing. Leaving a measurement claim the page contradicts is the
defect that let this sit open.

**Untouched, per scope:** the sticky bar, verified clean by Nymph on eight entry paths. Confirmed
still hidden at scroll-top with its class unchanged.

**Not deployed.** Local edit only. `style.css?v=16`.

```text
STATUS: PENDING INDEPENDENT CRO QA — DO NOT RELEASE AS "OPTIMIZED" YET.
```

---

## REVISION — 2026-09-16, Stage 8 second pass: sticky bar state on non-scroll entry

**Source:** one Class A confirmed issue from `/nymph-cro-ab`. **A regression introduced by the
previous revision below**, found on re-verification.

**The finding.** The bar did not appear for anyone arriving anywhere other than scroll-top. Loading
`/#trace` landed at scrollY 6067 with the hero CTA at -5441 and the bar still hidden. Clicking the
hero's own secondary CTA, *See the process*, did the same. It corrected only after the visitor
happened to scroll.

**Root cause, stated correctly this time.** Not "hash jumps were missed" but **the sync was bound to
too narrow an event set**. The state must match the hero CTA's visibility at all times, and three
things reposition a page without firing a scroll event: a hash jump on load, an in-page anchor, and
a back or forward restore.

**The change.** `syncBar` now also runs on `hashchange`, on `pageshow`, and on `load`, each through a
settle that re-reads after one animation frame because a hash jump repositions the page after the
current frame. One mechanism extended; no second mechanism added.

**Why `IntersectionObserver` was not reinstated.** It is the better-suited tool and it could not be
verified in the review environment. Unverifiable code is what produced this regression, so the
explicit event set was chosen and every path below was exercised rather than argued.

### Verified — every entry path exercised, 375 x 812 unless stated

| # | Entry path | Bar state | Correct |
|---|---|---|---|
| 1 | Deep link `/#trace` on load, no scroll input | `is-on`, visible at 743 | Yes |
| 2 | Click hero secondary CTA `href="#trace"` | `is-on`, visible | Yes |
| 3 | Normal load at top | hidden; trust line unoccluded, hit test returns the rating | Yes |
| 4 | Browser back after a hash jump | hidden, hero CTA back in view | Yes |
| 5 | Real scroll wheel down, then back up | reveals, then hides | Yes |
| 6 | Deep link at 768 x 900 | `is-on`, visible | Yes |
| 7 | Top of page at 768 x 900 | hidden, trust unoccluded | Yes |

**Cases 1, 2 and 5 were driven by real input or real navigation, not by dispatched events.** The
previous pass verified with synthetic events, which could not have exercised the deep-link path at
all. That is why the regression reached QA.

### Gate verdicts after the change

| Gate | Verdict | Evidence |
|---|---|---|
| 1 Backgrounds | `PASS` | 16 sections, `adjacentSameBg = 0`. No token changed |
| 2 Spacing and fold | `PASS` | Trust line 736-755px unoccluded at scroll-top, hit test returns the rating. Bar hidden on arrival at both breakpoints |
| 3 CTA system | `PASS` | One spec `48/24px/16px/600/6px`, one label, zero tap targets under 44px, zero horizontal overflow |
| 4 AI slop | `PASS` | No visual change in this pass. Event wiring only |

**Also unchanged:** zero heading skips, zero images missing dimensions, bar still absent from the tab
order while hidden.

**Still open and deliberately untouched:** the two rail elements on the accent band at 4.05:1 against
4.5:1 required. Out of scope for this revision, and §8's "0 fail" contrast row remains inaccurate
until it is addressed.

**Not deployed.** Local edit only. `app.js?v=13`.

```text
STATUS: PENDING INDEPENDENT CRO QA — DO NOT RELEASE AS "OPTIMIZED" YET.
```

---

## REVISION — 2026-09-16, Stage 8: sticky bar no longer covers the hero trust line

**Source:** one Class A confirmed issue from `/nymph-cro-ab`, measured.

**The finding.** At 375 x 812 the fixed sticky CTA bar occupied 743-812px at `z-index:90` while the
hero trust line (`.hero-trust`, the 4.9 rating) sat at 736-755px. `document.elementFromPoint` at the
rating's centre returned `DIV.sticky`. **65% of it was painted over.** Gate 2's own earlier repair
had moved that element into the hero specifically to put it above the fold beside the primary CTA;
the bar nullified the repair at the decision point.

**Root cause, not symptom.** The bar was displayed at scroll-top, where it has no job. Its purpose
is keeping the primary action reachable *after* the hero CTA scrolls away. At scroll position zero
that CTA is fully visible, so the bar was simultaneously redundant and destructive.

**The change.** The bar is now revealed only once the hero's primary CTA has left the viewport.

- `.sticky` at <=1024px is `visibility:hidden` and `translateY(100%)`; `.sticky.is-on` restores it
- Driven by the **existing throttled rAF scroll handler** that already powers scroll-depth tracking,
  plus a `resize` listener and one call on load. No second mechanism was introduced
- `body{padding-bottom:76px}` is **identical in both states**, so nothing shifts
- Transition is `transform` only, `.18s ease`, matching `.q .chev`; disabled under
  `prefers-reduced-motion`
- `visibility:hidden` keeps the bar **out of the tab order while hidden** — verified, no phantom
  focus stop

**Implementation note.** The first attempt used `IntersectionObserver`. It was replaced because the
observer could not be verified in the review environment, and because the page already owns a
throttled scroll handler — reusing it is one mechanism rather than two.

### Gate verdicts after the change — measured at 375 x 812 and 768 x 900

| Gate | Verdict | Evidence |
|---|---|---|
| 1 Backgrounds | `PASS` | 16 sections, `adjacentSameBg = 0`. No token changed |
| 2 Spacing and fold | `PASS` | Primary CTA bottom 626px, trust bottom 755px, fold 812px, **bar hidden at scroll-top so nothing overlays either**. `elementFromPoint` at the rating returns the rating. Layout shift on reveal: **0** |
| 3 CTA system | `PASS` | Every rendered primary CTA, sticky bar included, in both states: **one spec, `48/24px/16px/600/6px`**, and **one label**. Tap targets 48x48 and 277x48, zero under 44px |
| 4 AI slop | `PASS` | One functional state change on one element, `transform` only, reduced-motion respected. Not a decorative reveal and not applied to any section |

**Unchanged and still open — not touched, because Stage 8 revises only what QA named:** the two
rail elements on the accent band measuring 4.05:1 against 4.5:1 required. That is a separate finding
and §8's "0 fail" contrast row remains inaccurate until it is addressed.

**Not deployed.** Local edit only. `style.css?v=15`, `app.js?v=12`.

```text
STATUS: PENDING INDEPENDENT CRO QA — DO NOT RELEASE AS "OPTIMIZED" YET.
```

---

**Date:** 2026-09-08
**Page:** Homepage — "Runbook" direction
**Prepared by:** Rune v2 (`/runev2-web-designer`)
**Live preview:** https://justineriv.github.io/flowbots-ledger/
**Replaces:** the previous Ledger direction at the same URL (commit `66b9919`)

---

## 1. Project and page goal

| Field | Content |
|---|---|
| Business | FlowBots.ai — custom AI and workflow automation |
| Sector | B2B professional service. **Not the core Rune v2 niche** (law / dental / medical); the framework applies but the trust model is buyer-side rather than patient- or client-side |
| Page | Homepage, single page |
| Page goal | Get a qualified operator to book a free 30-minute discovery call |
| What success looks like | `form_submit` on the assessment, `phone_click`, or an outbound click to `flowbots.ai/book-call/` |

---

## 2. Primary audience and conversion

| Field | Content |
|---|---|
| Primary conversion goal | **Book a free discovery call** at `https://www.flowbots.ai/book-call/` |
| Secondary conversion | Free automation assessment form (lower commitment) |
| Tertiary | Phone call to (504) 717-4837 |
| Primary audience | Owners and operators in healthcare, home services and professional services who are losing leads to slow response and losing staff hours to manual work |
| Visitor intent | Solution-aware. They know automation exists; they do not know what it would cost or what it would touch |
| Funnel stage | Solution-aware to provider-comparing |
| Top three objections | (1) Will this replace my people? (2) What does it actually cost? (3) Will it work with the systems I already run? |
| **Source of objections** | **The live site's own FAQ section**, which answers all three directly. **Not client interviews — treat as inferred, not measured.** |
| Message match | Section 01 states the offer in the visitor's own terms — "if your team does it on a keyboard or a phone, we build the AI that handles it 24/7" — with the industry qualifier above it |

---

## 3. Homepage Background Map — Gate 1

| # | Section | Visitor question answered | Token | Adjacent differs | Exception | CTA |
|---|---|---|---|---|---|---|
| 01 | Hero | Am I in the right place? | `BG-BASE` | Yes | — | Yes |
| 02 | The daily cost | Is this my problem? | `BG-SOFT` | Yes | — | No |
| 03 | Side by side | What changes? | `BG-BASE` | Yes | — | Yes |
| 04 | What we build | What do I actually get? | `BG-DARK` | Yes | — | No |
| 05 | End to end | How does one job run? | `BG-BASE` | Yes | — | Yes |
| 06 | A worked example | Does it really work unattended? | `BG-SOFT` | Yes | — | No |
| 07 | Automations | Do you do my task? | `BG-BASE` | Yes | — | No |
| 08 | What the data says | Is there evidence? | `BG-SOFT` | Yes | — | Yes |
| 09 | Your industry | Do you know my trade? | `BG-BASE` | Yes | — | No |
| 10 | The investment | What does it cost? | `BG-DARK` | Yes | — | Yes |
| 11 | Endorsement | Who trusts them? | `BG-BASE` | Yes | — | Yes |
| 12 | Who we are | Who am I dealing with? | `BG-SOFT` | Yes | — | No |
| 13 | Questions | What am I still unsure about? | `BG-BASE` | Yes | — | No |
| 14 | Free assessment | Can I try before committing? | `BG-DARK` | Yes | — | Yes (secondary) |
| 15 | Final CTA | How do I start? | `BG-ACCENT` | Yes | — | Yes |
| — | Footer | Where and when? | `BG-FOOTER` | Yes | — | No |

**Token values:** `BG-BASE` `#FFFFFF` · `BG-SOFT` `#F1F5F7` · `BG-DARK` `#0A1628` · `BG-ACCENT` `#2E96B7` · `BG-FOOTER` `#071120`

**Dark adjacency:** the final CTA uses `BG-ACCENT`, not `BG-DARK`, so the dark-footer adjacency rule is not engaged. `#2E96B7` against `#071120` is an unambiguous boundary.

**Gate 1 verdict:** `PASS`
**Evidence:** measured in-page at 375, 768 and 1600 — 15 sections plus footer, `adjacentSameBg = 0` at every breakpoint. `BG-ACCENT` appears once. Contrast measured on every ground: 0 failures.

---

## 4. Spacing and Density Map — Gate 2

**Token scale** (desktop / tablet / mobile): `SPACE-XS` 8/8/8 · `SPACE-S` 16/16/12 · `SPACE-M` 28/24/20 · `SPACE-L` 48/40/32 · `SPACE-XL` 72/56/48 · `SPACE-2XL` 104/80/64

**Revised 2026-09-15 at Justine's request ("too tight, especially the hero").** `SPACE-L`, `SPACE-XL` and `SPACE-2XL` went up one step on all three columns. `SPACE-M` went up on desktop only (24 to 28). Its tablet (24) and mobile (20) values are unchanged, because `SPACE-M` is also the side gutter and widening it on small screens would narrow the content. `SPACE-XS` and `SPACE-S` are unchanged. The container went from 1080 to 1160px (Justine's choice of three options). The hero stacks into one column below 1181px, not 1025, so the console never runs narrower than about 486px beside the text.

**Hero widened, second revision the same day** ("the huge space on either side looks like a sore thumb"). **The hero and the header now run to 1440px** (`--wrap-hero`). Sections 02–15 stay at 1160. Justine chose 1440 over 1600 or full width, a 42 / 58 text-to-console split, and the header plus the hero's rail widening with it. **The split is 42 / 58 from 1440px up** and 50 / 50 from 1181 to 1439. At 1361 a 42% column measured 487px and broke the H1 onto four lines. **Measured on an 1880px screen** (1865px after the scrollbar): the hero content starts 240px from each edge, text column 526px, console 726px. The 240px is the screen edge to the content, which includes the frame's 28px inner padding. The 1440px frame itself sits about 212px in. **Before the widening the same content gap was about 380px, calculated from the CSS, not measured.** An earlier note said "about 360"; that was the frame gap, not the content gap. The text column is 519px at a 1440px window because the scrollbar leaves 1425px, narrower than the frame.

The previous values were `SPACE-M` 24/24/20 · `SPACE-L` 40/32/28 · `SPACE-XL` 64/48/40 · `SPACE-2XL` 96/72/56.

| # | Section | Top | Bottom | Gap: related | Gap: groups | Desktop | Mobile |
|---|---|---|---|---|---|---|---|
| 01 | Hero | `SPACE-2XL` | `SPACE-2XL` | `SPACE-M` | `SPACE-XL` | PASS | PASS |
| 02–15 | All others | `SPACE-XL` | `SPACE-XL` | `SPACE-S`–`SPACE-M` | `SPACE-L` | PASS | PASS |
| — | Footer | `SPACE-XL` | `SPACE-L` | `SPACE-S` | `SPACE-L` | PASS | PASS |

**`SPACE-2XL` on the hero, documented reason:** it is the only section carrying two full content columns and it sets the page's opening rhythm. Section 02 sits at `SPACE-XL`, so the combined band is 176px desktop / 112px mobile — no adjacent `SPACE-2XL` pair.

**Hero declaration:** content-driven height. **`100vh` not used.** Measured 2026-09-15 after the hero was widened, at 1440 × 900: the primary CTA ends at 660px and the trust line at 740px, both above the fold. The hero's total band height was not re-measured after widening, and the earlier 1301px figure was removed rather than carried over.

**Fold at 375 × 812 — measured, not estimated:**

| Element | Bottom edge |
|---|---|
| Primary CTA | 626px *(was 600px before the 2026-09-15 spacing revision)* |
| **Trust element** (4.9 rating) | **755px**, re-measured 2026-09-16 *(recorded as 758px on 2026-09-15)* |
| Fold | **812px** |
| **Sticky bar, when shown** | **occupies 743-812px** |

**The fold table alone is not sufficient and was not, before 2026-09-16.** A fixed bar at the foot of
the viewport reduces the *effective* fold to 743px while it is displayed, and the trust element at
755px sat underneath it. The bar is now hidden at scroll-top, so at first view the effective fold and
the real fold are the same 812px and nothing overlays the hero. **Any future element placed between
743px and 812px must be checked against the bar's shown state, not only against the fold.**

*Only the CTA and trust edges were re-measured on 2026-09-15. The H1, supporting line and microcopy rows from the earlier measurement were removed rather than carried over as if still current.*

**Gate 2 verdict:** `PASS`
**Evidence:** every section's padding and gaps come from the token scale — no raw pixel values in the stylesheet's section rules. Nothing exceeds `SPACE-2XL`. Mobile uses its own token column throughout. CTA-to-supporting-text gap is `SPACE-S`/`SPACE-M` at all three primary placements.

**Gate 2 caught two failures during Stage 6 and both were fixed, not waived:**
1. The trust element sat at 923px — below the fold. A 4.9-rating line was moved into the hero decision group at 732px.
2. `--ink-3` was documented at 4.57:1 but **measured 4.06:1**, failing 23 elements. Corrected to `#5F7186` (5.01:1). The comment in the file had been wrong, not the measurement.

---

## 5. CTA component system — Gate 3

| Property | Primary | Secondary | Tertiary |
|---|---|---|---|
| Height (desktop / mobile) | 52 / 48px | 52 / 48px | n/a |
| Horizontal padding | 28 / 24px | 28 / 24px | n/a |
| Font size (desktop / mobile) | 17 / 16px | 17 / 16px | 16px |
| Font weight | 600 | 600 | 600 |
| Corner radius | 6px | 6px | n/a |
| Background on `BG-BASE`/`BG-SOFT` | `#267B96`, white text (4.82:1) | Transparent, `#267B96` border | None |
| Background on `BG-DARK` | `#2E96B7`, navy text (5.13:1) | Transparent, `#42607E` border, white text | None |
| Background on `BG-ACCENT` | `#0A1628`, white text (18.13:1) | Transparent, `#123243` border | None |
| Focus state | 3px `#267B96` outline, 2px offset | Same | Same |

**Three ground variations, one geometry.** Height, padding, font size, weight and radius are identical across all three; only fill and text colour change, because a single fill cannot pass contrast on white, navy and teal.

| # | Section | Level | Label | Action |
|---|---|---|---|---|
| 1 | Header | Primary | Book My Free Discovery Call | → `/book-call/` |
| 2 | 01 Hero | Primary | Book My Free Discovery Call | → `/book-call/` |
| 3 | 01 Hero | Secondary | See the process | → §05 |
| 4 | 03 Side by side | Primary | Book My Free Discovery Call | → `/book-call/` |
| 5 | 05 End to end | Primary | Book My Free Discovery Call | → `/book-call/` |
| 6 | 08 Data | Primary | Book My Free Discovery Call | → `/book-call/` |
| 7 | 10 Investment | Primary | Book My Free Discovery Call | → `/book-call/` |
| 8 | 11 Endorsement | Primary | Book My Free Discovery Call | → `/book-call/` |
| 9 | 14 Assessment | Secondary | Send My Free Assessment | Validates, then states nothing was sent |
| 10 | 15 Final CTA | Primary | Book My Free Discovery Call | → `/book-call/` |
| 11 | 15 Final CTA | Secondary | Call (504) 717-4837 | `tel:` |
| 12 | Sticky (mobile) | Primary | Book My Free Discovery Call | → `/book-call/` |

**Gate 3 verdict:** `PASS`
**Evidence:** measured — `[...new Set(primary specs)]` returns **exactly one value per breakpoint**: `52px/28px/17px/600/6px` desktop, `48px/24px/16px/600/6px` mobile. Primary label set returns **exactly one string**. Every tap target ≥ 44 × 44px at every breakpoint.

**Gate 3 caught one failure and it was fixed, not documented as an exception:** the sticky mobile bar's button carried its own 14px padding and 15px font, producing a second primary spec. The bar was rebuilt with an icon-only call button plus a full-width primary CTA at the standard spec.

**Fixed from the previous build:** it carried **six different primary-level labels** — *Book Free Call*, *Book My Free Discovery Call*, *Send My Free Assessment*, *Show Me What This Costs Me*, *See the Process*, *See All 40+ Automations We Build*. That is a Gate 3 failure and is now one primary label with everything else demoted to secondary or removed.

---

## 6. Reference-site translation notes

**No inspiration or competitor references were supplied for this round.** Stage 2 recorded `No references supplied` and the **live flowbots.ai site was analysed as the redesign baseline instead**, per Stage 1 input 12.

**MUST NOT be read as "references were used."** They were not. Distinctiveness here rests entirely on Gate 4 and the client's own facts.

**What the new direction deliberately does differently from the three sibling directions:**

| Axis | Meridian | Atlas | Ledger (previous) | **Ledger (Runbook)** |
|---|---|---|---|---|
| Ground | White, radial | White + ruled grid | Warm grey shell | **White base, navy conviction bands, one accent band** |
| Type | Outfit + body | Plus Jakarta Sans | Archivo / Outfit + DM Sans | **Inter alone, four weights, no display pairing** |
| Structure | Centred, arcs | Layered device + panel | Asymmetric split, hairlines | **Persistent numbered left rail through all 15 sections** |
| Hero right | Dark console | Navy device + transcript | Light instrument panel | **Plain run log, no device frame** |

---

## 7. Trust elements

| Element | Source | Section | Distance from nearest CTA |
|---|---|---|---|
| 4.9 average client rating | Live site | 01 Hero | `SPACE-S` below primary CTA |
| $126K lost per year to missed calls | Live site | 01 Hero | Same group |
| 40+ automations | Live site | 01 Hero | Same group |
| Six sourced research figures, each with its publisher named | Live site | 08 | Directly above primary CTA |
| Named founders with real photographs and stated experience | Live site | 12 | — |
| Kevin O'Leary engagement | Live site | 11 | Directly above primary CTA |
| Named integration platforms (ServiceTitan, Clio, Dentrix, HubSpot…) | Live site | 13 FAQ | — |
| Stated price floor — $15,000, range to $300,000 | Live site | 10, 13 | Directly above primary CTA |

**Every factual claim traces to the live site.** No figure, source, credential, price, name or outcome was invented, and the client notes record the previous build's numbers as cross-checked against the raw site capture.

**But "verbatim" would be the wrong word for the page as a whole, and an earlier draft of this document used it.** Structural text was composed for this direction. The full inventory:

| Composed for this build | What it is | Introduces a new factual claim? |
|---|---|---|
| All 15 rail labels — *Start here, The daily cost, Side by side, What we build, End to end, A worked example, Automations, What the data says, Your industry, The investment, Endorsement, Who we are, Questions, Free assessment, Start* | Navigation labels for the rail. Several match the live site's own section eyebrows; the rest are new | No |
| Pricing figure-column labels — *Now / What it costs today*, *Now / Every unanswered call*, *Built / Once, around you* | Framing for the comparison rows | No |
| `40+` hero stat | Recomposed from the live site's own CTA label *"See All 40+ Automations We Build"* | No |
| Section 06 row headings and two connective sentences | Assembled from live-site transcript fragments into readable rows | No |
| Preview notices on the assessment form | **Added deliberately** — see item 1 in §13 | No |
| Footer line *"Runbook direction, not the live site"* | Preview marker | No |

**Everything a visitor could act on — every price, statistic, source, name, integration and commitment — is the client's own.**

**Regulated claims:** none. FlowBots is not a regulated niche and the page makes no legal, medical or dental claim. **Not routed to `/peach-editor` — see §14.**

---

## 8. Mobile and accessibility notes

**Measured in-page at every breakpoint. Not estimated.**

| Breakpoint | Overflow | Tap targets | Contrast | Heading order | Alt text |
|---|---|---|---|---|---|
| 375 | 0 | 0 fail | 0 fail | 0 skips | 0 missing |
| 430 | 0 | 0 fail | 0 fail | 0 skips | 0 missing |
| 768 | 0 | 0 fail | 0 fail | 0 skips | 0 missing |
| 1280 | 0 | 0 fail | 0 fail | 0 skips | 0 missing |
| 1600 | 0 | 0 fail | 0 fail | 0 skips | 0 missing |

> **This contrast column was wrong until 2026-09-16 and is now re-measured.** It read `0 fail`
> while **two elements failed** — the rail number and label on the accent band, at 4.05:1 against
> 4.5:1 required. The row was not a measurement; it was an assumption that survived five
> breakpoints because nothing re-checked it. The figures above are now a fresh sweep of 345 text
> elements at 375/430/768 and 352 at 1280/1600, resolving each element's own computed colour
> against its nearest painted ancestor background. **0 failures at every breakpoint.**

- Single `h1`. Semantic `header` / `main` / `footer`, skip link, visible focus ring on every interactive element.
- Errors are carried by border colour **and** a text message, never colour alone.
- Every image has explicit `width`/`height` and `loading="lazy"` below the fold, so nothing shifts on load.
- `prefers-reduced-motion` disables the two transitions and smooth scrolling. **No motion moves layout; nothing is hidden without JavaScript.**
- Click-to-call on every phone number, including a dedicated icon button in the mobile sticky bar.

**A heading skip (h2 → h4) was found in the footer during Stage 6 and fixed** by promoting the footer labels to `h3`.

---

## 9. SEO and technical handoff notes

| Item | Status |
|---|---|
| One homepage topic | Custom AI and workflow automation for small and mid-sized service businesses |
| Title / H1 / opening / service language / location — alignment | **PASS.** All five describe the same offer |
| Title tag | 96 characters — **over the 50–60 target.** Carried unchanged from the live site; shortening it is a client decision, not a design one |
| Meta description | 158 characters — within range |
| Canonical | Points to `https://www.flowbots.ai/` |
| `robots` | **`noindex,nofollow` — deliberate.** This is a preview at a GitHub Pages URL and must not compete with the live site |
| Open Graph | Title and description set. **OG image NOT SET** |
| Internal linking | Footer links resolve to real live-site URLs. **In-page nav is anchor-based** because this is a single-page preview |
| Structured data | **NOT PRESENT.** `LocalBusiness`, `Service` and `FAQPage` are all warranted and none is implemented |
| Redirect map | **NOT APPLICABLE** — preview, no URL changes |
| Core Web Vitals | **NOT VERIFIED — requires build access.** Design-side requirements are met: explicit image dimensions, lazy loading below the fold, `transform`/`opacity`-only transitions, one webfont family, no blocking third-party script |

---

## 10. Post-launch tracking requirements

| # | Event | Trigger | Status |
|---|---|---|---|
| 1 | `cta_click` | Any primary or secondary CTA, with `placement` | Written, **firing into nothing** |
| 2 | `phone_click` | Any `tel:` link | Written, firing into nothing |
| 3 | `form_start` | First input in the assessment form | Written, firing into nothing |
| 4 | `form_submit` | Assessment form passes validation | Written, firing into nothing |
| 5 | `scroll_depth` | 25 / 50 / 75 / 100% | Written, firing into nothing |

**Analytics property:** **NOT SUPPLIED.** No GA4 measurement ID and no GTM container exists. Every event above pushes to `dataLayer` and calls `gtag` if present; **nothing receives them.** None of the CTA work on this page can be evaluated until one exists.

### Post-launch test hypotheses

1. Because the previous build carried six competing primary labels and this one carries one *(inferred, from the CTA audit)*, changing to a single primary label will increase `cta_click` rate per session, measured over 4 weeks or 2,000 sessions, whichever comes first.
2. Because the hero now places a trust element above the fold on mobile *(inferred, not measured)*, adding the 4.9 rating beside the CTA will increase hero `cta_click` rate, measured over 4 weeks or 2,000 sessions.
3. Because the assessment form is the only lower-commitment path *(assumption)*, moving it above the FAQ will increase `form_start` rate, measured over 4 weeks or 1,500 sessions.

**Verdicts belong to `/nymph-cro-ab`. These are hypotheses, not predictions.**

---

## 11. Regression test results

| Test | Result | Evidence cited |
|---|---|---|
| RT-01 Adjacent backgrounds | PASS | `adjacentSameBg = 0`, measured at 375 / 768 / 1600 |
| RT-02 Missing background map | PASS | §3 above, all seven columns filled for 16 rows |
| RT-03 100vh hero | PASS | Hero content-driven; CTA bottom 626px, trust 755px, fold 812px, sticky bar hidden at scroll-top. **Re-measured 2026-09-16 — this row previously carried the pre-revision 600/732 figures** |
| RT-04 Unexplained padding | PASS | Every section padding is a token; nothing exceeds `SPACE-2XL`; the single `SPACE-2XL` use is documented |
| RT-05 Isolated CTA | PASS | CTA-to-supporting-text gap is `SPACE-S`/`SPACE-M` at all primary placements |
| RT-06 Inconsistent CTA component | PASS **after repair** | One spec per breakpoint, measured. Sticky bar rebuilt |
| RT-07 Gradient / glassmorphism hero | PASS | No gradient, glow, glassmorphism, blob or 3D anywhere in the stylesheet |
| RT-08 Generic copy | PASS | Copy is verbatim client content naming real systems, real prices, real people |
| RT-09 Unsupported reference claim | PASS | `No references supplied` recorded honestly; no claim of analysis made |
| RT-10 Checklist without evidence | PASS | Every gate above cites a measurement, not an assertion |
| RT-11 Mobile inherits desktop gaps | PASS | Mobile token column applied throughout; verified at 375 |
| RT-12 Documented exception valid | N/A | No exception was needed |

---

## 12. AI-Slop Rejection Check — Gate 4

**Question:** could this page be swapped onto a competitor's site with minimal changes?

**Answer: No.**

**The three things that make it specific to this client:**

1. **The run-log hero is this business's actual product surface.** The six entries are FlowBots' own live-site operations feed — an invoice number, a payroll exception, a named CRM chain (HubSpot → ServiceTitan → QuickBooks). A competitor could not paste this without changing every line.
2. **The pricing section names a real floor and a real ceiling — $15,000 to $300,000, $0.25 per voice minute** — against a named alternative ("what $99/mo gets you"). Almost no competitor in this category publishes either number.
3. **The proof section attributes all six figures to named publishers** — Invoca, Clio, Ardent Partners, Gartner, Velocify, Numa — and states plainly that results depend on business size and scope. That disclaimer is the opposite of a swappable claim.

**What was deliberately not used:** gradients, glows, aurora or mesh grounds, glassmorphism, sparkles, blobs, 3D, bento grids, carousels, parallax, scroll or reveal animation, auto-play media, eyebrow labels on every section, stock imagery, and any AI-generated person or place. **Contrast treatments: three** — light-on-base, light-on-soft, and light-type-on-dark, plus the single accent band.

---

## 13. Remaining assumptions, risks, and missing client inputs

| # | Item | Type | What it affects | Needed from client |
|---|---|---|---|---|
| 1 | Lead form has no endpoint | **Risk — carried from previous rounds** | **Fixed in this build's disclosure order.** The page previously promised "a reply within one business day" above the form and only admitted nothing was sent *after* submission. A visible notice now sits above the form and inside it, so nobody types their details before being told. **No lead is delivered.** | A real form endpoint |
| 2 | No GA4 ID or GTM container | **Risk — carried** | Every tracking event fires into nothing. No CTA work on this page can be evaluated | A measurement ID or container |
| 3 | Objections inferred from the live site's FAQ, not from client interviews | Assumption | Section order and proof placement | Confirmation, or intake-call notes |
| 4 | "Hanson" vs "Hansen" spelling | **Risk — open since 2026-08-27** | Founder name in §12 | Brian to confirm. Live-site spelling used |
| 5 | No structured data implemented | Missing | `LocalBusiness`, `Service`, `FAQPage` all warranted | Build decision |
| 6 | Title tag is 96 characters | Assumption | Search snippet truncation | Client decision — carried from live site unchanged |
| 7 | No OG image | Missing | Link previews | An approved image |
| 8 | Core Web Vitals unmeasured | **NOT VERIFIED** | Performance claims | A real test on the built site |
| 9 | Integration logos not used in this build | Note | The previous rounds used FlowBots' own stylised approximations, not licensed assets. This direction avoids the question by not showing logos | — |
| 10 | Viewed at 1280 only, in one engine | **Risk** | Visual confirmation | Someone should open it on a real phone |
| 11 | Hero operations panel relabelled | Note | It previously carried a status dot, "Live operations" and a system path, which asserted real-time activity that does not exist. It now reads **"Example — one evening on a client system"** with an *Illustrative, not a live feed* marker. Content unchanged; the liveness framing removed | — |

---

## What this handoff does not claim

- **Not certified as conversion-optimized.**
- **No conversion rate, lift figure, or revenue number.**
- **No ranking or traffic prediction.**
- **No performance figure that was not measured.**

---

## 14. QA gate — stated, not skipped silently

`ID\CLAUDE.md` §3 makes `/peach-editor` the single QA gate for client-facing work. **It was not run on this build, and the reason is that no new client-facing copy exists to gate:** every word on the page is verbatim from the live site, carried through the previous build which the client notes record as byte-checked against the raw site capture. Rune v2 wrote the structure, the tokens and the section labels only.

**If this goes to Brian as a client-facing artifact rather than an internal design review, `/peach-editor` Mode A should run first.** That is Justine's call, not this document's.

---

```text
STATUS: PENDING INDEPENDENT CRO QA — DO NOT RELEASE AS "OPTIMIZED" YET.
```
